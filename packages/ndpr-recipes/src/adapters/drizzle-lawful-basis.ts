import { and, desc, eq, isNull, notInArray } from 'drizzle-orm';
import type { ProcessingActivity, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import { lawfulBasisRecords, type NewLawfulBasisRecord } from '../drizzle/schema';
import {
  assertTenantContext,
  serverStorageCapabilities,
  type TenantAdapterContext,
} from './server-storage';

/** Creates an atomic, tenant-scoped Drizzle lawful-basis adapter. */
export function drizzleLawfulBasisAdapter(
  db: any,
  context: TenantAdapterContext,
  assessedBy: string,
): StorageAdapter<ProcessingActivity[]> {
  assertTenantContext(context);
  if (assessedBy.trim().length === 0) {
    throw new TypeError('assessedBy must be a non-empty server-established actor identifier');
  }
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<ProcessingActivity[] | null> {
      const rows: Array<typeof lawfulBasisRecords.$inferSelect> = await db
        .select()
        .from(lawfulBasisRecords)
        .where(
          and(eq(lawfulBasisRecords.tenantId, tenantId), isNull(lawfulBasisRecords.removedAt)),
        )
        .orderBy(desc(lawfulBasisRecords.createdAt));
      return rows.length === 0 ? null : rows.map(mapRowToProcessingActivity);
    },

    async save(activities: ProcessingActivity[]): Promise<void> {
      const retainedIds = activities.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(lawfulBasisRecords)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(lawfulBasisRecords.tenantId, tenantId),
                  isNull(lawfulBasisRecords.removedAt),
                  notInArray(lawfulBasisRecords.id, retainedIds),
                )
              : and(
                  eq(lawfulBasisRecords.tenantId, tenantId),
                  isNull(lawfulBasisRecords.removedAt),
                ),
          );

        for (const activity of activities) {
          const row = mapProcessingActivityToRow(activity, tenantId, assessedBy);
          await transaction
            .insert(lawfulBasisRecords)
            .values(row)
            .onConflictDoUpdate({
              target: [lawfulBasisRecords.tenantId, lawfulBasisRecords.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      await db
        .update(lawfulBasisRecords)
        .set({ removedAt: new Date() })
        .where(
          and(eq(lawfulBasisRecords.tenantId, tenantId), isNull(lawfulBasisRecords.removedAt)),
        );
    },
  };
}

function mapRowToProcessingActivity(
  row: typeof lawfulBasisRecords.$inferSelect,
): ProcessingActivity {
  if (!row.activityData) {
    throw new Error(`Lawful-basis record ${row.id} is missing its lossless activityData snapshot`);
  }
  return {
    ...row.activityData,
    id: row.id,
    lawfulBasis: row.lawfulBasis,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    reviewDate: row.reviewDate?.getTime(),
  };
}

function mapProcessingActivityToRow(
  activity: ProcessingActivity,
  tenantId: string,
  assessedBy: string,
): NewLawfulBasisRecord {
  return {
    tenantId,
    id: activity.id,
    activityName: activity.name,
    description: activity.description,
    lawfulBasis: activity.lawfulBasis,
    justification: activity.lawfulBasisJustification,
    dataCategories: activity.dataCategories,
    involvesSensitiveData: activity.involvesSensitiveData,
    sensitiveDataCondition: activity.sensitiveDataCondition ?? null,
    dataSubjectCategories: activity.dataSubjectCategories,
    purposes: activity.purposes,
    retentionPeriod: activity.retentionPeriod,
    retentionJustification: activity.retentionJustification ?? null,
    recipients: activity.recipients ?? null,
    crossBorderTransfer: activity.crossBorderTransfer,
    status: activity.status,
    dpoApproval: activity.dpoApproval ?? null,
    activityData: activity,
    assessedBy,
    assessedAt: new Date(activity.updatedAt),
    reviewDate: activity.reviewDate ? new Date(activity.reviewDate) : null,
    createdAt: new Date(activity.createdAt),
    updatedAt: new Date(activity.updatedAt),
    removedAt: null,
  };
}
