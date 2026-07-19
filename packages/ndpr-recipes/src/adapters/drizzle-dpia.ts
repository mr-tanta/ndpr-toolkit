import { and, desc, eq, isNull, notInArray } from 'drizzle-orm';
import type { DPIAResult, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import { dpiaRecords, type NewDPIARecord } from '../drizzle/schema';
import {
  assertTenantContext,
  serverStorageCapabilities,
  type TenantAdapterContext,
} from './server-storage';

/** Creates an atomic, tenant-scoped Drizzle DPIA adapter. */
export function drizzleDPIAAdapter(
  db: any,
  context: TenantAdapterContext,
): StorageAdapter<DPIAResult[]> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<DPIAResult[] | null> {
      const rows: Array<typeof dpiaRecords.$inferSelect> = await db
        .select()
        .from(dpiaRecords)
        .where(and(eq(dpiaRecords.tenantId, tenantId), isNull(dpiaRecords.removedAt)))
        .orderBy(desc(dpiaRecords.createdAt));
      return rows.length === 0 ? null : rows.map(mapRowToDPIAResult);
    },

    async save(results: DPIAResult[]): Promise<void> {
      const retainedIds = results.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(dpiaRecords)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(dpiaRecords.tenantId, tenantId),
                  isNull(dpiaRecords.removedAt),
                  notInArray(dpiaRecords.id, retainedIds),
                )
              : and(eq(dpiaRecords.tenantId, tenantId), isNull(dpiaRecords.removedAt)),
          );

        for (const result of results) {
          const row = mapDPIAResultToRow(result, tenantId);
          await transaction
            .insert(dpiaRecords)
            .values(row)
            .onConflictDoUpdate({
              target: [dpiaRecords.tenantId, dpiaRecords.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      await db
        .update(dpiaRecords)
        .set({ removedAt: new Date() })
        .where(and(eq(dpiaRecords.tenantId, tenantId), isNull(dpiaRecords.removedAt)));
    },
  };
}

function mapRowToDPIAResult(row: typeof dpiaRecords.$inferSelect): DPIAResult {
  return {
    ...row.dpiaData,
    id: row.id,
    title: row.projectName,
    processingDescription: row.description,
    startedAt: row.createdAt.getTime(),
    completedAt: row.dpiaData.completedAt,
    overallRiskLevel: row.overallRisk,
    canProceed: row.dpiaData.canProceed,
  };
}

function mapDPIAResultToRow(result: DPIAResult, tenantId: string): NewDPIARecord {
  return {
    tenantId,
    id: result.id,
    projectName: result.title,
    description: result.processingDescription,
    dpiaData: result,
    overallRisk: result.overallRiskLevel,
    score: calculateRiskScore(result),
    status: result.completedAt ? (result.canProceed ? 'approved' : 'completed') : 'in_progress',
    conductedBy: result.assessor.email || result.assessor.name,
    approvedBy: result.canProceed ? result.assessor.email || result.assessor.name : null,
    createdAt: new Date(result.startedAt),
    updatedAt: new Date(result.completedAt ?? result.startedAt),
    removedAt: null,
  };
}

/** Highest current (residual when available) risk score, matching toolkit risk semantics. */
function calculateRiskScore(result: DPIAResult): number {
  return result.risks.reduce(
    (highest, risk) => Math.max(highest, risk.residualScore ?? risk.score),
    0,
  );
}
