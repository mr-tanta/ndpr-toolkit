/**
 * Next.js App Router — tenant-scoped breach register for {{ORG_NAME_COMMENT}}.
 * All operations require verified staff context. Readiness is advisory; it is
 * not evidence that a regulator or affected subject was notified.
 */
import { NextRequest, NextResponse } from 'next/server';
import { assessBreachNotification } from '@tantainnovative/ndpr-toolkit/server';
import { getNDPRContextProblem, resolveNDPRRequestContext } from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { breachReports, complianceAuditLog } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq } from 'drizzle-orm';
// {{/if}}
// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface BreachRow {
  id: string; tenantId: string; title: string; description: string; category: string;
  severity: Severity; status: string; discoveredAt: Date; occurredAt: Date | null;
  reportedAt: Date; reporterName: string; reporterEmail: string; reporterDepartment: string | null;
  affectedSystems: string[]; dataTypes: string[]; estimatedAffected: number | null;
  approximateRecordCount: number | null; dataSubjectCategories: string[];
  likelyConsequences: string | null; mitigationMeasures: string | null;
  involvesSensitiveData: boolean; isPhasedReport: boolean; supplementsReportId: string | null;
  initialActions: string | null;
}
const breachStore = new Map<string, BreachRow>();
const auditLog: Array<{ id: string; tenantId: string; action: string; entityId: string; performedBy: string; at: Date }> = [];
// {{/if}}

type Severity = 'critical' | 'high' | 'medium' | 'low';
function calculateSeverity(category: string, estimatedAffected: number | null): Severity {
  const highRisk = new Set(['unauthorized_access', 'ransomware', 'data_exfiltration', 'identity_theft']);
  if (highRisk.has(category)) return (estimatedAffected ?? 0) > 1000 ? 'critical' : 'high';
  if ((estimatedAffected ?? 0) > 500) return 'high';
  if ((estimatedAffected ?? 0) > 50) return 'medium';
  return 'low';
}
function finiteNonNegative(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function GET(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const status = req.nextUrl.searchParams.get('status');

  // {{#if ORM=prisma}}
  const reports = await prisma.breachReport.findMany({
    where: { tenantId: context.tenantId, ...(status ? { status } : {}) },
    orderBy: { reportedAt: 'desc' },
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const reports = status
    ? await db.select().from(breachReports).where(and(eq(breachReports.tenantId, context.tenantId), eq(breachReports.status, status))).orderBy(desc(breachReports.reportedAt))
    : await db.select().from(breachReports).where(eq(breachReports.tenantId, context.tenantId)).orderBy(desc(breachReports.reportedAt));
  // {{/if}}
  // {{#if ORM=none}}
  const reports = [...breachStore.values()]
    .filter((row) => row.tenantId === context.tenantId && (!status || row.status === status))
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
  // {{/if}}
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const actor = context.actor;
  if (!actor) {
    return NextResponse.json({ error: 'Verified staff profile is required' }, { status: 401 });
  }
  const actorId = actor.id;
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'A JSON object is required' }, { status: 400 });
  const input = body as Record<string, unknown>;
  const required = ['title', 'description', 'category', 'discoveredAt'] as const;
  if (required.some((field) => typeof input[field] !== 'string' || !(input[field] as string).trim())) {
    return NextResponse.json({ error: `${required.join(', ')} are required strings` }, { status: 400 });
  }
  if (!Array.isArray(input.affectedSystems) || !input.affectedSystems.every((v) => typeof v === 'string') ||
      !Array.isArray(input.dataTypes) || !input.dataTypes.every((v) => typeof v === 'string')) {
    return NextResponse.json({ error: 'affectedSystems and dataTypes must be string arrays' }, { status: 400 });
  }
  const discoveredAt = new Date(input.discoveredAt as string);
  const occurredAt = typeof input.occurredAt === 'string' ? new Date(input.occurredAt) : null;
  if (!Number.isFinite(discoveredAt.getTime()) || discoveredAt.getTime() > Date.now() ||
      (occurredAt && (!Number.isFinite(occurredAt.getTime()) || occurredAt > discoveredAt))) {
    return NextResponse.json({ error: 'Breach dates are invalid or inconsistent' }, { status: 400 });
  }
  const estimatedAffected = input.estimatedAffected == null ? null : finiteNonNegative(input.estimatedAffected);
  const approximateRecordCount = input.approximateRecordCount == null ? null : finiteNonNegative(input.approximateRecordCount);
  if ((input.estimatedAffected != null && estimatedAffected === null) ||
      (input.approximateRecordCount != null && approximateRecordCount === null)) {
    return NextResponse.json({ error: 'Affected-subject and record counts must be finite non-negative numbers' }, { status: 400 });
  }
  const dataSubjectCategories = Array.isArray(input.dataSubjectCategories) && input.dataSubjectCategories.every((v) => typeof v === 'string')
    ? input.dataSubjectCategories as string[] : [];
  const severity = calculateSeverity(input.category as string, estimatedAffected);
  const reportedAt = new Date();
  const data = {
    tenantId: context.tenantId,
    title: input.title as string, description: input.description as string,
    category: input.category as string, severity, status: 'ongoing', discoveredAt, occurredAt,
    reporterName: actor.displayName, reporterEmail: actor.email,
    reporterDepartment: actor.department ?? null,
    affectedSystems: input.affectedSystems as string[], dataTypes: input.dataTypes as string[],
    estimatedAffected, approximateRecordCount, dataSubjectCategories,
    likelyConsequences: typeof input.likelyConsequences === 'string' ? input.likelyConsequences : null,
    mitigationMeasures: typeof input.mitigationMeasures === 'string' ? input.mitigationMeasures : null,
    involvesSensitiveData: input.involvesSensitiveData === true,
    isPhasedReport: input.isPhasedReport === true,
    supplementsReportId: typeof input.supplementsReportId === 'string' ? input.supplementsReportId : null,
    initialActions: typeof input.initialActions === 'string' ? input.initialActions : null,
  };

  // {{#if ORM=prisma}}
  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.breachReport.create({ data });
    await tx.complianceAuditLog.create({ data: {
      tenantId: context.tenantId, module: 'breach', action: 'reported',
      entityId: created.id, entityType: 'BreachReport', performedBy: actorId,
      changes: { title: data.title, category: data.category, severity, status: 'ongoing' },
    } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const report = await db.transaction(async (tx) => {
    const [created] = await tx.insert(breachReports).values(data).returning();
    await tx.insert(complianceAuditLog).values({
      tenantId: context.tenantId, module: 'breach', action: 'reported',
      entityId: created.id, entityType: 'BreachReport', performedBy: actorId,
      changes: { title: data.title, category: data.category, severity, status: 'ongoing' },
    });
    return created;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const report: BreachRow = { id: crypto.randomUUID(), ...data, reportedAt };
  breachStore.set(report.id, report);
  auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'reported', entityId: report.id, performedBy: actorId, at: reportedAt });
  // {{/if}}

  const ndpcReadiness = assessBreachNotification({
    id: report.id, title: data.title, description: data.description, category: data.category,
    discoveredAt: discoveredAt.getTime(), occurredAt: occurredAt?.getTime(), reportedAt: reportedAt.getTime(),
    reporter: { name: data.reporterName, email: data.reporterEmail, department: data.reporterDepartment ?? '' },
    affectedSystems: data.affectedSystems, dataTypes: data.dataTypes,
    involvesSensitiveData: data.involvesSensitiveData,
    estimatedAffectedSubjects: estimatedAffected ?? undefined,
    approximateRecordCount: approximateRecordCount ?? undefined,
    dataSubjectCategories, likelyConsequences: data.likelyConsequences ?? undefined,
    mitigationMeasures: data.mitigationMeasures ?? undefined,
    isPhasedReport: data.isPhasedReport, supplementsReportId: data.supplementsReportId ?? undefined,
    initialActions: data.initialActions ?? undefined,
    dpoContact: { name: `{{ORG_NAME_TEMPLATE}} DPO`, email: `{{DPO_EMAIL_TEMPLATE}}` }, status: 'ongoing',
  });
  return NextResponse.json({ ...report, ndpcReadiness: {
    complete: ndpcReadiness.complete, ready: ndpcReadiness.ready, valid: ndpcReadiness.valid,
    completeness: ndpcReadiness.completeness, missing: ndpcReadiness.missing,
    validationErrors: ndpcReadiness.validationErrors,
    notificationRequired: ndpcReadiness.notificationRequired,
    hoursRemaining: ndpcReadiness.timing.hoursRemaining,
    evidenceRecorded: ndpcReadiness.evidence.notificationProvided,
  } }, { status: 201 });
}
