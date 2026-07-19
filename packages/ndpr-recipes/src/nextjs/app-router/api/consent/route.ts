import { PrismaClient, type ConsentRecord } from '@prisma/client';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';
import {
  runSerializableTransaction,
  toInputJson,
  validateConsentPayload,
} from '../../../shared-contracts';

const prisma = new PrismaClient();

/** Load consent for the verified subject. Query/body subject IDs are ignored. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const record = await prisma.consentRecord.findFirst({
    where: {
      tenantId: context.tenantId,
      subjectId: context.subjectId as string,
      revokedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(record ? toConsentSettings(record) : null);
}

/**
 * Save one explicit consent choice for the verified subject. Replacement,
 * insert, and accountability audit are committed atomically. A repeated API
 * adapter request with the same client timestamp returns the original record.
 */
export async function POST(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const body = await parseJson(request);
  const validation = validateConsentPayload(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: validation.fields },
      { status: 400 },
    );
  }

  const settings = validation.data;
  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const clientTimestamp = new Date(settings.timestamp);
  const activeSubjectKey = JSON.stringify([tenantId, subjectId]);
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const userAgent = request.headers.get('user-agent');

  const transactionResult = await runSerializableTransaction(prisma, async (transaction) => {
    const replay = await transaction.consentRecord.findFirst({
      where: {
        tenantId,
        subjectId,
        clientTimestamp,
        version: settings.version,
        method: settings.method,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (replay) {
      return sameConsentMutation(replay, settings)
        ? { kind: 'record' as const, record: replay }
        : { kind: 'conflict' as const };
    }

    await transaction.consentRecord.updateMany({
      where: { tenantId, subjectId, revokedAt: null },
      data: { revokedAt: new Date(), activeSubjectKey: null },
    });
    const created = await transaction.consentRecord.create({
      data: {
        tenantId,
        subjectId,
        activeSubjectKey,
        consents: toInputJson(settings.consents),
        version: settings.version,
        method: settings.method,
        hasInteracted: settings.hasInteracted,
        lawfulBasis: settings.lawfulBasis ?? null,
        ipAddress,
        userAgent,
        clientTimestamp,
      },
    });
    await transaction.complianceAuditLog.create({
      data: {
        tenantId,
        module: 'consent',
        action: 'created',
        entityId: created.id,
        entityType: 'ConsentRecord',
        changes: toInputJson({
          version: settings.version,
          method: settings.method,
          hasInteracted: settings.hasInteracted,
          consentCategories: Object.keys(settings.consents),
          subjectId,
          subjectIdentitySource: context.subjectSource,
        }),
        performedBy: context.actorId,
        ipAddress,
      },
    });
    return { kind: 'record' as const, record: created };
  });

  if (!transactionResult.committed) {
    return NextResponse.json(
      { error: 'Concurrent consent update conflict; retry the same idempotent request.' },
      { status: 409 },
    );
  }
  const record = transactionResult.value;
  if (record.kind === 'conflict') {
    return NextResponse.json(
      { error: 'Idempotency collision: timestamp/version/method already identify a different consent payload.' },
      { status: 409 },
    );
  }
  return NextResponse.json(toConsentSettings(record.record), { status: 201 });
}

/** Revoke active consent for the verified subject without deleting evidence. */
export async function DELETE(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const revoked = await prisma.$transaction(async (transaction) => {
    const result = await transaction.consentRecord.updateMany({
      where: { tenantId, subjectId, revokedAt: null },
      data: { revokedAt: new Date(), activeSubjectKey: null },
    });
    if (result.count > 0) {
      await transaction.complianceAuditLog.create({
        data: {
          tenantId,
          module: 'consent',
          action: 'revoked',
          entityId: subjectId,
          entityType: 'ConsentRecord',
          changes: toInputJson({
            revokedRecords: result.count,
            subjectId,
            subjectIdentitySource: context.subjectSource,
          }),
          performedBy: context.actorId,
          ipAddress,
        },
      });
    }
    return result.count;
  });

  return NextResponse.json({ success: true, revoked });
}

function toConsentSettings(record: ConsentRecord): ConsentSettings {
  return {
    consents: record.consents as ConsentSettings['consents'],
    timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime(),
    version: record.version,
    method: record.method,
    hasInteracted: record.hasInteracted,
    lawfulBasis: (record.lawfulBasis as ConsentSettings['lawfulBasis']) ?? undefined,
  };
}

async function parseJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}


function sameConsentMutation(
  record: ConsentRecord,
  settings: ConsentSettings,
): boolean {
  const storedConsents = record.consents as Record<string, boolean>;
  return JSON.stringify(sortedConsentEntries(storedConsents))
      === JSON.stringify(sortedConsentEntries(settings.consents))
    && record.hasInteracted === settings.hasInteracted
    && (record.lawfulBasis ?? undefined) === settings.lawfulBasis;
}

function sortedConsentEntries(consents: Record<string, boolean>) {
  return Object.entries(consents).sort(([left], [right]) => left.localeCompare(right));
}
