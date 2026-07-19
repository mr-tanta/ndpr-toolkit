import { and, desc, eq, isNull } from 'drizzle-orm';
import type { ConsentSettings, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import { consentRecords } from '../drizzle/schema';
import {
  assertSubjectContext,
  serverStorageCapabilities,
  type ConsentAdapterContext,
} from './server-storage';

/** Creates a tenant- and subject-scoped Drizzle consent adapter. */
export function drizzleConsentAdapter(
  db: any,
  context: ConsentAdapterContext,
): StorageAdapter<ConsentSettings> {
  assertSubjectContext(context);
  const { tenantId, subjectId } = context;
  const activeSubjectKey = JSON.stringify([tenantId, subjectId]);

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<ConsentSettings | null> {
      const rows = await db
        .select()
        .from(consentRecords)
        .where(
          and(
            eq(consentRecords.tenantId, tenantId),
            eq(consentRecords.subjectId, subjectId),
            isNull(consentRecords.revokedAt),
          ),
        )
        .orderBy(desc(consentRecords.createdAt))
        .limit(1);
      const record: typeof consentRecords.$inferSelect | undefined = rows[0];
      if (!record) return null;

      return {
        consents: record.consents,
        timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime(),
        version: record.version,
        method: record.method,
        hasInteracted: record.hasInteracted,
        lawfulBasis: record.lawfulBasis ?? undefined,
      };
    },

    async save(data: ConsentSettings): Promise<void> {
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(consentRecords)
          .set({ revokedAt: new Date(), activeSubjectKey: null })
          .where(
            and(
              eq(consentRecords.tenantId, tenantId),
              eq(consentRecords.subjectId, subjectId),
              isNull(consentRecords.revokedAt),
            ),
          );

        await transaction.insert(consentRecords).values({
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
        });
      });
    },

    async remove(): Promise<void> {
      await db
        .update(consentRecords)
        .set({ revokedAt: new Date(), activeSubjectKey: null })
        .where(
          and(
            eq(consentRecords.tenantId, tenantId),
            eq(consentRecords.subjectId, subjectId),
            isNull(consentRecords.revokedAt),
          ),
        );
    },
  };
}
