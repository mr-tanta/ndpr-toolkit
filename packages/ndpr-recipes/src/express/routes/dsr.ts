import { Prisma, PrismaClient, type DSRRequest as PrismaDSRRequest } from '@prisma/client';
import {
  validateDsrSubmissionStructured,
  type DsrSubmissionPayload,
} from '@tantainnovative/ndpr-toolkit/server';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  isNDPRStaffContext,
  resolveNDPRRequestContext,
} from '../request-context';
import {
  addOperationalDays,
  DSR_OPERATIONAL_TARGET_NOTICE,
  getDsrOperationalTargetDays,
  isRecord,
  jsonOrDbNull,
  normalizeDsrStatus,
  runSerializableTransaction,
  toInputJson,
} from '../../nextjs/shared-contracts';

const prisma = new PrismaClient();
export const dsrRouter = Router();
const ALLOWED_TYPES = [
  'information',
  'access',
  'rectification',
  'erasure',
  'restriction',
  'portability',
  'objection',
  'automated_decision_making',
  'withdraw_consent',
];
const ALLOWED_STATUSES = new Set([
  'pending',
  'awaitingVerification',
  'inProgress',
  'in_progress',
  'completed',
  'rejected',
]);

/** Staff-only tenant list. */
dsrRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const requestedStatus = typeof request.query.status === 'string' ? request.query.status : undefined;
  if (requestedStatus && !ALLOWED_STATUSES.has(requestedStatus)) {
    return response.status(400).json({ error: 'Unsupported DSR status' });
  }
  const statuses = requestedStatus === 'in_progress' || requestedStatus === 'inProgress'
    ? ['inProgress', 'in_progress']
    : requestedStatus
      ? [requestedStatus]
      : undefined;
  const rows = await prisma.dSRRequest.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { submittedAt: 'desc' },
  });
  return response.json(
    rows.map((item) => ({ ...item, status: normalizeDsrStatus(item.status) })),
  );
});

/** Submit a request for the verified subject; body subject IDs are ignored. */
dsrRouter.post('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const submittedAt = Date.now();
  const validation = validateDsrSubmissionStructured(
    normalizeSubmission(request.body, submittedAt),
    { requireIdentityVerification: true, allowedRequestTypes: ALLOWED_TYPES },
  );
  if (!validation.valid || !validation.data) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: Object.fromEntries(
        validation.errors.map((error) => [error.field, error.message]),
      ),
    });
  }

  const data = validation.data;
  const description = isRecord(request.body) && typeof request.body.description === 'string'
    ? request.body.description.trim() || null
    : null;
  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const targetDays = getDsrOperationalTargetDays();
  const submittedDate = new Date(submittedAt);
  const dueAt = addOperationalDays(submittedDate, targetDays);
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const row = await prisma.$transaction(async (transaction) => {
    const created = await transaction.dSRRequest.create({
      data: {
        tenantId,
        subjectId,
        type: data.requestType,
        status: 'pending',
        subjectName: data.dataSubject.fullName,
        subjectEmail: data.dataSubject.email,
        subjectPhone: data.dataSubject.phone ?? null,
        identifierType: data.dataSubject.identifierType,
        identifierValue: data.dataSubject.identifierValue,
        description,
        additionalInfo: jsonOrDbNull(data.additionalInfo),
        submittedAt: submittedDate,
        updatedAt: submittedDate,
        dueAt,
      },
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'dsr',
        action: 'submitted',
        entityId: created.id,
        entityType: 'DSRRequest',
        changes: toInputJson({
          type: data.requestType,
          status: 'pending',
          operationalTargetDays: targetDays,
          subjectId,
          subjectIdentitySource: context.subjectSource,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return created;
  });

  return response.status(201).json({
    ...row,
    operationalTarget: {
      days: targetDays,
      source: 'NDPR_DSR_TARGET_DAYS',
      notice: DSR_OPERATIONAL_TARGET_NOTICE,
    },
  });
});

/** Read one request as verified staff or its owning data subject. */
dsrRouter.get('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const tenantProblem = getNDPRContextProblem(context, 'tenant');
  if (tenantProblem) return response.status(tenantProblem.status).json({ error: tenantProblem.error });
  const staff = isNDPRStaffContext(context);
  if (!staff && !context.subjectId) {
    return response.status(401).json({ error: 'A verified data-subject or staff identity is required' });
  }

  const row = await prisma.dSRRequest.findFirst({
    where: {
      tenantId: context.tenantId,
      id: request.params.id,
      removedAt: null,
      ...(!staff ? { subjectId: context.subjectId as string } : {}),
    },
  });
  if (!row) return response.status(404).json({ error: 'DSR request not found' });
  return response.json(
    staff
      ? { ...row, status: normalizeDsrStatus(row.status) }
      : subjectDsrResponse(row),
  );
});

/** Staff-only update with server-derived assignee and note author. */
dsrRouter.patch('/:id', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });
  if (!isRecord(request.body)) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: { body: 'Request body must be an object.' },
    });
  }

  const body = request.body;
  const requestedStatus = body.status;
  if (requestedStatus !== undefined
    && (typeof requestedStatus !== 'string' || !ALLOWED_STATUSES.has(requestedStatus))) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: { status: 'Unsupported DSR status.' },
    });
  }
  const status = requestedStatus === 'in_progress' ? 'inProgress' : requestedStatus;
  const note = typeof body.internalNote === 'string'
    ? body.internalNote.trim()
    : typeof body.internalNotes === 'string'
      ? body.internalNotes.trim()
      : undefined;
  if ((body.internalNote !== undefined || body.internalNotes !== undefined) && !note) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: { internalNote: 'internalNote must be non-empty text.' },
    });
  }
  const assignToCurrentActor = body.assignToMe === true || body.assignedTo !== undefined;
  if (status === undefined && !note && !assignToCurrentActor) {
    return response.status(400).json({ error: 'Provide status, assignToMe, or internalNote.' });
  }

  const tenantId = context.tenantId;
  const id = request.params.id;
  const actorId = context.actorId as string;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
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
    return response.status(409).json({
      error: 'Concurrent DSR update conflict; retry the request.',
    });
  }
  const updated = transactionResult.value;
  if (!updated) return response.status(404).json({ error: 'DSR request not found' });
  return response.json({ ...updated, status: normalizeDsrStatus(updated.status) });
});

function normalizeSubmission(
  value: unknown,
  submittedAt: number,
): DsrSubmissionPayload | unknown {
  if (!isRecord(value)) return value;
  const nested = isRecord(value.dataSubject) ? value.dataSubject : {};
  return {
    requestType: value.requestType ?? value.type,
    dataSubject: {
      fullName: nested.fullName ?? value.subjectName,
      email: nested.email ?? value.subjectEmail,
      phone: nested.phone ?? value.subjectPhone,
      identifierType: nested.identifierType ?? value.identifierType,
      identifierValue: nested.identifierValue ?? value.identifierValue,
    },
    additionalInfo: value.additionalInfo,
    submittedAt,
  };
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
