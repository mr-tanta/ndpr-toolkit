import { PrismaClient, type ConsentRecord } from '@prisma/client';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit/server';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';
import {
  runSerializableTransaction,
  toInputJson,
  validateConsentPayload,
} from '../../nextjs/shared-contracts';

const prisma = new PrismaClient();
export const consentRouter = Router();

/** Load consent for the verified subject; query subject IDs are ignored. */
consentRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const row = await prisma.consentRecord.findFirst({
    where: {
      tenantId: context.tenantId,
      subjectId: context.subjectId as string,
      revokedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });
  return response.json(row ? toConsentSettings(row) : null);
});

/** Save consent replacement and its audit record in one transaction. */
consentRouter.post('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const validation = validateConsentPayload(request.body);
  if (!validation.valid) {
    return response.status(400).json({
      error: 'Validation failed.',
      fields: validation.fields,
    });
  }

  const settings = validation.data;
  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const clientTimestamp = new Date(settings.timestamp);
  const activeSubjectKey = JSON.stringify([tenantId, subjectId]);
  const ipAddress = request.ip || request.socket.remoteAddress || null;
  const userAgent = request.get('user-agent') ?? null;

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
    return response.status(409).json({
      error: 'Concurrent consent update conflict; retry the same idempotent request.',
    });
  }
  const row = transactionResult.value;
  if (row.kind === 'conflict') {
    return response.status(409).json({
      error: 'Idempotency collision: timestamp/version/method already identify a different consent payload.',
    });
  }
  return response.status(201).json(toConsentSettings(row.record));
});

/** Revoke active consent for the verified subject without deleting evidence. */
consentRouter.delete('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const tenantId = context.tenantId;
  const subjectId = context.subjectId as string;
  const ipAddress = request.ip || request.socket.remoteAddress || null;
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
  return response.json({ success: true, revoked });
});

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
