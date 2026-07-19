import { and, desc, eq, isNull, notInArray } from 'drizzle-orm';
import type {
  BreachReport,
  RegulatoryNotification,
  RiskAssessment,
  StorageAdapter,
} from '@tantainnovative/ndpr-toolkit';
import { breachReports, type NewBreachReport } from '../drizzle/schema';
import {
  assertTenantContext,
  serverStorageCapabilities,
  type TenantAdapterContext,
} from './server-storage';

export interface BreachState {
  reports: BreachReport[];
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
}

/** Creates an atomic, tenant-scoped Drizzle adapter for complete breach state. */
export function drizzleBreachAdapter(
  db: any,
  context: TenantAdapterContext,
): StorageAdapter<BreachState> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<BreachState | null> {
      const rows: Array<typeof breachReports.$inferSelect> = await db
        .select()
        .from(breachReports)
        .where(and(eq(breachReports.tenantId, tenantId), isNull(breachReports.removedAt)))
        .orderBy(desc(breachReports.reportedAt));
      if (rows.length === 0) return null;

      return {
        reports: rows.map(mapRowToBreachReport),
        assessments: rows.flatMap(({ assessments }) => assessments),
        notifications: rows.flatMap(({ notifications }) => notifications),
      };
    },

    async save(state: BreachState): Promise<void> {
      assertRelatedRecords(state);
      const retainedIds = state.reports.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(breachReports)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(breachReports.tenantId, tenantId),
                  isNull(breachReports.removedAt),
                  notInArray(breachReports.id, retainedIds),
                )
              : and(eq(breachReports.tenantId, tenantId), isNull(breachReports.removedAt)),
          );

        for (const report of state.reports) {
          const assessments = state.assessments.filter(({ breachId }) => breachId === report.id);
          const notifications = state.notifications.filter(({ breachId }) => breachId === report.id);
          const row = mapBreachReportToRow(report, tenantId, assessments, notifications);
          await transaction
            .insert(breachReports)
            .values(row)
            .onConflictDoUpdate({
              target: [breachReports.tenantId, breachReports.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      await db
        .update(breachReports)
        .set({ removedAt: new Date() })
        .where(and(eq(breachReports.tenantId, tenantId), isNull(breachReports.removedAt)));
    },
  };
}

function mapRowToBreachReport(row: typeof breachReports.$inferSelect): BreachReport {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    discoveredAt: row.discoveredAt.getTime(),
    occurredAt: row.occurredAt?.getTime(),
    reportedAt: row.reportedAt.getTime(),
    reporter: {
      name: row.reporterName,
      email: row.reporterEmail,
      department: row.reporterDepartment ?? '',
      phone: row.reporterPhone ?? undefined,
    },
    affectedSystems: row.affectedSystems,
    dataTypes: row.dataTypes,
    involvesSensitiveData: row.involvesSensitiveData ?? undefined,
    estimatedAffectedSubjects: row.estimatedAffectedSubjects ?? undefined,
    approximateRecordCount: row.approximateRecordCount ?? undefined,
    dataSubjectCategories: row.dataSubjectCategories ?? undefined,
    likelyConsequences: row.likelyConsequences ?? undefined,
    mitigationMeasures: row.mitigationMeasures ?? undefined,
    isPhasedReport: row.isPhasedReport ?? undefined,
    supplementsReportId: row.supplementsReportId ?? undefined,
    dpoContact: row.dpoContact ?? undefined,
    status: row.status,
    initialActions: row.initialActions ?? undefined,
    attachments: row.attachments ?? undefined,
  };
}

function mapBreachReportToRow(
  report: BreachReport,
  tenantId: string,
  assessments: RiskAssessment[],
  notifications: RegulatoryNotification[],
): NewBreachReport {
  return {
    tenantId,
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    severity: highestRiskLevel(assessments),
    status: report.status,
    discoveredAt: new Date(report.discoveredAt),
    occurredAt: report.occurredAt ? new Date(report.occurredAt) : null,
    reportedAt: new Date(report.reportedAt),
    ndpcNotifiedAt: notifications.length
      ? new Date(Math.min(...notifications.map(({ sentAt }) => sentAt)))
      : null,
    reporterName: report.reporter.name,
    reporterEmail: report.reporter.email,
    reporterDepartment: report.reporter.department || null,
    reporterPhone: report.reporter.phone ?? null,
    affectedSystems: report.affectedSystems,
    dataTypes: report.dataTypes,
    involvesSensitiveData: report.involvesSensitiveData ?? null,
    estimatedAffectedSubjects: report.estimatedAffectedSubjects ?? null,
    approximateRecordCount: report.approximateRecordCount ?? null,
    dataSubjectCategories: report.dataSubjectCategories ?? null,
    likelyConsequences: report.likelyConsequences ?? null,
    mitigationMeasures: report.mitigationMeasures ?? null,
    isPhasedReport: report.isPhasedReport ?? null,
    supplementsReportId: report.supplementsReportId ?? null,
    dpoContact: report.dpoContact ?? null,
    initialActions: report.initialActions ?? null,
    attachments: report.attachments ?? null,
    assessments,
    notifications,
    ndpcNotificationSent: notifications.length > 0,
    removedAt: null,
  };
}

function highestRiskLevel(assessments: RiskAssessment[]): RiskAssessment['riskLevel'] | null {
  const rank: Record<RiskAssessment['riskLevel'], number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };
  return assessments.reduce<RiskAssessment['riskLevel'] | null>(
    (highest, assessment) =>
      highest === null || rank[assessment.riskLevel] > rank[highest]
        ? assessment.riskLevel
        : highest,
    null,
  );
}

function assertRelatedRecords(state: BreachState): void {
  const reportIds = new Set(state.reports.map(({ id }) => id));
  const orphan = [...state.assessments, ...state.notifications].find(
    ({ breachId }) => !reportIds.has(breachId),
  );
  if (orphan) {
    throw new Error(`Breach child record ${orphan.id} references unknown report ${orphan.breachId}`);
  }
}
