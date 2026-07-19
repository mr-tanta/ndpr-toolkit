import { PrismaClient } from '@prisma/client';
import {
  validateDsrSubmissionStructured,
  type DsrSubmissionPayload,
} from '@tantainnovative/ndpr-toolkit/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';
import {
  addOperationalDays,
  DSR_OPERATIONAL_TARGET_NOTICE,
  getDsrOperationalTargetDays,
  isRecord,
  jsonOrDbNull,
  normalizeDsrStatus,
  toInputJson,
} from '../../../shared-contracts';

const prisma = new PrismaClient();
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

/** Staff-only tenant list. Data subjects use the tenant/subject-scoped ID route. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const requestedStatus = request.nextUrl.searchParams.get('status');
  if (requestedStatus && !ALLOWED_STATUSES.has(requestedStatus)) {
    return NextResponse.json({ error: 'Unsupported DSR status' }, { status: 400 });
  }
  const statuses = requestedStatus === 'in_progress' || requestedStatus === 'inProgress'
    ? ['inProgress', 'in_progress']
    : requestedStatus
      ? [requestedStatus]
      : undefined;
  const requests = await prisma.dSRRequest.findMany({
    where: {
      tenantId: context.tenantId,
      removedAt: null,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { submittedAt: 'desc' },
  });
  return NextResponse.json(
    requests.map((item) => ({ ...item, status: normalizeDsrStatus(item.status) })),
  );
}

/** Submit a DSR for the verified subject capability/account. */
export async function POST(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const parsed = await parseJson(request);
  const submittedAt = Date.now();
  const validation = validateDsrSubmissionStructured(
    normalizeSubmission(parsed, submittedAt),
    { requireIdentityVerification: true, allowedRequestTypes: ALLOWED_TYPES },
  );
  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        fields: Object.fromEntries(
          validation.errors.map((error) => [error.field, error.message]),
        ),
      },
      { status: 400 },
    );
  }

  const data = validation.data;
  const description = isRecord(parsed) && typeof parsed.description === 'string'
    ? parsed.description.trim() || null
    : null;
  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const targetDays = getDsrOperationalTargetDays();
  const submittedDate = new Date(submittedAt);
  const dueAt = addOperationalDays(submittedDate, targetDays);
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

  const created = await prisma.$transaction(async (transaction) => {
    const row = await transaction.dSRRequest.create({
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
        entityId: row.id,
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
    return row;
  });

  return NextResponse.json(
    {
      ...created,
      operationalTarget: {
        days: targetDays,
        source: 'NDPR_DSR_TARGET_DAYS',
        notice: DSR_OPERATIONAL_TARGET_NOTICE,
      },
    },
    { status: 201 },
  );
}

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
    // Server receipt time is authoritative; client submittedAt is not evidence.
    submittedAt,
  };
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
