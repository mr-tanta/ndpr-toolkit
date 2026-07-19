import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';
import {
  breachCreateData,
  breachResponse,
  breachStateFromRow,
  createBreachStateRecord,
  runSerializableTransaction,
  toInputJson,
  updateBreachStateRecord,
} from '../../nextjs/shared-contracts';

const prisma = new PrismaClient();
export const breachRouter = Router();
const FILTER_STATUSES = new Set([
  'ongoing',
  'contained',
  'resolved',
  'investigating',
  'closed',
]);

/** Staff-only tenant breach register with complete nested evidence. */
breachRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const status = typeof request.query.status === 'string' ? request.query.status : undefined;
  if (status && !FILTER_STATUSES.has(status)) {
    return response.status(400).json({ error: 'Unsupported breach status' });
  }
  const storedStatuses = status === 'ongoing' || status === 'investigating'
    ? ['ongoing', 'investigating']
    : status === 'resolved' || status === 'closed'
      ? ['resolved', 'closed']
      : status
        ? [status]
        : undefined;
  const rows = await prisma.breachReport.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(storedStatuses ? { status: { in: storedStatuses } } : {}),
    },
    orderBy: { reportedAt: 'desc' },
  });
  return response.json(rows.map(breachResponse));
});

/** Create report, nested evidence, and audit entry atomically. */
breachRouter.post('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const validation = createBreachStateRecord(
    request.body,
    context.actor as NonNullable<typeof context.actor>,
  );
  if (!validation.valid) {
    return response.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const tenantId = context.tenantId;
  const state = validation.data;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const row = await prisma.$transaction(async (transaction) => {
    const created = await transaction.breachReport.create({
      data: breachCreateData(tenantId, state),
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'breach',
        action: 'reported',
        entityId: created.id,
        entityType: 'BreachReport',
        changes: toInputJson({
          category: state.report.category,
          status: state.report.status,
          assessmentCount: state.assessments.length,
          notificationEvidenceCount: state.notifications.length,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return created;
  });
  return response.status(201).json(breachResponse(row));
});

/** Fetch complete report plus full toolkit readiness result. */
breachRouter.get('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const row = await prisma.breachReport.findFirst({
    where: {
      tenantId: context.tenantId,
      id: request.params.id,
      removedAt: null,
    },
  });
  if (!row) return response.status(404).json({ error: 'Breach report not found' });
  return response.json(breachResponse(row));
});

/** Update report/evidence; severity and notification flags are derived. */
breachRouter.patch('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const tenantId = context.tenantId;
  const id = request.params.id;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.breachReport.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };
    const validation = updateBreachStateRecord(
      request.body,
      breachStateFromRow(existing),
      context.actor as NonNullable<typeof context.actor>,
    );
    if (!validation.valid) return { kind: 'invalid' as const, fields: validation.fields };

    const createData = breachCreateData(tenantId, validation.data);
    const { tenantId: _tenantId, id: _id, removedAt: _removedAt, ...updateData } = createData;
    const updated = await transaction.breachReport.update({
      where: { tenantId_id: { tenantId, id } },
      data: updateData,
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'breach',
        action: 'updated',
        entityId: id,
        entityType: 'BreachReport',
        changes: toInputJson({
          status: validation.data.report.status,
          assessmentCount: validation.data.assessments.length,
          notificationEvidenceCount: validation.data.notifications.length,
          derivedSeverity: updated.severity,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return { kind: 'updated' as const, row: updated };
  });

  if (!transactionResult.committed) {
    return response.status(409).json({
      error: 'Concurrent breach update conflict; retry the request.',
    });
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') {
    return response.status(404).json({ error: 'Breach report not found' });
  }
  if (result.kind === 'invalid') {
    return response.status(400).json({ error: 'Validation failed.', fields: result.fields });
  }
  return response.json(breachResponse(result.row));
});
