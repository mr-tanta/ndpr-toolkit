import { and, desc, eq, isNull, notInArray } from 'drizzle-orm';
import type { CrossBorderTransfer, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import {
  crossBorderTransferRecords,
  type NewCrossBorderTransferRecord,
} from '../drizzle/schema';
import {
  assertTenantContext,
  serverStorageCapabilities,
  type TenantAdapterContext,
} from './server-storage';

/** Creates an atomic, tenant-scoped Drizzle cross-border transfer adapter. */
export function drizzleCrossBorderAdapter(
  db: any,
  context: TenantAdapterContext,
): StorageAdapter<CrossBorderTransfer[]> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<CrossBorderTransfer[] | null> {
      const rows: Array<typeof crossBorderTransferRecords.$inferSelect> = await db
        .select()
        .from(crossBorderTransferRecords)
        .where(
          and(
            eq(crossBorderTransferRecords.tenantId, tenantId),
            isNull(crossBorderTransferRecords.removedAt),
          ),
        )
        .orderBy(desc(crossBorderTransferRecords.createdAt));
      return rows.length === 0 ? null : rows.map(mapRowToCrossBorderTransfer);
    },

    async save(transfers: CrossBorderTransfer[]): Promise<void> {
      const retainedIds = transfers.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(crossBorderTransferRecords)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(crossBorderTransferRecords.tenantId, tenantId),
                  isNull(crossBorderTransferRecords.removedAt),
                  notInArray(crossBorderTransferRecords.id, retainedIds),
                )
              : and(
                  eq(crossBorderTransferRecords.tenantId, tenantId),
                  isNull(crossBorderTransferRecords.removedAt),
                ),
          );

        for (const transfer of transfers) {
          const row = mapCrossBorderTransferToRow(transfer, tenantId);
          await transaction
            .insert(crossBorderTransferRecords)
            .values(row)
            .onConflictDoUpdate({
              target: [crossBorderTransferRecords.tenantId, crossBorderTransferRecords.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      await db
        .update(crossBorderTransferRecords)
        .set({ removedAt: new Date() })
        .where(
          and(
            eq(crossBorderTransferRecords.tenantId, tenantId),
            isNull(crossBorderTransferRecords.removedAt),
          ),
        );
    },
  };
}

function mapRowToCrossBorderTransfer(
  row: typeof crossBorderTransferRecords.$inferSelect,
): CrossBorderTransfer {
  if (!row.transferData) {
    throw new Error(`Cross-border record ${row.id} is missing its lossless transferData snapshot`);
  }
  return {
    ...row.transferData,
    id: row.id,
    destinationCountry: row.destinationCountry,
    destinationCountryCode: row.destinationCountryCode ?? undefined,
    adequacyStatus: row.adequacyStatus,
    transferMechanism: row.transferMechanism,
    dataCategories: row.dataCategories,
    includesSensitiveData:
      row.includesSensitiveData ?? row.transferData.includesSensitiveData,
    estimatedDataSubjects: row.estimatedDataSubjects ?? undefined,
    recipientOrganization: row.recipientName,
    recipientContact: row.recipientContact ?? row.transferData.recipientContact,
    purpose: row.purpose ?? row.transferData.purpose,
    safeguards: row.safeguards,
    riskAssessment: row.riskAssessment ?? row.transferData.riskAssessment,
    riskLevel: row.riskLevel,
    ndpcApproval: row.ndpcApproval ?? undefined,
    tiaCompleted: row.tiaCompleted ?? row.transferData.tiaCompleted,
    tiaReference: row.tiaReference ?? undefined,
    frequency: row.frequency ?? row.transferData.frequency,
    startDate: row.startDate?.getTime() ?? row.transferData.startDate,
    endDate: row.endDate?.getTime(),
    status: row.status,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    reviewDate: row.reviewDate?.getTime(),
  };
}

function mapCrossBorderTransferToRow(
  transfer: CrossBorderTransfer,
  tenantId: string,
): NewCrossBorderTransferRecord {
  return {
    tenantId,
    id: transfer.id,
    destinationCountry: transfer.destinationCountry,
    destinationCountryCode: transfer.destinationCountryCode ?? null,
    recipientName: transfer.recipientOrganization,
    recipientContact: transfer.recipientContact,
    transferMechanism: transfer.transferMechanism,
    safeguards: transfer.safeguards,
    dataCategories: transfer.dataCategories,
    includesSensitiveData: transfer.includesSensitiveData,
    estimatedDataSubjects: transfer.estimatedDataSubjects ?? null,
    purpose: transfer.purpose,
    adequacyStatus: transfer.adequacyStatus,
    riskAssessment: transfer.riskAssessment,
    riskLevel: transfer.riskLevel,
    ndpcApprovalRequired: transfer.ndpcApproval?.required ?? false,
    ndpcApprovalReference: transfer.ndpcApproval?.referenceNumber ?? null,
    ndpcApproval: transfer.ndpcApproval ?? null,
    tiaCompleted: transfer.tiaCompleted,
    tiaReference: transfer.tiaReference ?? null,
    frequency: transfer.frequency,
    status: transfer.status,
    startDate: new Date(transfer.startDate),
    endDate: transfer.endDate ? new Date(transfer.endDate) : null,
    reviewDate: transfer.reviewDate ? new Date(transfer.reviewDate) : null,
    transferData: transfer,
    createdAt: new Date(transfer.createdAt),
    updatedAt: new Date(transfer.updatedAt),
    removedAt: null,
  };
}
