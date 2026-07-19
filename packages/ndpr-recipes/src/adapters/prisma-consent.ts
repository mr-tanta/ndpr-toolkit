import type { ConsentRecord as PrismaConsentRecord, PrismaClient } from '@prisma/client';
import type { ConsentSettings, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import {
  assertSubjectContext,
  serverStorageCapabilities,
  type ConsentAdapterContext,
} from './server-storage';

/** Creates a tenant- and subject-scoped Prisma consent adapter. */
export function prismaConsentAdapter(
  prisma: PrismaClient,
  context: ConsentAdapterContext,
): StorageAdapter<ConsentSettings> {
  assertSubjectContext(context);
  const { tenantId, subjectId } = context;
  const activeSubjectKey = JSON.stringify([tenantId, subjectId]);

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<ConsentSettings | null> {
      const record = await prisma.consentRecord.findFirst({
        where: { tenantId, subjectId, revokedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      return record ? mapRowToConsentSettings(record) : null;
    },

    async save(data: ConsentSettings): Promise<void> {
      await prisma.$transaction(async (transaction) => {
        await transaction.consentRecord.updateMany({
          where: { tenantId, subjectId, revokedAt: null },
          data: { revokedAt: new Date(), activeSubjectKey: null },
        });

        await transaction.consentRecord.create({
          data: {
            tenantId,
            subjectId,
            activeSubjectKey,
            consents: data.consents,
            version: data.version,
            method: data.method,
            hasInteracted: data.hasInteracted,
            lawfulBasis: data.lawfulBasis ?? null,
            ipAddress: context.ipAddress ?? null,
            userAgent: context.userAgent ?? null,
            clientTimestamp: new Date(data.timestamp),
          },
        });
      });
    },

    async remove(): Promise<void> {
      await prisma.consentRecord.updateMany({
        where: { tenantId, subjectId, revokedAt: null },
        data: { revokedAt: new Date(), activeSubjectKey: null },
      });
    },
  };
}

function mapRowToConsentSettings(record: PrismaConsentRecord): ConsentSettings {
  return {
    consents: record.consents as ConsentSettings['consents'],
    timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime(),
    version: record.version,
    method: record.method,
    hasInteracted: record.hasInteracted,
    lawfulBasis: (record.lawfulBasis as ConsentSettings['lawfulBasis']) ?? undefined,
  };
}
