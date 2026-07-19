/** Express — staff-only, tenant-scoped breach register for {{ORG_NAME_COMMENT}}. */
import { Router } from 'express';
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
type Severity = 'critical' | 'high' | 'medium' | 'low';
interface BreachRow { id: string; tenantId: string; title: string; description: string; category: string; severity: Severity; status: string; discoveredAt: Date; occurredAt: Date | null; reportedAt: Date; reporterName: string; reporterEmail: string; reporterDepartment: string | null; affectedSystems: string[]; dataTypes: string[]; estimatedAffected: number | null; approximateRecordCount: number | null; dataSubjectCategories: string[]; likelyConsequences: string | null; mitigationMeasures: string | null; involvesSensitiveData: boolean; isPhasedReport: boolean; supplementsReportId: string | null; initialActions: string | null }
const breachStore = new Map<string, BreachRow>();
const auditLog: Array<{ id: string; tenantId: string; action: string; entityId: string; performedBy: string; at: Date }> = [];
// {{/if}}

type BreachSeverity = 'critical' | 'high' | 'medium' | 'low';
function severityFor(category: string, affected: number | null): BreachSeverity {
  const highRisk = new Set(['unauthorized_access', 'ransomware', 'data_exfiltration', 'identity_theft']);
  if (highRisk.has(category)) return (affected ?? 0) > 1000 ? 'critical' : 'high';
  if ((affected ?? 0) > 500) return 'high';
  if ((affected ?? 0) > 50) return 'medium';
  return 'low';
}
function count(value: unknown): number | null { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null; }
export const breachRouter = Router();

breachRouter.get('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return res.status(problem.status).json({ error: problem.error });
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  // {{#if ORM=prisma}}
  const reports = await prisma.breachReport.findMany({ where: { tenantId: context.tenantId, ...(status ? { status } : {}) }, orderBy: { reportedAt: 'desc' } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const reports = status
    ? await db.select().from(breachReports).where(and(eq(breachReports.tenantId, context.tenantId), eq(breachReports.status, status))).orderBy(desc(breachReports.reportedAt))
    : await db.select().from(breachReports).where(eq(breachReports.tenantId, context.tenantId)).orderBy(desc(breachReports.reportedAt));
  // {{/if}}
  // {{#if ORM=none}}
  const reports = [...breachStore.values()].filter((row) => row.tenantId === context.tenantId && (!status || row.status === status)).sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
  // {{/if}}
  return res.json(reports);
});

breachRouter.post('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return res.status(problem.status).json({ error: problem.error });
  const actor = context.actor;
  if (!actor) return res.status(401).json({ error: 'Verified staff profile is required' });
  const actorId = actor.id;
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'A JSON object is required' });
  }
  const input = req.body as Record<string, unknown>;
  const required = ['title', 'description', 'category', 'discoveredAt'] as const;
  if (required.some((field) => typeof input[field] !== 'string' || !(input[field] as string).trim()) || !Array.isArray(input.affectedSystems) || !input.affectedSystems.every((v) => typeof v === 'string') || !Array.isArray(input.dataTypes) || !input.dataTypes.every((v) => typeof v === 'string')) {
    return res.status(400).json({ error: `${required.join(', ')}, affectedSystems, and dataTypes are required` });
  }
  const discoveredAt = new Date(input.discoveredAt as string);
  const occurredAt = typeof input.occurredAt === 'string' ? new Date(input.occurredAt) : null;
  if (!Number.isFinite(discoveredAt.getTime()) || discoveredAt.getTime() > Date.now() || occurredAt && (!Number.isFinite(occurredAt.getTime()) || occurredAt > discoveredAt)) return res.status(400).json({ error: 'Breach dates are invalid or inconsistent' });
  const estimatedAffected = input.estimatedAffected == null ? null : count(input.estimatedAffected);
  const approximateRecordCount = input.approximateRecordCount == null ? null : count(input.approximateRecordCount);
  if (input.estimatedAffected != null && estimatedAffected === null || input.approximateRecordCount != null && approximateRecordCount === null) return res.status(400).json({ error: 'Counts must be finite non-negative numbers' });
  const dataSubjectCategories = Array.isArray(input.dataSubjectCategories) && input.dataSubjectCategories.every((v) => typeof v === 'string') ? input.dataSubjectCategories as string[] : [];
  const severity = severityFor(input.category as string, estimatedAffected);
  const reportedAt = new Date();
  const data = { tenantId: context.tenantId, title: input.title as string, description: input.description as string, category: input.category as string, severity, status: 'ongoing', discoveredAt, occurredAt, reporterName: actor.displayName, reporterEmail: actor.email, reporterDepartment: actor.department ?? null, affectedSystems: input.affectedSystems as string[], dataTypes: input.dataTypes as string[], estimatedAffected, approximateRecordCount, dataSubjectCategories, likelyConsequences: typeof input.likelyConsequences === 'string' ? input.likelyConsequences : null, mitigationMeasures: typeof input.mitigationMeasures === 'string' ? input.mitigationMeasures : null, involvesSensitiveData: input.involvesSensitiveData === true, isPhasedReport: input.isPhasedReport === true, supplementsReportId: typeof input.supplementsReportId === 'string' ? input.supplementsReportId : null, initialActions: typeof input.initialActions === 'string' ? input.initialActions : null };
  // {{#if ORM=prisma}}
  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.breachReport.create({ data });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'breach', action: 'reported', entityId: created.id, entityType: 'BreachReport', performedBy: actorId, changes: { title: data.title, category: data.category, severity, status: 'ongoing' } } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const report = await db.transaction(async (tx) => {
    const [created] = await tx.insert(breachReports).values(data).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'breach', action: 'reported', entityId: created.id, entityType: 'BreachReport', performedBy: actorId, changes: { title: data.title, category: data.category, severity, status: 'ongoing' } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const report: BreachRow = { id: crypto.randomUUID(), ...data, reportedAt };
  breachStore.set(report.id, report);
  auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'reported', entityId: report.id, performedBy: actorId, at: reportedAt });
  // {{/if}}
  const readiness = assessBreachNotification({ id: report.id, title: data.title, description: data.description, category: data.category, discoveredAt: discoveredAt.getTime(), occurredAt: occurredAt?.getTime(), reportedAt: reportedAt.getTime(), reporter: { name: data.reporterName, email: data.reporterEmail, department: data.reporterDepartment ?? '' }, affectedSystems: data.affectedSystems, dataTypes: data.dataTypes, involvesSensitiveData: data.involvesSensitiveData, estimatedAffectedSubjects: estimatedAffected ?? undefined, approximateRecordCount: approximateRecordCount ?? undefined, dataSubjectCategories, likelyConsequences: data.likelyConsequences ?? undefined, mitigationMeasures: data.mitigationMeasures ?? undefined, isPhasedReport: data.isPhasedReport, supplementsReportId: data.supplementsReportId ?? undefined, initialActions: data.initialActions ?? undefined, dpoContact: { name: `{{ORG_NAME_TEMPLATE}} DPO`, email: `{{DPO_EMAIL_TEMPLATE}}` }, status: 'ongoing' });
  return res.status(201).json({ ...report, ndpcReadiness: { complete: readiness.complete, ready: readiness.ready, valid: readiness.valid, completeness: readiness.completeness, missing: readiness.missing, validationErrors: readiness.validationErrors, notificationRequired: readiness.notificationRequired, hoursRemaining: readiness.timing.hoursRemaining, evidenceRecorded: readiness.evidence.notificationProvided } });
});
