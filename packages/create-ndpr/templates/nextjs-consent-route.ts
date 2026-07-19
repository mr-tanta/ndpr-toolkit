/**
 * Next.js App Router — tenant-scoped consent persistence for {{ORG_NAME_COMMENT}}.
 * Subject and tenant identity come only from the generated server context.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { consentRecords, complianceAuditLog } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq, isNull } from 'drizzle-orm';
// {{/if}}
// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface ConsentRecord {
  id: string; tenantId: string; subjectId: string; activeSubjectKey: string | null;
  consents: Record<string, boolean>; version: string; method: string;
  hasInteracted: boolean; lawfulBasis: string | null;
  ipAddress: string | null; userAgent: string | null; clientTimestamp: Date;
  createdAt: Date; revokedAt: Date | null;
}
interface AuditRow {
  id: string; tenantId: string; module: string; action: string;
  entityId: string; performedBy: string | null; at: Date;
}
const consentStore = new Map<string, ConsentRecord>();
const auditLog: AuditRow[] = [];
// {{/if}}

interface ConsentSettings {
  consents: Record<string, boolean>;
  version: string;
  method: string;
  hasInteracted: boolean;
  lawfulBasis?: string;
  timestamp: number;
}

function validateConsentBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return 'A JSON object is required';
  const value = body as Record<string, unknown>;
  if (!value.consents || typeof value.consents !== 'object' || Array.isArray(value.consents)) {
    return 'consents must be an object';
  }
  if (Object.values(value.consents).some((consent) => typeof consent !== 'boolean')) {
    return 'Every consent value must be boolean';
  }
  if (typeof value.version !== 'string' || !value.version.trim()) return 'version is required';
  if (value.method !== undefined && (typeof value.method !== 'string' || !value.method.trim())) {
    return 'method must be a non-empty string';
  }
  if (value.hasInteracted !== true && value.hasInteracted !== false) {
    return 'hasInteracted must be boolean';
  }
  if (typeof value.timestamp !== 'number' || !Number.isSafeInteger(value.timestamp) || value.timestamp < 0
      || !Number.isFinite(new Date(value.timestamp).getTime())) {
    return 'timestamp must be a non-negative safe-integer epoch value within the valid Date range';
  }
  if (value.lawfulBasis !== undefined && typeof value.lawfulBasis !== 'string') {
    return 'lawfulBasis must be a string';
  }
  return null;
}

export async function GET(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const { tenantId, subjectId } = context as typeof context & { subjectId: string };

  // {{#if ORM=prisma}}
  const record = await prisma.consentRecord.findFirst({
    where: { tenantId, subjectId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const [record] = await db.select().from(consentRecords)
    .where(and(
      eq(consentRecords.tenantId, tenantId),
      eq(consentRecords.subjectId, subjectId),
      isNull(consentRecords.revokedAt),
    ))
    .orderBy(desc(consentRecords.createdAt)).limit(1);
  // {{/if}}
  // {{#if ORM=none}}
  const record = [...consentStore.values()]
    .filter((row) => row.tenantId === tenantId && row.subjectId === subjectId && row.revokedAt === null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
  // {{/if}}
  return NextResponse.json(record ? toConsentSettings(record) : null);
}

export async function POST(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const { tenantId, subjectId } = context as typeof context & { subjectId: string };
  const body: unknown = await req.json().catch(() => null);
  const validationError = validateConsentBody(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const value = body as Omit<ConsentSettings, 'method'> & { method?: string };
  const input: ConsentSettings = { ...value, method: value.method ?? 'api' };

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || null;
  const userAgent = req.headers.get('user-agent');
  const clientTimestamp = new Date(input.timestamp);
  const activeSubjectKey = JSON.stringify([tenantId, subjectId]);

  // {{#if ORM=prisma}}
  const transactionResult = await prisma.$transaction(async (tx) => {
    const replay = await tx.consentRecord.findFirst({
      where: {
        tenantId,
        subjectId,
        clientTimestamp,
        version: input.version,
        method: input.method,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (replay) {
      return sameConsentMutation(replay, input)
        ? { kind: 'record' as const, record: replay }
        : { kind: 'collision' as const };
    }

    await tx.consentRecord.updateMany({
      where: { tenantId, subjectId, revokedAt: null },
      data: { revokedAt: new Date(), activeSubjectKey: null },
    });
    const created = await tx.consentRecord.create({ data: {
      tenantId, subjectId, activeSubjectKey, consents: input.consents,
      version: input.version, method: input.method,
      hasInteracted: input.hasInteracted, lawfulBasis: input.lawfulBasis ?? null,
      ipAddress, userAgent, clientTimestamp,
    } });
    await tx.complianceAuditLog.create({ data: {
      tenantId, module: 'consent', action: 'created', entityId: created.id,
      entityType: 'ConsentRecord', performedBy: context.actorId,
      changes: {
        subjectId, version: input.version, method: input.method,
        hasInteracted: input.hasInteracted,
        consentCategories: Object.keys(input.consents),
      },
    } });
    return { kind: 'record' as const, record: created };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }).catch((error: unknown) => {
    if (isConcurrencyConflict(error)) return null;
    throw error;
  });
  if (!transactionResult) {
    return NextResponse.json(
      { error: 'Concurrent consent update conflict; retry the same idempotent request.' },
      { status: 409 },
    );
  }
  if (transactionResult.kind === 'collision') {
    return NextResponse.json(
      { error: 'Idempotency collision: timestamp/version/method identify different consent data.' },
      { status: 409 },
    );
  }
  const record = transactionResult.record;
  // {{/if}}
  // {{#if ORM=drizzle}}
  const transactionResult = await db.transaction(async (tx) => {
    const [replay] = await tx.select().from(consentRecords).where(and(
      eq(consentRecords.tenantId, tenantId),
      eq(consentRecords.subjectId, subjectId),
      eq(consentRecords.clientTimestamp, clientTimestamp),
      eq(consentRecords.version, input.version),
      eq(consentRecords.method, input.method),
    )).orderBy(desc(consentRecords.createdAt)).limit(1);
    if (replay) {
      return sameConsentMutation(replay, input)
        ? { kind: 'record' as const, record: replay }
        : { kind: 'collision' as const };
    }

    await tx.update(consentRecords).set({
      revokedAt: new Date(),
      activeSubjectKey: null,
    }).where(and(
      eq(consentRecords.tenantId, tenantId),
      eq(consentRecords.subjectId, subjectId),
      isNull(consentRecords.revokedAt),
    ));
    const [created] = await tx.insert(consentRecords).values({
      tenantId, subjectId, activeSubjectKey, consents: input.consents,
      version: input.version, method: input.method,
      hasInteracted: input.hasInteracted, lawfulBasis: input.lawfulBasis ?? null,
      ipAddress, userAgent, clientTimestamp,
    }).returning();
    await tx.insert(complianceAuditLog).values({
      tenantId, module: 'consent', action: 'created', entityId: created.id,
      entityType: 'ConsentRecord', performedBy: context.actorId,
      changes: {
        subjectId, version: input.version, method: input.method,
        hasInteracted: input.hasInteracted,
        consentCategories: Object.keys(input.consents),
      },
    });
    return { kind: 'record' as const, record: created };
  }, { isolationLevel: 'serializable' }).catch((error: unknown) => {
    if (isConcurrencyConflict(error)) return null;
    throw error;
  });
  if (!transactionResult) {
    return NextResponse.json(
      { error: 'Concurrent consent update conflict; retry the same idempotent request.' },
      { status: 409 },
    );
  }
  if (transactionResult.kind === 'collision') {
    return NextResponse.json(
      { error: 'Idempotency collision: timestamp/version/method identify different consent data.' },
      { status: 409 },
    );
  }
  const record = transactionResult.record;
  // {{/if}}
  // {{#if ORM=none}}
  const replay = [...consentStore.values()].find((row) =>
    row.tenantId === tenantId
    && row.subjectId === subjectId
    && row.clientTimestamp.getTime() === input.timestamp
    && row.version === input.version
    && row.method === input.method,
  );
  if (replay) {
    if (!sameConsentMutation(replay, input)) {
      return NextResponse.json(
        { error: 'Idempotency collision: timestamp/version/method identify different consent data.' },
        { status: 409 },
      );
    }
    return NextResponse.json(toConsentSettings(replay), { status: 201 });
  }
  const now = new Date();
  for (const row of consentStore.values()) {
    if (row.tenantId === tenantId && row.subjectId === subjectId && row.revokedAt === null) {
      row.revokedAt = now;
      row.activeSubjectKey = null;
    }
  }
  const record: ConsentRecord = {
    id: crypto.randomUUID(), tenantId, subjectId, activeSubjectKey,
    consents: input.consents, version: input.version, method: input.method,
    hasInteracted: input.hasInteracted, lawfulBasis: input.lawfulBasis ?? null,
    ipAddress, userAgent, clientTimestamp, createdAt: now, revokedAt: null,
  };
  consentStore.set(record.id, record);
  auditLog.push({
    id: crypto.randomUUID(), tenantId, module: 'consent', action: 'created',
    entityId: record.id, performedBy: context.actorId, at: now,
  });
  // {{/if}}
  return NextResponse.json(toConsentSettings(record), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });
  const { tenantId, subjectId } = context as typeof context & { subjectId: string };
  const now = new Date();

  // {{#if ORM=prisma}}
  const revoked = await prisma.$transaction(async (tx) => {
    const result = await tx.consentRecord.updateMany({
      where: { tenantId, subjectId, revokedAt: null },
      data: { revokedAt: now, activeSubjectKey: null },
    });
    if (result.count > 0) {
      await tx.complianceAuditLog.create({ data: {
        tenantId, module: 'consent', action: 'revoked', entityId: subjectId,
        entityType: 'ConsentRecord', performedBy: context.actorId,
        changes: { subjectId, revokedRecords: result.count },
      } });
    }
    return result.count;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const revoked = await db.transaction(async (tx) => {
    const rows = await tx.update(consentRecords).set({
      revokedAt: now,
      activeSubjectKey: null,
    }).where(and(
      eq(consentRecords.tenantId, tenantId),
      eq(consentRecords.subjectId, subjectId),
      isNull(consentRecords.revokedAt),
    )).returning({ id: consentRecords.id });
    if (rows.length > 0) {
      await tx.insert(complianceAuditLog).values({
        tenantId, module: 'consent', action: 'revoked', entityId: subjectId,
        entityType: 'ConsentRecord', performedBy: context.actorId,
        changes: { subjectId, revokedRecords: rows.length },
      });
    }
    return rows.length;
  });
  // {{/if}}
  // {{#if ORM=none}}
  let revoked = 0;
  for (const row of consentStore.values()) {
    if (row.tenantId === tenantId && row.subjectId === subjectId && row.revokedAt === null) {
      row.revokedAt = now;
      row.activeSubjectKey = null;
      revoked += 1;
    }
  }
  if (revoked > 0) {
    auditLog.push({
      id: crypto.randomUUID(), tenantId, module: 'consent', action: 'revoked',
      entityId: subjectId, performedBy: context.actorId, at: now,
    });
  }
  // {{/if}}
  return NextResponse.json({ success: true, revoked });
}

function toConsentSettings(record: {
  consents: unknown;
  version: string;
  method: string;
  hasInteracted: boolean;
  lawfulBasis: string | null;
  clientTimestamp: Date | null;
  createdAt: Date;
}): ConsentSettings {
  return {
    consents: record.consents as Record<string, boolean>,
    timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime(),
    version: record.version,
    method: record.method,
    hasInteracted: record.hasInteracted,
    lawfulBasis: record.lawfulBasis ?? undefined,
  };
}

function sameConsentMutation(
  record: { consents: unknown; hasInteracted: boolean; lawfulBasis: string | null },
  input: ConsentSettings,
): boolean {
  const storedConsents = record.consents as Record<string, boolean>;
  return JSON.stringify(sortedConsentEntries(storedConsents))
      === JSON.stringify(sortedConsentEntries(input.consents))
    && record.hasInteracted === input.hasInteracted
    && (record.lawfulBasis ?? undefined) === input.lawfulBasis;
}

function sortedConsentEntries(consents: Record<string, boolean>) {
  return Object.entries(consents).sort(([left], [right]) => left.localeCompare(right));
}

function isConcurrencyConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: unknown; cause?: unknown };
  const code = typeof candidate.code === 'string' ? candidate.code : '';
  if (['P2002', 'P2034', '23505', '40001', '40P01'].includes(code)) return true;
  return candidate.cause !== error && isConcurrencyConflict(candidate.cause);
}
