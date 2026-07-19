import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';
import {
  isRecord,
  normalizeProcessingRecordInput,
  processingRecordCreateData,
  processingRecordFromRow,
  runSerializableTransaction,
  toInputJson,
} from '../../../shared-contracts';

const prisma = new PrismaClient();
const STATUSES = new Set(['active', 'inactive', 'archived']);

/** Staff-only, tenant-scoped list of lossless processing-record snapshots. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const status = request.nextUrl.searchParams.get('status');
  if (status && !STATUSES.has(status)) {
    return NextResponse.json({ error: 'Unsupported processing-record status' }, { status: 400 });
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
    return NextResponse.json(rows.map(processingRecordFromRow));
  } catch (error) {
    return NextResponse.json(
      {
        error: 'A processing record is missing its lossless snapshot.',
        remediation: 'Run the reviewed schema migration/backfill before using this route.',
      },
      { status: 409 },
    );
  }
}

/** Create one complete processing activity and its audit event atomically. */
export async function POST(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const validation = normalizeProcessingRecordInput(await parseJson(request));
  if (!validation.valid) return validationResponse(validation.fields);
  const tenantId = context.tenantId;
  const record = validation.data;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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
  return NextResponse.json(processingRecordFromRow(row), { status: 201 });
}

/** Update only the documented ProcessingRecord contract fields. */
export async function PATCH(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const parsed = await parseJson(request);
  if (!isRecord(parsed) || typeof parsed.id !== 'string' || !parsed.id.trim()) {
    return validationResponse({ id: 'id is required in the request body.' });
  }
  const id = parsed.id.trim();
  const tenantId = context.tenantId;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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
    const validation = normalizeProcessingRecordInput(parsed, current);
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
    return NextResponse.json(
      { error: 'Concurrent processing-record update conflict; retry the request.' },
      { status: 409 },
    );
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') {
    return NextResponse.json({ error: 'Processing record not found' }, { status: 404 });
  }
  if (result.kind === 'snapshot-missing') {
    return NextResponse.json(
      { error: 'Processing record requires snapshot migration/backfill before update.' },
      { status: 409 },
    );
  }
  if (result.kind === 'invalid') return validationResponse(result.fields);
  return NextResponse.json(processingRecordFromRow(result.row));
}

/** Archive a processing activity without deleting its evidence. */
export async function DELETE(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return validationResponse({ id: 'id query parameter is required.' });
  const tenantId = context.tenantId;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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
    return NextResponse.json(
      { error: 'Concurrent processing-record archive conflict; retry the request.' },
      { status: 409 },
    );
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') {
    return NextResponse.json({ error: 'Processing record not found' }, { status: 404 });
  }
  if (result.kind === 'snapshot-missing') {
    return NextResponse.json(
      { error: 'Processing record requires snapshot migration/backfill before archive.' },
      { status: 409 },
    );
  }
  return NextResponse.json({ success: true, record: processingRecordFromRow(result.row) });
}

function validationResponse(fields: Record<string, string>) {
  return NextResponse.json({ error: 'Validation failed.', fields }, { status: 400 });
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
