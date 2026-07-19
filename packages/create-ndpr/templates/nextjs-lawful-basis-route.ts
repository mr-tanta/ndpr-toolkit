/** Next.js App Router — staff-only, tenant-scoped lawful-basis register for {{ORG_NAME_COMMENT}}. */
import { NextRequest, NextResponse } from 'next/server';
import { getNDPRContextProblem, resolveNDPRRequestContext } from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { complianceAuditLog, lawfulBasisRecords } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq, isNull } from 'drizzle-orm';
// {{/if}}

const LAWFUL_BASES = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests'] as const;
type LawfulBasis = (typeof LAWFUL_BASES)[number];
type Validation<T> = { ok: true; value: T } | { ok: false; error: string };
interface BasisExisting {
  activityName: string;
  lawfulBasis: string;
  justification: string;
  dataCategories: unknown;
  purposes: unknown;
  reviewDate: Date | null;
}
interface BasisMutation {
  activityName: string;
  lawfulBasis: LawfulBasis;
  justification: string;
  dataCategories: string[];
  purposes: string[];
  assessedBy: string;
  assessedAt: Date;
  reviewDate: Date | null;
  updatedAt: Date;
}

// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface BasisRow extends BasisMutation { id: string; tenantId: string; createdAt: Date; removedAt: Date | null }
const lawfulBasisStore = new Map<string, BasisRow>();
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
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    return { ok: false, error: `${field} must be non-empty text of at most ${maxLength} characters` };
  }
  return { ok: true, value: value.trim() };
}
function nonEmptyStringArray(value: unknown, field: string): Validation<string[]> {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    return { ok: false, error: `${field} must be a non-empty array with at most 100 items` };
  }
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) return { ok: false, error: `${field} must contain only non-empty strings` };
    if (!result.includes(item.trim())) result.push(item.trim());
  }
  return { ok: true, value: result };
}
function isLawfulBasis(value: unknown): value is LawfulBasis {
  return typeof value === 'string' && (LAWFUL_BASES as readonly string[]).includes(value);
}
function parseReviewDate(value: unknown): Date | null | undefined {
  if (value === null || value === '') return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : undefined;
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
  return new Date(timestamp);
}
function buildBasisMutation(input: Record<string, unknown>, actorId: string, existing?: BasisExisting, now = new Date()): Validation<BasisMutation> {
  const activityName = hasOwn(input, 'activityName') ? nonEmptyText(input.activityName, 'activityName', 500) : existing ? nonEmptyText(existing.activityName, 'stored activityName', 500) : { ok: false as const, error: 'activityName is required' };
  if (!activityName.ok) return activityName;
  const basisValue = hasOwn(input, 'lawfulBasis') ? input.lawfulBasis : existing?.lawfulBasis;
  if (!isLawfulBasis(basisValue)) return { ok: false, error: 'lawfulBasis is not one of the six supported NDPA bases' };
  const justification = hasOwn(input, 'justification') ? nonEmptyText(input.justification, 'justification') : existing ? nonEmptyText(existing.justification, 'stored justification') : { ok: false as const, error: 'justification is required' };
  if (!justification.ok) return justification;
  if (basisValue === 'legitimate_interests' && justification.value.length < 20) {
    return { ok: false, error: 'legitimate_interests requires a detailed justification covering the interest, necessity, and balancing assessment' };
  }
  const categories = nonEmptyStringArray(hasOwn(input, 'dataCategories') ? input.dataCategories : existing?.dataCategories, 'dataCategories');
  if (!categories.ok) return categories;
  const purposes = nonEmptyStringArray(hasOwn(input, 'purposes') ? input.purposes : existing?.purposes, 'purposes');
  if (!purposes.ok) return purposes;
  let reviewDate: Date | null;
  if (hasOwn(input, 'reviewDate')) {
    const parsed = parseReviewDate(input.reviewDate);
    if (parsed === undefined) return { ok: false, error: 'reviewDate must be null, YYYY-MM-DD, or an ISO timestamp with a timezone' };
    if (parsed !== null && parsed.getTime() <= now.getTime()) return { ok: false, error: 'reviewDate must be in the future' };
    reviewDate = parsed;
  } else {
    const parsed = parseReviewDate(existing?.reviewDate ?? null);
    if (parsed === undefined) return { ok: false, error: 'Stored reviewDate is invalid' };
    reviewDate = parsed;
  }
  return { ok: true, value: { activityName: activityName.value, lawfulBasis: basisValue, justification: justification.value, dataCategories: categories.value, purposes: purposes.value, assessedBy: actorId, assessedAt: now, reviewDate, updatedAt: now } };
}
function auditChanges(data: BasisMutation) {
  return { activityName: data.activityName, lawfulBasis: data.lawfulBasis, assessedBy: data.assessedBy, reviewDate: data.reviewDate?.toISOString() ?? null };
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
    const record = await prisma.lawfulBasisRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    // {{/if}}
    // {{#if ORM=drizzle}}
    const [record] = await db.select().from(lawfulBasisRecords).where(and(eq(lawfulBasisRecords.id, id), eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).limit(1);
    // {{/if}}
    // {{#if ORM=none}}
    const candidate = lawfulBasisStore.get(id);
    const record = candidate?.tenantId === context.tenantId && candidate.removedAt === null ? candidate : null;
    // {{/if}}
    return record ? NextResponse.json(record) : NextResponse.json({ error: 'Lawful-basis record not found' }, { status: 404 });
  }
  const basisValue = req.nextUrl.searchParams.get('lawfulBasis');
  if (basisValue !== null && !isLawfulBasis(basisValue)) return NextResponse.json({ error: 'lawfulBasis filter is not supported' }, { status: 400 });
  const basis = basisValue ?? undefined;
  // {{#if ORM=prisma}}
  const records = await prisma.lawfulBasisRecord.findMany({ where: { tenantId: context.tenantId, removedAt: null, ...(basis ? { lawfulBasis: basis } : {}) }, orderBy: { createdAt: 'desc' } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const records = basis
    ? await db.select().from(lawfulBasisRecords).where(and(eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt), eq(lawfulBasisRecords.lawfulBasis, basis))).orderBy(desc(lawfulBasisRecords.createdAt))
    : await db.select().from(lawfulBasisRecords).where(and(eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).orderBy(desc(lawfulBasisRecords.createdAt));
  // {{/if}}
  // {{#if ORM=none}}
  const records = [...lawfulBasisStore.values()].filter((row) => row.tenantId === context.tenantId && row.removedAt === null && (!basis || row.lawfulBasis === basis)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  // {{/if}}
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const { context, problem } = await staffContext(req);
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const actorId = context.actorId as string;
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) return NextResponse.json({ error: 'A JSON object is required' }, { status: 400 });
  const unknown = rejectUnknownFields(body, ['activityName', 'lawfulBasis', 'justification', 'dataCategories', 'purposes', 'reviewDate']);
  if (unknown) return NextResponse.json({ error: unknown }, { status: 400 });
  const normalized = buildBasisMutation(body, actorId);
  if (!normalized.ok) return NextResponse.json({ error: normalized.error }, { status: 400 });
  const data = normalized.value;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.lawfulBasisRecord.create({ data: { ...data, tenantId: context.tenantId, removedAt: null } });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'lawful-basis', action: 'created', entityId: created.id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: auditChanges(data) } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => {
    const [created] = await tx.insert(lawfulBasisRecords).values({ ...data, tenantId: context.tenantId, removedAt: null }).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'lawful-basis', action: 'created', entityId: created.id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: auditChanges(data) });
    return created;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const record: BasisRow = { id: crypto.randomUUID(), ...data, tenantId: context.tenantId, createdAt: data.updatedAt, removedAt: null };
  lawfulBasisStore.set(record.id, record);
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
  const unknown = rejectUnknownFields(body, ['id', 'activityName', 'lawfulBasis', 'justification', 'dataCategories', 'purposes', 'reviewDate']);
  if (unknown) return NextResponse.json({ error: unknown }, { status: 400 });
  const idResult = nonEmptyText(body.id, 'id', 200);
  if (!idResult.ok) return NextResponse.json({ error: idResult.error }, { status: 400 });
  if (!['activityName', 'lawfulBasis', 'justification', 'dataCategories', 'purposes', 'reviewDate'].some((field) => hasOwn(body, field))) return NextResponse.json({ error: 'Provide at least one allowlisted lawful-basis field to update' }, { status: 400 });
  const id = idResult.value;
  let validationError: string | null = null;
  // {{#if ORM=prisma}}
  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.lawfulBasisRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    if (!existing) return null;
    const normalized = buildBasisMutation(body, actorId, existing);
    if (!normalized.ok) { validationError = normalized.error; return null; }
    const data = normalized.value;
    await tx.lawfulBasisRecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data });
    const updated = await tx.lawfulBasisRecord.findFirstOrThrow({ where: { id, tenantId: context.tenantId, removedAt: null } });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'lawful-basis', action: 'updated', entityId: id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: auditChanges(data) } });
    return updated;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const record = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(lawfulBasisRecords).where(and(eq(lawfulBasisRecords.id, id), eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).limit(1);
    if (!existing) return null;
    const normalized = buildBasisMutation(body, actorId, existing);
    if (!normalized.ok) { validationError = normalized.error; return null; }
    const data = normalized.value;
    const [updated] = await tx.update(lawfulBasisRecords).set(data).where(and(eq(lawfulBasisRecords.id, id), eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'lawful-basis', action: 'updated', entityId: id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: auditChanges(data) });
    return updated;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = lawfulBasisStore.get(id);
  let record: BasisRow | null = null;
  if (existing?.tenantId === context.tenantId && existing.removedAt === null) {
    const normalized = buildBasisMutation(body, actorId, existing);
    if (!normalized.ok) validationError = normalized.error;
    else {
      record = { ...existing, ...normalized.value, id };
      lawfulBasisStore.set(id, record);
      auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'updated', entityId: id, performedBy: actorId, changes: auditChanges(normalized.value), at: normalized.value.updatedAt });
    }
  }
  // {{/if}}
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  return record ? NextResponse.json(record) : NextResponse.json({ error: 'Lawful-basis record not found' }, { status: 404 });
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
    const existing = await tx.lawfulBasisRecord.findFirst({ where: { id, tenantId: context.tenantId, removedAt: null } });
    if (!existing) return false;
    const result = await tx.lawfulBasisRecord.updateMany({ where: { id, tenantId: context.tenantId, removedAt: null }, data: { removedAt: archivedAt, updatedAt: archivedAt } });
    if (result.count !== 1) return false;
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'lawful-basis', action: 'archived', entityId: id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: { activityName: existing.activityName, removedAt: archivedAt.toISOString() } } });
    return true;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const archived = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(lawfulBasisRecords).where(and(eq(lawfulBasisRecords.id, id), eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).limit(1);
    if (!existing) return false;
    const [updated] = await tx.update(lawfulBasisRecords).set({ removedAt: archivedAt, updatedAt: archivedAt }).where(and(eq(lawfulBasisRecords.id, id), eq(lawfulBasisRecords.tenantId, context.tenantId), isNull(lawfulBasisRecords.removedAt))).returning();
    if (!updated) return false;
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'lawful-basis', action: 'archived', entityId: id, entityType: 'LawfulBasisRecord', performedBy: actorId, changes: { activityName: existing.activityName, removedAt: archivedAt.toISOString() } });
    return true;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const existing = lawfulBasisStore.get(id);
  const archived = existing?.tenantId === context.tenantId && existing.removedAt === null;
  if (archived && existing) {
    lawfulBasisStore.set(id, { ...existing, removedAt: archivedAt, updatedAt: archivedAt });
    auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'archived', entityId: id, performedBy: actorId, changes: { activityName: existing.activityName, removedAt: archivedAt.toISOString() }, at: archivedAt });
  }
  // {{/if}}
  return archived ? NextResponse.json({ success: true, archived: true }) : NextResponse.json({ error: 'Lawful-basis record not found' }, { status: 404 });
}
