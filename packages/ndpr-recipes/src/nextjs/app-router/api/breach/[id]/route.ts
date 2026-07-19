import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../../request-context';
import {
  breachCreateData,
  breachResponse,
  breachStateFromRow,
  runSerializableTransaction,
  toInputJson,
  updateBreachStateRecord,
} from '../../../../shared-contracts';

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Fetch a complete, tenant-scoped breach report and readiness assessment. */
export async function GET(request: NextRequest, route: RouteContext) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const { id } = await route.params;
  const row = await prisma.breachReport.findFirst({
    where: { tenantId: context.tenantId, id, removedAt: null },
  });
  if (!row) return NextResponse.json({ error: 'Breach report not found' }, { status: 404 });
  return NextResponse.json(breachResponse(row));
}

/**
 * Update report content and/or complete assessment/notification evidence.
 * Severity and sent flags are derived from nested evidence, never request flags.
 */
export async function PATCH(request: NextRequest, route: RouteContext) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const parsed = await parseJson(request);
  const { id } = await route.params;
  const tenantId = context.tenantId;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const existing = await transaction.breachReport.findFirst({
      where: { tenantId, id, removedAt: null },
    });
    if (!existing) return { kind: 'missing' as const };

    const validation = updateBreachStateRecord(
      parsed,
      breachStateFromRow(existing),
      context.actor as NonNullable<typeof context.actor>,
    );
    if (!validation.valid) {
      return { kind: 'invalid' as const, fields: validation.fields };
    }

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
    return NextResponse.json(
      { error: 'Concurrent breach update conflict; retry the request.' },
      { status: 409 },
    );
  }
  const result = transactionResult.value;
  if (result.kind === 'missing') {
    return NextResponse.json({ error: 'Breach report not found' }, { status: 404 });
  }
  if (result.kind === 'invalid') {
    return NextResponse.json(
      { error: 'Validation failed.', fields: result.fields },
      { status: 400 },
    );
  }
  return NextResponse.json(breachResponse(result.row));
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
