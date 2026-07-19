import { PrismaClient, type DPIARecord } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';
import {
  dpiaCreateData,
  dpiaStateFromRow,
  isRecord,
  normalizeDpiaInput,
  runSerializableTransaction,
  toInputJson,
} from '../../../shared-contracts';

const prisma = new PrismaClient();
const STATUSES = new Set(['draft', 'in_progress', 'completed', 'approved', 'rejected']);

/** Staff-only tenant DPIA list or ID lookup. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    const row = await prisma.dPIARecord.findFirst({
      where: { tenantId: context.tenantId, id, removedAt: null },
    });
    if (!row) return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
    return NextResponse.json(dpiaResponse(row));
  }

  const status = request.nextUrl.searchParams.get('status');
  if (status && !STATUSES.has(status)) {
    return NextResponse.json({ error: 'Unsupported DPIA status' }, { status: 400 });
  }
  const rows = await prisma.dPIARecord.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(rows.map(dpiaResponse));
}

/** Create a lossless DPIA snapshot with server-derived conductor/approver. */
export async function POST(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const validation = normalizeDpiaInput(
    await parseJson(request),
    context.actor as NonNullable<typeof context.actor>,
  );
  if (!validation.valid) return validationResponse(validation.fields);

  const tenantId = context.tenantId;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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
  return NextResponse.json(dpiaResponse(row), { status: 201 });
}

/** Update only allowlisted DPIA result fields; actor fields are ignored. */
export async function PUT(request: NextRequest) {
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
    const existing = await transaction.dPIARecord.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };
    const validation = normalizeDpiaInput(
      parsed,
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
    return NextResponse.json(
      { error: 'Concurrent DPIA update conflict; retry the request.' },
      { status: 409 },
    );
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') {
    return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
  }
  if (result.kind === 'invalid') return validationResponse(result.fields);
  return NextResponse.json(dpiaResponse(result.row));
}

/** Soft-remove a tenant DPIA and audit the transition atomically. */
export async function DELETE(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return validationResponse({ id: 'id query parameter is required.' });
  const tenantId = context.tenantId;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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
    return NextResponse.json(
      { error: 'Concurrent DPIA removal conflict; retry the request.' },
      { status: 409 },
    );
  }
  const removed = transactionResult.value;
  if (!removed) return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

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
