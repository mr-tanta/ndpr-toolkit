import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';
import {
  breachCreateData,
  breachResponse,
  createBreachStateRecord,
  toInputJson,
} from '../../../shared-contracts';

const prisma = new PrismaClient();
const FILTER_STATUSES = new Set([
  'ongoing',
  'contained',
  'resolved',
  'investigating',
  'closed',
]);

/** Staff-only tenant breach register with complete nested evidence. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const status = request.nextUrl.searchParams.get('status');
  if (status && !FILTER_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Unsupported breach status' }, { status: 400 });
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
  return NextResponse.json(rows.map(breachResponse));
}

/**
 * Create a lossless breach report. Reporter and assessment actor attributes
 * are derived from the verified staff context; direct actor/severity/
 * notification flags in the request are never trusted.
 */
export async function POST(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const parsed = await parseJson(request);
  const validation = createBreachStateRecord(parsed, context.actor as NonNullable<typeof context.actor>);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: validation.fields },
      { status: 400 },
    );
  }

  const tenantId = context.tenantId;
  const state = validation.data;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
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

  return NextResponse.json(breachResponse(row), { status: 201 });
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
