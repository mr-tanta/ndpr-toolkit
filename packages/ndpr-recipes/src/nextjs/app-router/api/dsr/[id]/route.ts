import { Prisma, PrismaClient, type DSRRequest as PrismaDSRRequest } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  isNDPRStaffContext,
  resolveNDPRRequestContext,
} from '../../../request-context';
import {
  isRecord,
  normalizeDsrStatus,
  runSerializableTransaction,
  toInputJson,
} from '../../../../shared-contracts';

const prisma = new PrismaClient();
const ALLOWED_STATUSES = new Set([
  'pending',
  'awaitingVerification',
  'inProgress',
  'in_progress',
  'completed',
  'rejected',
]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Read one request as verified staff or as its owning data subject. */
export async function GET(request: NextRequest, route: RouteContext) {
  const context = await resolveNDPRRequestContext(request);
  const tenantProblem = getNDPRContextProblem(context, 'tenant');
  if (tenantProblem) {
    return NextResponse.json({ error: tenantProblem.error }, { status: tenantProblem.status });
  }
  const staff = isNDPRStaffContext(context);
  if (!staff && !context.subjectId) {
    return NextResponse.json(
      { error: 'A verified data-subject or staff identity is required' },
      { status: 401 },
    );
  }

  const { id } = await route.params;
  const row = await prisma.dSRRequest.findFirst({
    where: {
      tenantId: context.tenantId,
      id,
      removedAt: null,
      ...(!staff ? { subjectId: context.subjectId as string } : {}),
    },
  });
  if (!row) return NextResponse.json({ error: 'DSR request not found' }, { status: 404 });
  return NextResponse.json(
    staff
      ? { ...row, status: normalizeDsrStatus(row.status) }
      : subjectDsrResponse(row),
  );
}

/** Staff-only workflow update with server-derived assignee and note author. */
export async function PATCH(request: NextRequest, route: RouteContext) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const body = await parseJson(request);
  if (!isRecord(body)) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: { body: 'Request body must be an object.' } },
      { status: 400 },
    );
  }
  const requestedStatus = body.status;
  if (requestedStatus !== undefined
    && (typeof requestedStatus !== 'string' || !ALLOWED_STATUSES.has(requestedStatus))) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: { status: 'Unsupported DSR status.' } },
      { status: 400 },
    );
  }
  const status = requestedStatus === 'in_progress' ? 'inProgress' : requestedStatus;
  const note = typeof body.internalNote === 'string'
    ? body.internalNote.trim()
    : typeof body.internalNotes === 'string'
      ? body.internalNotes.trim()
      : undefined;
  if ((body.internalNote !== undefined || body.internalNotes !== undefined) && !note) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: { internalNote: 'internalNote must be non-empty text.' } },
      { status: 400 },
    );
  }
  const assignToCurrentActor = body.assignToMe === true || body.assignedTo !== undefined;
  if (status === undefined && !note && !assignToCurrentActor) {
    return NextResponse.json(
      { error: 'Provide status, assignToMe, or internalNote.' },
      { status: 400 },
    );
  }

  const { id } = await route.params;
  const tenantId = context.tenantId;
  const actorId = context.actorId as string;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.dSRRequest.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return null;

    const now = new Date();
    const data: Prisma.DSRRequestUncheckedUpdateInput = { updatedAt: now };
    if (typeof status === 'string') {
      data.status = status;
      if (status === 'completed' && existing.status !== 'completed') {
        data.completedAt = now;
      } else if (status !== 'completed') {
        data.completedAt = null;
      }
    }
    if (assignToCurrentActor) data.assignedTo = actorId;
    if (note) {
      const currentNotes = Array.isArray(existing.internalNotes)
        ? existing.internalNotes as Array<Record<string, unknown>>
        : [];
      data.internalNotes = toInputJson([
        ...currentNotes,
        { timestamp: now.getTime(), author: actorId, note },
      ]);
    }

    const row = await transaction.dSRRequest.update({
      where: { tenantId_id: { tenantId, id } },
      data,
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'dsr',
        action: 'updated',
        entityId: id,
        entityType: 'DSRRequest',
        changes: toInputJson({
          status: typeof status === 'string' ? status : undefined,
          assignedToCurrentActor: assignToCurrentActor,
          internalNoteAdded: Boolean(note),
        }),
        performedBy: actorId,
        ipAddress,
      },
    });
    return row;
  });

  if (!transactionResult.committed) {
    return NextResponse.json(
      { error: 'Concurrent DSR update conflict; retry the request.' },
      { status: 409 },
    );
  }
  const updated = transactionResult.value;
  if (!updated) return NextResponse.json({ error: 'DSR request not found' }, { status: 404 });
  return NextResponse.json({ ...updated, status: normalizeDsrStatus(updated.status) });
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}


function subjectDsrResponse(row: PrismaDSRRequest) {
  return {
    id: row.id,
    type: row.type,
    status: normalizeDsrStatus(row.status),
    subjectName: row.subjectName,
    subjectEmail: row.subjectEmail,
    subjectPhone: row.subjectPhone,
    description: row.description,
    additionalInfo: row.additionalInfo,
    rejectionReason: row.rejectionReason,
    attachments: row.attachments,
    extensionRequested: row.extensionRequested,
    extensionReason: row.extensionReason,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
    verifiedAt: row.verifiedAt,
    completedAt: row.completedAt,
    dueAt: row.dueAt,
  };
}
