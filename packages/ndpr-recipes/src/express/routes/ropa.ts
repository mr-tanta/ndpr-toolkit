import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';
import {
  isRecord,
  normalizeProcessingRecordInput,
  processingRecordCreateData,
  processingRecordFromRow,
  runSerializableTransaction,
  toInputJson,
} from '../../nextjs/shared-contracts';

const prisma = new PrismaClient();
export const ropaRouter = Router();
const STATUSES = new Set(['active', 'inactive', 'archived']);

/** Staff-only tenant ROPA list using complete record snapshots. */
ropaRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const status = typeof request.query.status === 'string' ? request.query.status : undefined;
  if (status && !STATUSES.has(status)) {
    return response.status(400).json({ error: 'Unsupported processing-record status' });
  }
  const rows = await prisma.processingRecord.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
  try {
    return response.json(rows.map(processingRecordFromRow));
  } catch {
    return response.status(409).json({
      error: 'A processing record is missing its lossless snapshot.',
      remediation: 'Run the reviewed schema migration/backfill before using this route.',
    });
  }
});

/** Create complete processing state and audit it atomically. */
ropaRouter.post('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const validation = normalizeProcessingRecordInput(request.body);
  if (!validation.valid) {
    return response.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }
  const tenantId = context.tenantId;
  const record = validation.data;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const row = await prisma.$transaction(async (transaction) => {
    const created = await transaction.processingRecord.create({
      data: processingRecordCreateData(tenantId, record),
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'ropa',
        action: 'created',
        entityId: created.id,
        entityType: 'ProcessingRecord',
        changes: toInputJson({
          status: record.status,
          lawfulBasis: record.lawfulBasis,
          snapshotStored: true,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return created;
  });
  return response.status(201).json(processingRecordFromRow(row));
});

/** Update only explicit ProcessingRecord contract fields. */
ropaRouter.patch('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });
  if (!isRecord(request.body) || typeof request.body.id !== 'string' || !request.body.id.trim()) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: { id: 'id is required in the request body.' },
    });
  }

  const id = request.body.id.trim();
  const tenantId = context.tenantId;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.processingRecord.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };
    let current;
    try {
      current = processingRecordFromRow(existing);
    } catch {
      return { kind: 'snapshot-missing' as const };
    }
    const validation = normalizeProcessingRecordInput(request.body, current);
    if (!validation.valid) return { kind: 'invalid' as const, fields: validation.fields };

    const createData = processingRecordCreateData(tenantId, validation.data);
    const { tenantId: _tenantId, id: _id, removedAt: _removedAt, ...updateData } = createData;
    const updated = await transaction.processingRecord.update({
      where: { tenantId_id: { tenantId, id } },
      data: updateData,
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'ropa',
        action: 'updated',
        entityId: id,
        entityType: 'ProcessingRecord',
        changes: toInputJson({
          status: validation.data.status,
          lawfulBasis: validation.data.lawfulBasis,
          snapshotStored: true,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return { kind: 'updated' as const, row: updated };
  });

  if (!transactionResult.committed) {
    return response.status(409).json({
      error: 'Concurrent processing-record update conflict; retry the request.',
    });
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') return response.status(404).json({ error: 'Processing record not found' });
  if (result.kind === 'snapshot-missing') {
    return response.status(409).json({
      error: 'Processing record requires snapshot migration/backfill before update.',
    });
  }
  if (result.kind === 'invalid') {
    return response.status(400).json({ error: 'Validation failed.', fields: result.fields });
  }
  return response.json(processingRecordFromRow(result.row));
});

/** Archive a record while retaining its complete evidence snapshot. */
ropaRouter.delete('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const id = typeof request.query.id === 'string' ? request.query.id : undefined;
  if (!id) return response.status(400).json({ error: 'id query parameter is required' });
  const tenantId = context.tenantId;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.processingRecord.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };
    let current;
    try {
      current = processingRecordFromRow(existing);
    } catch {
      return { kind: 'snapshot-missing' as const };
    }
    const archived = { ...current, status: 'archived' as const, updatedAt: Date.now() };
    const updated = await transaction.processingRecord.update({
      where: { tenantId_id: { tenantId, id } },
      data: {
        status: 'archived',
        updatedAt: new Date(archived.updatedAt),
        recordData: toInputJson(archived),
      },
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'ropa',
        action: 'archived',
        entityId: id,
        entityType: 'ProcessingRecord',
        changes: toInputJson({ priorStatus: current.status }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return { kind: 'archived' as const, row: updated };
  });

  if (!transactionResult.committed) {
    return response.status(409).json({
      error: 'Concurrent processing-record archive conflict; retry the request.',
    });
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') return response.status(404).json({ error: 'Processing record not found' });
  if (result.kind === 'snapshot-missing') {
    return response.status(409).json({
      error: 'Processing record requires snapshot migration/backfill before archive.',
    });
  }
  return response.json({ success: true, record: processingRecordFromRow(result.row) });
});
