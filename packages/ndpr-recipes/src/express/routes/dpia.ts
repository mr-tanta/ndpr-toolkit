import { PrismaClient, type DPIARecord } from '@prisma/client';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';
import {
  dpiaCreateData,
  dpiaStateFromRow,
  normalizeDpiaInput,
  runSerializableTransaction,
  toInputJson,
} from '../../nextjs/shared-contracts';

const prisma = new PrismaClient();
export const dpiaRouter = Router();
const STATUSES = new Set(['draft', 'in_progress', 'completed', 'approved', 'rejected']);

/** Staff-only tenant DPIA list. */
dpiaRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const status = typeof request.query.status === 'string' ? request.query.status : undefined;
  if (status && !STATUSES.has(status)) {
    return response.status(400).json({ error: 'Unsupported DPIA status' });
  }
  const rows = await prisma.dPIARecord.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return response.json(rows.map(dpiaResponse));
});

/** Read one tenant DPIA. */
dpiaRouter.get('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const row = await prisma.dPIARecord.findFirst({
    where: {
      tenantId: context.tenantId,
      id: request.params.id,
      removedAt: null,
    },
  });
  if (!row) return response.status(404).json({ error: 'DPIA record not found' });
  return response.json(dpiaResponse(row));
});

/** Create lossless DPIA state with derived conductor and risk score. */
dpiaRouter.post('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const validation = normalizeDpiaInput(
    request.body,
    context.actor as NonNullable<typeof context.actor>,
  );
  if (!validation.valid) return validationResponse(response, validation.fields);

  const tenantId = context.tenantId;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const row = await prisma.$transaction(async (transaction) => {
    const created = await transaction.dPIARecord.create({
      data: dpiaCreateData(tenantId, validation.data),
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'dpia',
        action: 'created',
        entityId: created.id,
        entityType: 'DPIARecord',
        changes: toInputJson({
          status: created.status,
          overallRisk: created.overallRisk,
          derivedRiskScore: created.score,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return created;
  });
  return response.status(201).json(dpiaResponse(row));
});

/** Update allowlisted DPIA fields; body conductor/approver values are ignored. */
dpiaRouter.put('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const tenantId = context.tenantId;
  const id = request.params.id;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.dPIARecord.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };
    const validation = normalizeDpiaInput(
      request.body,
      context.actor as NonNullable<typeof context.actor>,
      dpiaStateFromRow(existing),
    );
    if (!validation.valid) return { kind: 'invalid' as const, fields: validation.fields };

    const createData = dpiaCreateData(tenantId, validation.data);
    const { tenantId: _tenantId, id: _id, removedAt: _removedAt, ...updateData } = createData;
    const updated = await transaction.dPIARecord.update({
      where: { tenantId_id: { tenantId, id } },
      data: updateData,
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'dpia',
        action: 'updated',
        entityId: id,
        entityType: 'DPIARecord',
        changes: toInputJson({
          status: updated.status,
          overallRisk: updated.overallRisk,
          derivedRiskScore: updated.score,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return { kind: 'updated' as const, row: updated };
  });

  if (!transactionResult.committed) {
    return response.status(409).json({
      error: 'Concurrent DPIA update conflict; retry the request.',
    });
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') return response.status(404).json({ error: 'DPIA record not found' });
  if (result.kind === 'invalid') return validationResponse(response, result.fields);
  return response.json(dpiaResponse(result.row));
});

/** Soft-remove DPIA state and audit in one transaction. */
dpiaRouter.delete('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const tenantId = context.tenantId;
  const id = request.params.id;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.dPIARecord.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return false;
    await transaction.dPIARecord.update({
      where: { tenantId_id: { tenantId, id } },
      data: { removedAt: new Date() },
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'dpia',
        action: 'removed',
        entityId: id,
        entityType: 'DPIARecord',
        changes: toInputJson({ projectName: existing.projectName }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return true;
  });
  if (!transactionResult.committed) {
    return response.status(409).json({
      error: 'Concurrent DPIA removal conflict; retry the request.',
    });
  }
  const removed = transactionResult.value;
  if (!removed) return response.status(404).json({ error: 'DPIA record not found' });
  return response.json({ success: true });
});

function dpiaResponse(row: DPIARecord) {
  const state = dpiaStateFromRow(row);
  return {
    ...state.result,
    status: state.status,
    score: row.score,
    scoreSemantics: 'highest current risk score (residual score when present)',
    conductedBy: state.conductedBy,
    approvedBy: state.approvedBy,
  };
}

function validationResponse(
  response: { status(code: number): { json(value: unknown): unknown } },
  fields: Record<string, string>,
) {
  return response.status(400).json({ error: 'Validation failed.', fields });
}
