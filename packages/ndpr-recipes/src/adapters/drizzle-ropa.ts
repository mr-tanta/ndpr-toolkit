import { and, asc, eq, isNull, notInArray } from 'drizzle-orm';
import type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  StorageAdapter,
} from '@tantainnovative/ndpr-toolkit';
import {
  processingRecords,
  ropaRegisters,
  type NewProcessingRecord,
} from '../drizzle/schema';
import {
  assertTenantContext,
  serverStorageCapabilities,
  type TenantAdapterContext,
} from './server-storage';

export interface ROPAOrgMetadata {
  id?: string;
  organizationName: string;
  organizationContact: string;
  organizationAddress: string;
  dpoDetails?: RecordOfProcessingActivities['dpoDetails'];
  ndpcRegistrationNumber?: string;
  version?: string;
  exportFormats?: RecordOfProcessingActivities['exportFormats'];
}

type ROPAMetadata = Omit<RecordOfProcessingActivities, 'records'>;

/** Creates an atomic, tenant-scoped Drizzle ROPA adapter. */
export function drizzleROPAAdapter(
  db: any,
  context: TenantAdapterContext,
  orgMeta: ROPAOrgMetadata,
): StorageAdapter<RecordOfProcessingActivities> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<RecordOfProcessingActivities | null> {
      const registerRows: Array<typeof ropaRegisters.$inferSelect> = await db
        .select()
        .from(ropaRegisters)
        .where(and(eq(ropaRegisters.tenantId, tenantId), isNull(ropaRegisters.removedAt)))
        .limit(1);
      const rows: Array<typeof processingRecords.$inferSelect> = await db
        .select()
        .from(processingRecords)
        .where(
          and(eq(processingRecords.tenantId, tenantId), isNull(processingRecords.removedAt)),
        )
        .orderBy(asc(processingRecords.createdAt));
      const register = registerRows[0];
      if (!register && rows.length === 0) return null;

      const records = rows.map(mapRowToProcessingRecord);
      const latestRecordUpdate = records.reduce(
        (latest, record) => Math.max(latest, record.updatedAt),
        0,
      );
      const metadata =
        register?.metadata ?? metadataFromContext(orgMeta, tenantId, latestRecordUpdate);
      return {
        ...metadata,
        records,
        lastUpdated: Math.max(metadata.lastUpdated, latestRecordUpdate),
      };
    },

    async save(ropa: RecordOfProcessingActivities): Promise<void> {
      const { records: _records, ...metadata } = ropa;
      const retainedIds = ropa.records.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .insert(ropaRegisters)
          .values({ tenantId, metadata, removedAt: null, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: ropaRegisters.tenantId,
            set: { metadata, removedAt: null, updatedAt: new Date() },
          });
        await transaction
          .update(processingRecords)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(processingRecords.tenantId, tenantId),
                  isNull(processingRecords.removedAt),
                  notInArray(processingRecords.id, retainedIds),
                )
              : and(
                  eq(processingRecords.tenantId, tenantId),
                  isNull(processingRecords.removedAt),
                ),
          );

        for (const record of ropa.records) {
          const row = mapProcessingRecordToRow(record, tenantId);
          await transaction
            .insert(processingRecords)
            .values(row)
            .onConflictDoUpdate({
              target: [processingRecords.tenantId, processingRecords.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      const removedAt = new Date();
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(processingRecords)
          .set({ removedAt })
          .where(
            and(eq(processingRecords.tenantId, tenantId), isNull(processingRecords.removedAt)),
          );
        await transaction
          .update(ropaRegisters)
          .set({ removedAt, updatedAt: removedAt })
          .where(and(eq(ropaRegisters.tenantId, tenantId), isNull(ropaRegisters.removedAt)));
      });
    },
  };
}

function mapRowToProcessingRecord(row: typeof processingRecords.$inferSelect): ProcessingRecord {
  if (!row.recordData) {
    throw new Error(`Processing record ${row.id} is missing its lossless recordData snapshot`);
  }
  return {
    ...row.recordData,
    id: row.id,
    lawfulBasis: row.lawfulBasis,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

function mapProcessingRecordToRow(
  record: ProcessingRecord,
  tenantId: string,
): NewProcessingRecord {
  return {
    tenantId,
    id: record.id,
    purpose: record.purposes[0] ?? record.name,
    lawfulBasis: record.lawfulBasis,
    dataCategories: record.dataCategories,
    dataSubjects: record.dataSubjectCategories,
    recipients: record.recipients,
    retentionPeriod: record.retentionPeriod,
    securityMeasures: record.securityMeasures,
    transferCountries:
      record.crossBorderTransfers?.map(({ destinationCountry }) => destinationCountry) ?? null,
    transferMechanism: record.crossBorderTransfers?.[0]?.transferMechanism ?? null,
    dpiaConducted: record.dpiaRequired,
    recordData: record,
    status: record.status,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    removedAt: null,
  };
}

function metadataFromContext(
  orgMeta: ROPAOrgMetadata,
  tenantId: string,
  lastUpdated: number,
): ROPAMetadata {
  return {
    id: orgMeta.id ?? `ropa-${tenantId}`,
    organizationName: orgMeta.organizationName,
    organizationContact: orgMeta.organizationContact,
    organizationAddress: orgMeta.organizationAddress,
    dpoDetails: orgMeta.dpoDetails,
    ndpcRegistrationNumber: orgMeta.ndpcRegistrationNumber,
    lastUpdated,
    version: orgMeta.version ?? '1.0',
    exportFormats: orgMeta.exportFormats,
  };
}
