/** Express — staff-only, tenant-scoped DPIA register for {{ORG_NAME_COMMENT}}. */
import { Router } from 'express';
import { getNDPRContextProblem, resolveNDPRRequestContext } from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { complianceAuditLog, dpiaRecords } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq, isNull } from 'drizzle-orm';
// {{/if}}

const DPIA_STATUSES = ['draft', 'in_progress', 'completed', 'approved', 'rejected'] as const;
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
const LAWFUL_BASES = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests'] as const;
type DPIAStatus = (typeof DPIA_STATUSES)[number];
type RiskLevel = (typeof RISK_LEVELS)[number];
type AnswerValue = string | number | boolean | string[];
type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

interface DPIARiskEvidence {
  id: string;
  description: string;
  likelihood: number;
  impact: number;
  score: number;
  level: RiskLevel;
  mitigated: boolean;
  mitigationMeasures?: string[];
  residualScore?: number;
  relatedQuestionIds: string[];
}
interface DPIAEvidence {
  answers: Record<string, AnswerValue>;
  risks: DPIARiskEvidence[];
  conclusion: string;
  version: string;
  recommendations?: string[];
  reviewDate?: number;
  lawfulBasis?: (typeof LAWFUL_BASES)[number];
  involvesCrossBorderTransfer?: boolean;
  overallRiskLevel: RiskLevel;
  canProceed: boolean;
  ndpcConsultationRequired: boolean;
  completedAt: number | null;
}
interface DPIAExisting {
  projectName: string;
  description: string;
  dpiaData: unknown;
  status: string;
  conductedBy: string;
  approvedBy: string | null;
}
interface DPIAMutation {
  projectName: string;
  description: string;
  dpiaData: DPIAEvidence;
  overallRisk: RiskLevel;
  score: number;
  status: DPIAStatus;
  conductedBy: string;
  approvedBy: string | null;
  updatedAt: Date;
}

// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface DPIARow extends DPIAExisting { id: string; tenantId: string; dpiaData: DPIAEvidence; overallRisk: RiskLevel; score: number; status: DPIAStatus; createdAt: Date; updatedAt: Date; removedAt: Date | null }
const dpiaStore = new Map<string, DPIARow>();
const auditLog: Array<{ id: string; tenantId: string; action: string; entityId: string; performedBy: string; changes?: unknown; at: Date }> = [];
// {{/if}}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function rejectUnknownFields(value: Record<string, unknown>, allowed: readonly string[]): string | null {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedSet.has(key));
  return unknown.length > 0 ? `Unsupported field(s): ${unknown.join(', ')}` : null;
}
function nonEmptyText(value: unknown, field: string, maxLength = 10_000): Validation<string> {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) return { ok: false, error: `${field} must be non-empty text of at most ${maxLength} characters` };
  return { ok: true, value: value.trim() };
}
function nonEmptyStringArray(value: unknown, field: string): Validation<string[]> {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return { ok: false, error: `${field} must be a non-empty array with at most 100 items` };
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) return { ok: false, error: `${field} must contain only non-empty strings` };
    if (!result.includes(item.trim())) result.push(item.trim());
  }
  return { ok: true, value: result };
}
function parseTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value !== 'string') return undefined;
  const input = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const dateTime = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(input);
  if (!dateOnly && !dateTime) return undefined;
  const timestamp = Date.parse(input);
  if (!Number.isFinite(timestamp)) return undefined;
  const parts = dateOnly ?? dateTime;
  const check = new Date(Date.UTC(Number(parts![1]), Number(parts![2]) - 1, Number(parts![3])));
  if (check.getUTCFullYear() !== Number(parts![1]) || check.getUTCMonth() + 1 !== Number(parts![2]) || check.getUTCDate() !== Number(parts![3])) return undefined;
  return timestamp;
}
function isDPIAStatus(value: unknown): value is DPIAStatus {
  return typeof value === 'string' && (DPIA_STATUSES as readonly string[]).includes(value);
}
function riskLevelForScore(score: number): RiskLevel {
  if (score >= 17) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}
function highestRiskLevel(risks: DPIARiskEvidence[]): RiskLevel {
  const rank: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };
  return risks.reduce<RiskLevel>((highest, risk) => rank[risk.level] > rank[highest] ? risk.level : highest, 'low');
}
function isSafeQuestionId(questionId: string): boolean {
  return questionId.length > 0
    && questionId.length <= 200
    && questionId !== '__proto__'
    && questionId !== 'prototype'
    && !Object.prototype.hasOwnProperty.call(Object.prototype, questionId);
}
function normalizeAnswers(value: unknown): Validation<Record<string, AnswerValue>> {
  if (!isRecord(value) || Object.keys(value).length === 0 || Object.keys(value).length > 500) return { ok: false, error: 'dpiaData.answers must be a non-empty object with at most 500 answers' };
  const answers = new Map<string, AnswerValue>();
  for (const [rawQuestionId, answer] of Object.entries(value)) {
    const questionId = rawQuestionId.trim();
    if (!questionId || !isSafeQuestionId(questionId)) return { ok: false, error: 'dpiaData.answers question ids must be non-reserved text with at most 200 characters' };
    if (typeof answer === 'string') {
      if (!answer.trim()) return { ok: false, error: `dpiaData.answers.${questionId} cannot be empty` };
      answers.set(questionId, answer.trim());
    } else if (typeof answer === 'number') {
      if (!Number.isFinite(answer)) return { ok: false, error: `dpiaData.answers.${questionId} must be finite` };
      answers.set(questionId, answer);
    } else if (typeof answer === 'boolean') answers.set(questionId, answer);
    else if (Array.isArray(answer)) {
      const normalized = nonEmptyStringArray(answer, `dpiaData.answers.${questionId}`);
      if (!normalized.ok) return normalized;
      answers.set(questionId, normalized.value);
    } else return { ok: false, error: `dpiaData.answers.${questionId} must be text, a finite number, boolean, or a non-empty string array` };
  }
  return { ok: true, value: Object.fromEntries(answers) };
}
function normalizeRisks(value: unknown, answers: Record<string, AnswerValue>, stored: boolean): Validation<DPIARiskEvidence[]> {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return { ok: false, error: 'dpiaData.risks must be a non-empty array with at most 100 risks' };
  const risks: DPIARiskEvidence[] = [];
  const ids = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isRecord(item)) return { ok: false, error: `dpiaData.risks[${index}] must be an object` };
    const unknown = rejectUnknownFields(item, stored
      ? ['id', 'description', 'likelihood', 'impact', 'mitigated', 'mitigationMeasures', 'residualScore', 'relatedQuestionIds', 'score', 'level']
      : ['id', 'description', 'likelihood', 'impact', 'mitigated', 'mitigationMeasures', 'residualScore', 'relatedQuestionIds']);
    if (unknown) return { ok: false, error: `dpiaData.risks[${index}]: ${unknown}` };
    const description = nonEmptyText(item.description, `dpiaData.risks[${index}].description`, 2_000);
    if (!description.ok) return description;
    if (!Number.isSafeInteger(item.likelihood) || (item.likelihood as number) < 1 || (item.likelihood as number) > 5) return { ok: false, error: `dpiaData.risks[${index}].likelihood must be an integer from 1 to 5` };
    if (!Number.isSafeInteger(item.impact) || (item.impact as number) < 1 || (item.impact as number) > 5) return { ok: false, error: `dpiaData.risks[${index}].impact must be an integer from 1 to 5` };
    if (typeof item.mitigated !== 'boolean') return { ok: false, error: `dpiaData.risks[${index}].mitigated must be boolean` };
    const related = nonEmptyStringArray(item.relatedQuestionIds, `dpiaData.risks[${index}].relatedQuestionIds`);
    if (!related.ok) return related;
    if (related.value.some((questionId) => !hasOwn(answers, questionId))) return { ok: false, error: `dpiaData.risks[${index}].relatedQuestionIds must reference supplied answers` };
    const mitigation = item.mitigationMeasures === undefined ? undefined : nonEmptyStringArray(item.mitigationMeasures, `dpiaData.risks[${index}].mitigationMeasures`);
    if (mitigation && !mitigation.ok) return mitigation;
    if (item.mitigated && !mitigation) return { ok: false, error: `dpiaData.risks[${index}] requires mitigationMeasures when mitigated is true` };
    if (!item.mitigated && item.residualScore !== undefined) return { ok: false, error: `dpiaData.risks[${index}].residualScore is only valid for a mitigated risk` };
    const score = (item.likelihood as number) * (item.impact as number);
    let residualScore: number | undefined;
    if (item.residualScore !== undefined) {
      if (!Number.isSafeInteger(item.residualScore) || (item.residualScore as number) < 0 || (item.residualScore as number) > score) return { ok: false, error: `dpiaData.risks[${index}].residualScore must be an integer from 0 to the computed score (${score})` };
      residualScore = item.residualScore as number;
    }
    if (item.mitigated && residualScore === undefined) return { ok: false, error: `dpiaData.risks[${index}] requires residualScore when mitigated is true` };
    const level = riskLevelForScore(residualScore ?? score);
    if (stored && (item.score !== score || item.level !== level)) return { ok: false, error: `dpiaData.risks[${index}] contains inconsistent server-derived score or level` };
    const idValue = item.id === undefined && !stored ? crypto.randomUUID() : nonEmptyText(item.id, `dpiaData.risks[${index}].id`, 200);
    if (typeof idValue !== 'string' && !idValue.ok) return idValue;
    const id = typeof idValue === 'string' ? idValue : idValue.value;
    if (ids.has(id)) return { ok: false, error: `dpiaData.risks contains duplicate id ${id}` };
    ids.add(id);
    risks.push({ id, description: description.value, likelihood: item.likelihood as number, impact: item.impact as number, score, level, mitigated: item.mitigated, ...(mitigation?.ok ? { mitigationMeasures: mitigation.value } : {}), ...(residualScore !== undefined ? { residualScore } : {}), relatedQuestionIds: related.value });
  }
  return { ok: true, value: risks };
}
function normalizeDPIAEvidence(value: unknown, now: number, stored = false): Validation<DPIAEvidence> {
  if (!isRecord(value)) return { ok: false, error: 'dpiaData must be an object' };
  const unknown = rejectUnknownFields(value, stored
    ? ['answers', 'risks', 'conclusion', 'version', 'recommendations', 'reviewDate', 'lawfulBasis', 'involvesCrossBorderTransfer', 'overallRiskLevel', 'canProceed', 'ndpcConsultationRequired', 'completedAt']
    : ['answers', 'risks', 'conclusion', 'version', 'recommendations', 'reviewDate', 'lawfulBasis', 'involvesCrossBorderTransfer']);
  if (unknown) return { ok: false, error: `dpiaData: ${unknown}` };
  const answers = normalizeAnswers(value.answers); if (!answers.ok) return answers;
  const risks = normalizeRisks(value.risks, answers.value, stored); if (!risks.ok) return risks;
  const conclusion = nonEmptyText(value.conclusion, 'dpiaData.conclusion', 10_000); if (!conclusion.ok) return conclusion;
  const version = nonEmptyText(value.version, 'dpiaData.version', 100); if (!version.ok) return version;
  const recommendations = value.recommendations == null ? undefined : nonEmptyStringArray(value.recommendations, 'dpiaData.recommendations'); if (recommendations && !recommendations.ok) return recommendations;
  const reviewDate = value.reviewDate == null ? undefined : parseTimestamp(value.reviewDate);
  if (value.reviewDate != null && reviewDate === undefined) return { ok: false, error: 'dpiaData.reviewDate must be epoch milliseconds or an unambiguous ISO date' };
  if (!stored && reviewDate !== undefined && reviewDate <= now) return { ok: false, error: 'dpiaData.reviewDate must be in the future' };
  if (value.lawfulBasis != null && (typeof value.lawfulBasis !== 'string' || !(LAWFUL_BASES as readonly string[]).includes(value.lawfulBasis))) return { ok: false, error: 'dpiaData.lawfulBasis is not a supported NDPA lawful basis' };
  if (value.involvesCrossBorderTransfer !== undefined && typeof value.involvesCrossBorderTransfer !== 'boolean') return { ok: false, error: 'dpiaData.involvesCrossBorderTransfer must be boolean' };
  const overallRiskLevel = highestRiskLevel(risks.value);
  const canProceed = !risks.value.some((risk) => risk.level === 'high' || risk.level === 'critical');
  const ndpcConsultationRequired = overallRiskLevel === 'high' || overallRiskLevel === 'critical';
  const completedAt = stored && value.completedAt != null ? parseTimestamp(value.completedAt) : undefined;
  if (stored && value.completedAt != null && completedAt === undefined) return { ok: false, error: 'dpiaData.completedAt is invalid' };
  if (stored && completedAt !== undefined && completedAt > now) return { ok: false, error: 'dpiaData.completedAt cannot be in the future' };
  if (stored && (value.overallRiskLevel !== overallRiskLevel || value.canProceed !== canProceed || value.ndpcConsultationRequired !== ndpcConsultationRequired)) return { ok: false, error: 'dpiaData contains inconsistent server-derived risk evidence' };
  return { ok: true, value: { answers: answers.value, risks: risks.value, conclusion: conclusion.value, version: version.value, ...(recommendations?.ok ? { recommendations: recommendations.value } : {}), ...(reviewDate !== undefined ? { reviewDate } : {}), ...(typeof value.lawfulBasis === 'string' ? { lawfulBasis: value.lawfulBasis as (typeof LAWFUL_BASES)[number] } : {}), ...(typeof value.involvesCrossBorderTransfer === 'boolean' ? { involvesCrossBorderTransfer: value.involvesCrossBorderTransfer } : {}), overallRiskLevel, canProceed, ndpcConsultationRequired, completedAt: completedAt ?? null } };
}

const STATUS_TRANSITIONS: Record<DPIAStatus, readonly DPIAStatus[]> = {
  draft: ['draft', 'in_progress'], in_progress: ['in_progress', 'draft', 'completed', 'rejected'], completed: ['completed', 'in_progress', 'approved', 'rejected'], approved: ['approved', 'in_progress'], rejected: ['rejected', 'in_progress'],
};
function buildDPIAMutation(input: Record<string, unknown>, actorId: string, existing?: DPIAExisting, now = Date.now()): Validation<DPIAMutation> {
  const projectName = hasOwn(input, 'projectName') ? nonEmptyText(input.projectName, 'projectName', 500) : existing ? { ok: true as const, value: existing.projectName } : { ok: false as const, error: 'projectName is required' }; if (!projectName.ok) return projectName;
  const description = hasOwn(input, 'description') ? nonEmptyText(input.description, 'description', 10_000) : existing ? { ok: true as const, value: existing.description } : { ok: false as const, error: 'description is required' }; if (!description.ok) return description;
  const evidence = hasOwn(input, 'dpiaData') ? normalizeDPIAEvidence(input.dpiaData, now) : existing ? normalizeDPIAEvidence(existing.dpiaData, now, true) : { ok: false as const, error: 'dpiaData is required' }; if (!evidence.ok) return evidence;
  if (input.status !== undefined && !isDPIAStatus(input.status)) return { ok: false, error: 'status is not supported' };
  const status: DPIAStatus = isDPIAStatus(input.status) ? input.status : existing && isDPIAStatus(existing.status) ? existing.status : 'draft';
  if (existing) {
    if (!isDPIAStatus(existing.status)) return { ok: false, error: 'Stored DPIA status is invalid' };
    if (!STATUS_TRANSITIONS[existing.status].includes(status)) return { ok: false, error: `DPIA status cannot transition from ${existing.status} to ${status}` };
    const evidenceChanged = hasOwn(input, 'projectName') || hasOwn(input, 'description') || hasOwn(input, 'dpiaData');
    if (evidenceChanged && ['completed', 'approved', 'rejected'].includes(existing.status) && status !== 'in_progress') return { ok: false, error: 'A terminal DPIA must be reopened as in_progress before its evidence is changed' };
  }
  if (status === 'approved' && !evidence.value.canProceed) return { ok: false, error: 'A DPIA with high or critical residual risk cannot be approved' };
  if (status === 'rejected' && evidence.value.canProceed) return { ok: false, error: 'A rejected DPIA must contain residual risk that prevents proceeding' };
  const terminal = status === 'completed' || status === 'approved' || status === 'rejected';
  const previouslyTerminal = existing && (existing.status === 'completed' || existing.status === 'approved' || existing.status === 'rejected');
  const dpiaData: DPIAEvidence = { ...evidence.value, completedAt: terminal ? (previouslyTerminal ? evidence.value.completedAt ?? now : now) : null };
  const score = dpiaData.risks.reduce((highest, risk) => Math.max(highest, risk.residualScore ?? risk.score), 0);
  return { ok: true, value: { projectName: projectName.value, description: description.value, dpiaData, overallRisk: dpiaData.overallRiskLevel, score, status, conductedBy: actorId, approvedBy: status === 'approved' ? (existing?.status === 'approved' ? existing.approvedBy ?? actorId : actorId) : null, updatedAt: new Date(now) } };
}
function auditChanges(data: DPIAMutation) {
  return { projectName: data.projectName, overallRisk: data.overallRisk, score: data.score, status: data.status, conductedBy: data.conductedBy, approvedBy: data.approvedBy };
}

export const dpiaRouter = Router();

dpiaRouter.get('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req); const problem = getNDPRContextProblem(context, 'staff'); if (problem) return res.status(problem.status).json({ error: problem.error });
  const statusValue = typeof req.query.status === 'string' ? req.query.status : undefined;
  if (statusValue !== undefined && !isDPIAStatus(statusValue)) return res.status(400).json({ error: 'status filter is not supported' });
  // {{#if ORM=prisma}}
  const records = await prisma.dPIARecord.findMany({ where: { tenantId: context.tenantId, removedAt: null, ...(statusValue ? { status: statusValue } : {}) }, orderBy: { createdAt: 'desc' } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const records = statusValue ? await db.select().from(dpiaRecords).where(and(eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt), eq(dpiaRecords.status, statusValue))).orderBy(desc(dpiaRecords.createdAt)) : await db.select().from(dpiaRecords).where(and(eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).orderBy(desc(dpiaRecords.createdAt));
  // {{/if}}
  // {{#if ORM=none}}
  const records = [...dpiaStore.values()].filter((row) => row.tenantId === context.tenantId && row.removedAt === null && (!statusValue || row.status === statusValue)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  // {{/if}}
  return res.json(records);
});

dpiaRouter.get('/:id', async (req, res) => {
  const context = await resolveNDPRRequestContext(req); const problem = getNDPRContextProblem(context, 'staff'); if (problem) return res.status(problem.status).json({ error: problem.error });
  // {{#if ORM=prisma}}
  const record = await prisma.dPIARecord.findFirst({ where: { id: req.params.id, tenantId: context.tenantId, removedAt: null } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const [record] = await db.select().from(dpiaRecords).where(and(eq(dpiaRecords.id, req.params.id), eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).limit(1);
  // {{/if}}
  // {{#if ORM=none}}
  const candidate = dpiaStore.get(req.params.id); const record = candidate?.tenantId === context.tenantId && candidate.removedAt === null ? candidate : null;
  // {{/if}}
  return record ? res.json(record) : res.status(404).json({ error: 'DPIA record not found' });
});

dpiaRouter.post('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req); const problem = getNDPRContextProblem(context, 'staff'); if (problem) return res.status(problem.status).json({ error: problem.error });
  const actorId = context.actorId as string;
  if (!isRecord(req.body)) return res.status(400).json({ error: 'A JSON object is required' });
  const unknown = rejectUnknownFields(req.body, ['projectName', 'description', 'dpiaData']); if (unknown) return res.status(400).json({ error: unknown });
  const normalized = buildDPIAMutation(req.body, actorId); if (!normalized.ok) return res.status(400).json({ error: normalized.error });
  const data = normalized.value;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => { const created = await tx.dPIARecord.create({ data: { ...data, tenantId: context.tenantId, dpiaData: data.dpiaData as unknown as Prisma.InputJsonValue, removedAt: null } }); await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'dpia', action: 'created', entityId: created.id, entityType: 'DPIARecord', performedBy: actorId, changes: auditChanges(data) } }); return created; });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => { const [created] = await tx.insert(dpiaRecords).values({ ...data, tenantId: context.tenantId, removedAt: null }).returning(); await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'dpia', action: 'created', entityId: created.id, entityType: 'DPIARecord', performedBy: actorId, changes: auditChanges(data) }); return created; });
  // {{/if}}
  // {{#if ORM=none}}
  const now = data.updatedAt; const record: DPIARow = { id: crypto.randomUUID(), ...data, tenantId: context.tenantId, createdAt: now, removedAt: null }; dpiaStore.set(record.id, record); auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'created', entityId: record.id, performedBy: actorId, changes: auditChanges(data), at: now });
  // {{/if}}
  return res.status(201).json(record);
});

dpiaRouter.put('/:id', async (req, res) => {
  const context = await resolveNDPRRequestContext(req); const problem = getNDPRContextProblem(context, 'staff'); if (problem) return res.status(problem.status).json({ error: problem.error });
  const actorId = context.actorId as string;
  if (!isRecord(req.body)) return res.status(400).json({ error: 'A JSON object is required' });
  const unknown = rejectUnknownFields(req.body, ['projectName', 'description', 'dpiaData', 'status']); if (unknown) return res.status(400).json({ error: unknown });
  if (!['projectName', 'description', 'dpiaData', 'status'].some((field) => hasOwn(req.body, field))) return res.status(400).json({ error: 'Provide at least one allowlisted DPIA field to update' });
  const id = req.params.id; let validationError: string | null = null;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => { const existing = await tx.dPIARecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } }); if (!existing) return null; const normalized = buildDPIAMutation(req.body, actorId, existing); if (!normalized.ok) { validationError = normalized.error; return null; } const data = normalized.value; await tx.dPIARecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data: { ...data, dpiaData: data.dpiaData as unknown as Prisma.InputJsonValue } }); const updated = await tx.dPIARecord.findFirstOrThrow({ where: { id, tenantId: context.tenantId, removedAt: null } }); await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'dpia', action: 'updated', entityId: id, entityType: 'DPIARecord', performedBy: actorId, changes: auditChanges(data) } }); return updated; });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => { const [existing] = await tx.select().from(dpiaRecords).where(and(eq(dpiaRecords.id, id), eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).limit(1); if (!existing) return null; const normalized = buildDPIAMutation(req.body, actorId, existing); if (!normalized.ok) { validationError = normalized.error; return null; } const data = normalized.value; const [updated] = await tx.update(dpiaRecords).set(data).where(and(eq(dpiaRecords.id, id), eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).returning(); await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'dpia', action: 'updated', entityId: id, entityType: 'DPIARecord', performedBy: actorId, changes: auditChanges(data) }); return updated; });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = dpiaStore.get(id); let record: DPIARow | null = null; if (existing?.tenantId === context.tenantId && existing.removedAt === null) { const normalized = buildDPIAMutation(req.body, actorId, existing); if (!normalized.ok) validationError = normalized.error; else { record = { ...existing, ...normalized.value, id }; dpiaStore.set(id, record); auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'updated', entityId: id, performedBy: actorId, changes: auditChanges(normalized.value), at: normalized.value.updatedAt }); } }
  // {{/if}}
  if (validationError) return res.status(400).json({ error: validationError });
  return record ? res.json(record) : res.status(404).json({ error: 'DPIA record not found' });
});

dpiaRouter.delete('/:id', async (req, res) => {
  const context = await resolveNDPRRequestContext(req); const problem = getNDPRContextProblem(context, 'staff'); if (problem) return res.status(problem.status).json({ error: problem.error });
  const actorId = context.actorId as string; const id = req.params.id; const archivedAt = new Date();
  // {{#if ORM=prisma}}
  const archived = await prisma.$transaction(async (tx) => { const existing = await tx.dPIARecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } }); if (!existing) return false; const result = await tx.dPIARecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data: { removedAt: archivedAt, updatedAt: archivedAt } }); if (result.count !== 1) return false; await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'dpia', action: 'archived', entityId: id, entityType: 'DPIARecord', performedBy: actorId, changes: { projectName: existing.projectName, removedAt: archivedAt.toISOString() } } }); return true; });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const archived = await db.transaction(async (tx) => { const [existing] = await tx.select().from(dpiaRecords).where(and(eq(dpiaRecords.id, id), eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).limit(1); if (!existing) return false; const [updated] = await tx.update(dpiaRecords).set({ removedAt: archivedAt, updatedAt: archivedAt }).where(and(eq(dpiaRecords.id, id), eq(dpiaRecords.tenantId, context.tenantId), isNull(dpiaRecords.removedAt))).returning(); if (!updated) return false; await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'dpia', action: 'archived', entityId: id, entityType: 'DPIARecord', performedBy: actorId, changes: { projectName: existing.projectName, removedAt: archivedAt.toISOString() } }); return true; });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = dpiaStore.get(id); const archived = existing?.tenantId === context.tenantId && existing.removedAt === null; if (archived && existing) { dpiaStore.set(id, { ...existing, removedAt: archivedAt, updatedAt: archivedAt }); auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'archived', entityId: id, performedBy: actorId, changes: { projectName: existing.projectName, removedAt: archivedAt.toISOString() }, at: archivedAt }); }
  // {{/if}}
  return archived ? res.json({ success: true, archived: true }) : res.status(404).json({ error: 'DPIA record not found' });
});
