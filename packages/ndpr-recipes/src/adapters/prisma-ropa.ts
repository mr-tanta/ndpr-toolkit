import {
  Prisma,
  type PrismaClient,
  type ProcessingRecord as PrismaProcessingRecord,
} from '@prisma/client';
import type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  StorageAdapter,
} from '@tantainnovative/ndpr-toolkit';
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

/** Creates an atomic, tenant-scoped Prisma ROPA adapter. */
export function prismaROPAAdapter(
  prisma: PrismaClient,
  context: TenantAdapterContext,
  orgMeta: ROPAOrgMetadata,
): StorageAdapter<RecordOfProcessingActivities> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<RecordOfProcessingActivities | null> {
      const [register, rows] = await Promise.all([
        prisma.ropaRegister.findFirst({ where: { tenantId, removedAt: null } }),
        prisma.processingRecord.findMany({
          where: { tenantId, removedAt: null },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      if (!register && rows.length === 0) return null;

      const records = rows.map(mapRowToProcessingRecord);
      const latestRecordUpdate = records.reduce(
        (latest, record) => Math.max(latest, record.updatedAt),
        0,
      );
      const metadata = register
        ? (register.metadata as unknown as ROPAMetadata)
        : metadataFromContext(orgMeta, tenantId, latestRecordUpdate);

      return {
        ...metadata,
        records,
        lastUpdated: Math.max(metadata.lastUpdated, latestRecordUpdate),
      };
    },

    async save(ropa: RecordOfProcessingActivities): Promise<void> {
      const { records: _records, ...metadata } = ropa;
      const retainedIds = ropa.records.map(({ id }) => id);

      await prisma.$transaction(async (transaction) => {
        await transaction.ropaRegister.upsert({
          where: { tenantId },
          create: { tenantId, metadata: toInputJson(metadata), removedAt: null },
          update: { metadata: toInputJson(metadata), removedAt: null },
        });
        await transaction.processingRecord.updateMany({
          where: {
            tenantId,
            removedAt: null,
            ...(retainedIds.length > 0 ? { id: { notIn: retainedIds } } : {}),
          },
          data: { removedAt: new Date() },
        });

        for (const record of ropa.records) {
          const row = mapProcessingRecordToRow(record, tenantId);
          await transaction.processingRecord.upsert({
            where: { tenantId_id: { tenantId, id: record.id } },
            create: row,
            update: row,
          });
        }
      });
    },

    async remove(): Promise<void> {
      const removedAt = new Date();
      await prisma.$transaction([
        prisma.processingRecord.updateMany({
          where: { tenantId, removedAt: null },
          data: { removedAt },
        }),
        prisma.ropaRegister.updateMany({
          where: { tenantId, removedAt: null },
          data: { removedAt },
        }),
      ]);
    },
  };
}

function mapRowToProcessingRecord(row: PrismaProcessingRecord): ProcessingRecord {
  if (row.recordData === null) {
    throw new Error(`Processing record ${row.id} is missing its lossless recordData snapshot`);
  }
  return {
    ...(row.recordData as unknown as ProcessingRecord),
    id: row.id,
    lawfulBasis: row.lawfulBasis as ProcessingRecord['lawfulBasis'],
    status: row.status as ProcessingRecord['status'],
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

function mapProcessingRecordToRow(
  record: ProcessingRecord,
  tenantId: string,
): Prisma.ProcessingRecordUncheckedCreateInput {
  return {
    tenantId,
    id: record.id,
    purpose: record.purposes[0] ?? record.name,
    lawfulBasis: record.lawfulBasis,
    dataCategories: toInputJson(record.dataCategories),
    dataSubjects: toInputJson(record.dataSubjectCategories),
    recipients: toInputJson(record.recipients),
    retentionPeriod: record.retentionPeriod,
    securityMeasures: toInputJson(record.securityMeasures),
    transferCountries: record.crossBorderTransfers
      ? toInputJson(record.crossBorderTransfers.map(({ destinationCountry }) => destinationCountry))
      : Prisma.DbNull,
    transferMechanism: record.crossBorderTransfers?.[0]?.transferMechanism ?? null,
    dpiaConducted: record.dpiaRequired,
    recordData: toInputJson(record),
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

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
