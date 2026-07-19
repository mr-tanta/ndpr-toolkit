/** Next.js App Router — staff-only, tenant-scoped transfer register for {{ORG_NAME_COMMENT}}. */
import { NextRequest, NextResponse } from 'next/server';
import { getNDPRContextProblem, resolveNDPRRequestContext } from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { complianceAuditLog, crossBorderTransferRecords } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq, isNull, type SQL } from 'drizzle-orm';
// {{/if}}

const TRANSFER_MECHANISMS = ['adequacy_decision', 'standard_clauses', 'binding_corporate_rules', 'ndpc_authorization', 'explicit_consent', 'contract_performance', 'public_interest', 'legal_claims', 'vital_interests'] as const;
const ADEQUACY_STATUSES = ['adequate', 'inadequate', 'pending_review', 'unknown'] as const;
const RISK_LEVELS = ['low', 'medium', 'high'] as const;
const TRANSFER_STATUSES = ['active', 'suspended', 'terminated', 'pending_approval'] as const;
type TransferMechanism = (typeof TRANSFER_MECHANISMS)[number];
type AdequacyStatus = (typeof ADEQUACY_STATUSES)[number];
type RiskLevel = (typeof RISK_LEVELS)[number];
type TransferStatus = (typeof TRANSFER_STATUSES)[number];
type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

interface TransferExisting {
  destinationCountry: string;
  recipientName: string;
  transferMechanism: string;
  safeguards: string;
  dataCategories: unknown;
  adequacyStatus: string;
  ndpcApprovalReference: string | null;
  status: string;
}
interface TransferMutation {
  destinationCountry: string;
  recipientName: string;
  transferMechanism: TransferMechanism;
  safeguards: string;
  dataCategories: string[];
  adequacyStatus: AdequacyStatus;
  ndpcApprovalRequired: boolean;
  ndpcApprovalReference: string | null;
  riskLevel: RiskLevel;
  status: TransferStatus;
  updatedAt: Date;
}

// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface TransferRow extends TransferMutation { id: string; tenantId: string; createdAt: Date; removedAt: Date | null }
const transferStore = new Map<string, TransferRow>();
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
function isMechanism(value: unknown): value is TransferMechanism { return typeof value === 'string' && (TRANSFER_MECHANISMS as readonly string[]).includes(value); }
function isAdequacyStatus(value: unknown): value is AdequacyStatus { return typeof value === 'string' && (ADEQUACY_STATUSES as readonly string[]).includes(value); }
function isRiskLevel(value: unknown): value is RiskLevel { return typeof value === 'string' && (RISK_LEVELS as readonly string[]).includes(value); }
function isTransferStatus(value: unknown): value is TransferStatus { return typeof value === 'string' && (TRANSFER_STATUSES as readonly string[]).includes(value); }
function approvalRequired(mechanism: TransferMechanism): boolean {
  return mechanism === 'binding_corporate_rules' || mechanism === 'ndpc_authorization';
}
function deriveRiskLevel(adequacy: AdequacyStatus, mechanism: TransferMechanism, required: boolean, reference: string | null): RiskLevel {
  if ((required && !reference) || adequacy === 'inadequate') return 'high';
  const derogation = ['explicit_consent', 'contract_performance', 'public_interest', 'legal_claims', 'vital_interests'].includes(mechanism);
  if (adequacy === 'unknown' || adequacy === 'pending_review' || derogation) return 'medium';
  return 'low';
}
const STATUS_TRANSITIONS: Record<TransferStatus, readonly TransferStatus[]> = {
  active: ['active', 'suspended', 'terminated', 'pending_approval'],
  suspended: ['suspended', 'active', 'terminated', 'pending_approval'],
  pending_approval: ['pending_approval', 'active', 'suspended', 'terminated'],
  terminated: ['terminated'],
};
function buildTransferMutation(input: Record<string, unknown>, existing?: TransferExisting, now = new Date()): Validation<TransferMutation> {
  const destination = hasOwn(input, 'destinationCountry') ? nonEmptyText(input.destinationCountry, 'destinationCountry', 200) : existing ? nonEmptyText(existing.destinationCountry, 'stored destinationCountry', 200) : { ok: false as const, error: 'destinationCountry is required' };
  if (!destination.ok) return destination;
  const recipient = hasOwn(input, 'recipientName') ? nonEmptyText(input.recipientName, 'recipientName', 500) : existing ? nonEmptyText(existing.recipientName, 'stored recipientName', 500) : { ok: false as const, error: 'recipientName is required' };
  if (!recipient.ok) return recipient;
  const mechanismValue = hasOwn(input, 'transferMechanism') ? input.transferMechanism : existing?.transferMechanism;
  if (!isMechanism(mechanismValue)) return { ok: false, error: 'transferMechanism is not supported by the NDPA transfer register' };
  const safeguards = hasOwn(input, 'safeguards') ? nonEmptyText(input.safeguards, 'safeguards') : existing ? nonEmptyText(existing.safeguards, 'stored safeguards') : { ok: false as const, error: 'safeguards is required' };
  if (!safeguards.ok) return safeguards;
  const categories = nonEmptyStringArray(hasOwn(input, 'dataCategories') ? input.dataCategories : existing?.dataCategories, 'dataCategories');
  if (!categories.ok) return categories;
  const adequacyValue = hasOwn(input, 'adequacyStatus') ? input.adequacyStatus : existing?.adequacyStatus;
  if (!isAdequacyStatus(adequacyValue)) return { ok: false, error: 'adequacyStatus is not supported' };
  if (mechanismValue === 'adequacy_decision' && adequacyValue !== 'adequate') return { ok: false, error: 'adequacy_decision can only be used for a destination marked adequate' };
  let approvalReference: string | null;
  const referenceValue = hasOwn(input, 'ndpcApprovalReference') ? input.ndpcApprovalReference : existing?.ndpcApprovalReference ?? null;
  if (referenceValue === null || referenceValue === '') approvalReference = null;
  else {
    const reference = nonEmptyText(referenceValue, 'ndpcApprovalReference', 500);
    if (!reference.ok) return reference;
    approvalReference = reference.value;
  }
  const required = approvalRequired(mechanismValue);
  if (!required && approvalReference) return { ok: false, error: 'ndpcApprovalReference is only accepted for a mechanism that requires NDPC approval' };
  const explicitStatus = hasOwn(input, 'status');
  if (explicitStatus && !isTransferStatus(input.status)) return { ok: false, error: 'status is not supported' };
  let status: TransferStatus;
  if (isTransferStatus(input.status)) status = input.status;
  else if (required && !approvalReference) status = 'pending_approval';
  else if (existing && isTransferStatus(existing.status) && existing.status !== 'pending_approval') status = existing.status;
  else status = 'active';
  if (required && !approvalReference && status === 'active') return { ok: false, error: 'An approval-dependent transfer cannot be active without an NDPC approval reference' };
  if (!required && status === 'pending_approval') return { ok: false, error: 'pending_approval is only valid when the selected mechanism requires NDPC approval' };
  if (approvalReference && status === 'pending_approval') return { ok: false, error: 'A transfer with an NDPC approval reference cannot remain pending_approval' };
  if (existing) {
    if (!isTransferStatus(existing.status)) return { ok: false, error: 'Stored transfer status is invalid' };
    if (!STATUS_TRANSITIONS[existing.status].includes(status)) return { ok: false, error: `Transfer status cannot transition from ${existing.status} to ${status}` };
    if (existing.status === 'terminated' && ['destinationCountry', 'recipientName', 'transferMechanism', 'safeguards', 'dataCategories', 'adequacyStatus', 'ndpcApprovalReference'].some((field) => hasOwn(input, field))) return { ok: false, error: 'A terminated transfer cannot have its compliance evidence changed' };
  }
  return { ok: true, value: { destinationCountry: destination.value, recipientName: recipient.value, transferMechanism: mechanismValue, safeguards: safeguards.value, dataCategories: categories.value, adequacyStatus: adequacyValue, ndpcApprovalRequired: required, ndpcApprovalReference: approvalReference, riskLevel: deriveRiskLevel(adequacyValue, mechanismValue, required, approvalReference), status, updatedAt: now } };
}
function auditChanges(data: TransferMutation) {
  return { destinationCountry: data.destinationCountry, recipientName: data.recipientName, transferMechanism: data.transferMechanism, adequacyStatus: data.adequacyStatus, ndpcApprovalRequired: data.ndpcApprovalRequired, riskLevel: data.riskLevel, status: data.status };
}
async function staffContext(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  return { context, problem: getNDPRContextProblem(context, 'staff') };
}

export async function GET(req: NextRequest) {
  const { context, problem } = await staffContext(req);
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    // {{#if ORM=prisma}}
    const record = await prisma.crossBorderTransferRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    // {{/if}}
    // {{#if ORM=drizzle}}
    const [record] = await db.select().from(crossBorderTransferRecords).where(and(eq(crossBorderTransferRecords.id, id), eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt))).limit(1);
    // {{/if}}
    // {{#if ORM=none}}
    const candidate = transferStore.get(id);
    const record = candidate?.tenantId === context.tenantId && candidate.removedAt === null ? candidate : null;
    // {{/if}}
    return record ? NextResponse.json(record) : NextResponse.json({ error: 'Transfer record not found' }, { status: 404 });
  }
  const riskValue = req.nextUrl.searchParams.get('riskLevel');
  const statusValue = req.nextUrl.searchParams.get('status');
  const destinationValue = req.nextUrl.searchParams.get('destinationCountry');
  if (riskValue !== null && !isRiskLevel(riskValue)) return NextResponse.json({ error: 'riskLevel filter is not supported' }, { status: 400 });
  if (statusValue !== null && !isTransferStatus(statusValue)) return NextResponse.json({ error: 'status filter is not supported' }, { status: 400 });
  if (destinationValue !== null && !destinationValue.trim()) return NextResponse.json({ error: 'destinationCountry filter cannot be empty' }, { status: 400 });
  const riskLevel = riskValue ?? undefined;
  const status = statusValue ?? undefined;
  const destinationCountry = destinationValue?.trim() || undefined;
  // {{#if ORM=prisma}}
  const records = await prisma.crossBorderTransferRecord.findMany({ where: { tenantId: context.tenantId, removedAt: null, ...(riskLevel ? { riskLevel } : {}), ...(status ? { status } : {}), ...(destinationCountry ? { destinationCountry } : {}) }, orderBy: { createdAt: 'desc' } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const filters: SQL[] = [eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt)];
  if (riskLevel) filters.push(eq(crossBorderTransferRecords.riskLevel, riskLevel));
  if (status) filters.push(eq(crossBorderTransferRecords.status, status));
  if (destinationCountry) filters.push(eq(crossBorderTransferRecords.destinationCountry, destinationCountry));
  const records = await db.select().from(crossBorderTransferRecords).where(and(...filters)).orderBy(desc(crossBorderTransferRecords.createdAt));
  // {{/if}}
  // {{#if ORM=none}}
  const records = [...transferStore.values()].filter((row) => row.tenantId === context.tenantId && row.removedAt === null && (!riskLevel || row.riskLevel === riskLevel) && (!status || row.status === status) && (!destinationCountry || row.destinationCountry === destinationCountry)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  // {{/if}}
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const { context, problem } = await staffContext(req);
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const actorId = context.actorId as string;
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) return NextResponse.json({ error: 'A JSON object is required' }, { status: 400 });
  const unknown = rejectUnknownFields(body, ['destinationCountry', 'recipientName', 'transferMechanism', 'safeguards', 'dataCategories', 'adequacyStatus', 'ndpcApprovalReference', 'status']);
  if (unknown) return NextResponse.json({ error: unknown }, { status: 400 });
  const normalized = buildTransferMutation(body);
  if (!normalized.ok) return NextResponse.json({ error: normalized.error }, { status: 400 });
  const data = normalized.value;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.crossBorderTransferRecord.create({ data: { ...data, tenantId: context.tenantId, removedAt: null } });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'cross-border', action: 'created', entityId: created.id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: auditChanges(data) } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => {
    const [created] = await tx.insert(crossBorderTransferRecords).values({ ...data, tenantId: context.tenantId, removedAt: null }).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'cross-border', action: 'created', entityId: created.id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: auditChanges(data) });
    return created;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const record: TransferRow = { id: crypto.randomUUID(), ...data, tenantId: context.tenantId, createdAt: data.updatedAt, removedAt: null };
  transferStore.set(record.id, record);
  auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'created', entityId: record.id, performedBy: actorId, changes: auditChanges(data), at: data.updatedAt });
  // {{/if}}
  return NextResponse.json(record, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { context, problem } = await staffContext(req);
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const actorId = context.actorId as string;
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) return NextResponse.json({ error: 'A JSON object is required' }, { status: 400 });
  const fields = ['destinationCountry', 'recipientName', 'transferMechanism', 'safeguards', 'dataCategories', 'adequacyStatus', 'ndpcApprovalReference', 'status'] as const;
  const unknown = rejectUnknownFields(body, ['id', ...fields]);
  if (unknown) return NextResponse.json({ error: unknown }, { status: 400 });
  const idResult = nonEmptyText(body.id, 'id', 200);
  if (!idResult.ok) return NextResponse.json({ error: idResult.error }, { status: 400 });
  if (!fields.some((field) => hasOwn(body, field))) return NextResponse.json({ error: 'Provide at least one allowlisted transfer field to update' }, { status: 400 });
  const id = idResult.value;
  let validationError: string | null = null;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.crossBorderTransferRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    if (!existing) return null;
    const normalized = buildTransferMutation(body, existing);
    if (!normalized.ok) { validationError = normalized.error; return null; }
    const data = normalized.value;
    await tx.crossBorderTransferRecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data });
    const updated = await tx.crossBorderTransferRecord.findFirstOrThrow({ where: { id, tenantId: context.tenantId, removedAt: null } });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'cross-border', action: 'updated', entityId: id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: auditChanges(data) } });
    return updated;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(crossBorderTransferRecords).where(and(eq(crossBorderTransferRecords.id, id), eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt))).limit(1);
    if (!existing) return null;
    const normalized = buildTransferMutation(body, existing);
    if (!normalized.ok) { validationError = normalized.error; return null; }
    const data = normalized.value;
    const [updated] = await tx.update(crossBorderTransferRecords).set(data).where(and(eq(crossBorderTransferRecords.id, id), eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt))).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'cross-border', action: 'updated', entityId: id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: auditChanges(data) });
    return updated;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = transferStore.get(id);
  let record: TransferRow | null = null;
  if (existing?.tenantId === context.tenantId && existing.removedAt === null) {
    const normalized = buildTransferMutation(body, existing);
    if (!normalized.ok) validationError = normalized.error;
    else {
      record = { ...existing, ...normalized.value, id };
      transferStore.set(id, record);
      auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'updated', entityId: id, performedBy: actorId, changes: auditChanges(normalized.value), at: normalized.value.updatedAt });
    }
  }
  // {{/if}}
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  return record ? NextResponse.json(record) : NextResponse.json({ error: 'Transfer record not found' }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  const { context, problem } = await staffContext(req);
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const actorId = context.actorId as string;
  const id = req.nextUrl.searchParams.get('id');
  if (!id?.trim()) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const archivedAt = new Date();
  // {{#if ORM=prisma}}
  const archived = await prisma.$transaction(async (tx) => {
    const existing = await tx.crossBorderTransferRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    if (!existing) return false;
    const result = await tx.crossBorderTransferRecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data: { removedAt: archivedAt, updatedAt: archivedAt } });
    if (result.count !== 1) return false;
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'cross-border', action: 'archived', entityId: id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: { destinationCountry: existing.destinationCountry, recipientName: existing.recipientName, removedAt: archivedAt.toISOString() } } });
    return true;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const archived = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(crossBorderTransferRecords).where(and(eq(crossBorderTransferRecords.id, id), eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt))).limit(1);
    if (!existing) return false;
    const [updated] = await tx.update(crossBorderTransferRecords).set({ removedAt: archivedAt, updatedAt: archivedAt }).where(and(eq(crossBorderTransferRecords.id, id), eq(crossBorderTransferRecords.tenantId, context.tenantId), isNull(crossBorderTransferRecords.removedAt))).returning();
    if (!updated) return false;
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'cross-border', action: 'archived', entityId: id, entityType: 'CrossBorderTransferRecord', performedBy: actorId, changes: { destinationCountry: existing.destinationCountry, recipientName: existing.recipientName, removedAt: archivedAt.toISOString() } });
    return true;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = transferStore.get(id);
  const archived = existing?.tenantId === context.tenantId && existing.removedAt === null;
  if (archived && existing) {
    transferStore.set(id, { ...existing, removedAt: archivedAt, updatedAt: archivedAt });
    auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'archived', entityId: id, performedBy: actorId, changes: { destinationCountry: existing.destinationCountry, recipientName: existing.recipientName, removedAt: archivedAt.toISOString() }, at: archivedAt });
  }
  // {{/if}}
  return archived ? NextResponse.json({ success: true, archived: true }) : NextResponse.json({ error: 'Transfer record not found' }, { status: 404 });
}
