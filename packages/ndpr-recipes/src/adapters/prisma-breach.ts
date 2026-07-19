import {
  Prisma,
  type BreachReport as PrismaBreachReport,
  type PrismaClient,
} from '@prisma/client';
import type {
  BreachReport,
  RegulatoryNotification,
  RiskAssessment,
  StorageAdapter,
} from '@tantainnovative/ndpr-toolkit';
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

/** Creates an atomic, tenant-scoped Prisma adapter for complete breach state. */
export function prismaBreachAdapter(
  prisma: PrismaClient,
  context: TenantAdapterContext,
): StorageAdapter<BreachState> {
  assertTenantContext(context);
  const { tenantId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<BreachState | null> {
      const rows = await prisma.breachReport.findMany({
        where: { tenantId, removedAt: null },
        orderBy: { reportedAt: 'desc' },
      });
      if (rows.length === 0) return null;

      return {
        reports: rows.map(mapRowToBreachReport),
        assessments: rows.flatMap((row) => fromJsonArray<RiskAssessment>(row.assessments)),
        notifications: rows.flatMap((row) =>
          fromJsonArray<RegulatoryNotification>(row.notifications),
        ),
      };
    },

    async save(state: BreachState): Promise<void> {
      assertRelatedRecords(state);
      const retainedIds = state.reports.map(({ id }) => id);

      await prisma.$transaction(async (transaction) => {
        await transaction.breachReport.updateMany({
          where: {
            tenantId,
            removedAt: null,
            ...(retainedIds.length > 0 ? { id: { notIn: retainedIds } } : {}),
          },
          data: { removedAt: new Date() },
        });

        for (const report of state.reports) {
          const assessments = state.assessments.filter(({ breachId }) => breachId === report.id);
          const notifications = state.notifications.filter(({ breachId }) => breachId === report.id);
          const row = mapBreachReportToRow(report, tenantId, assessments, notifications);
          await transaction.breachReport.upsert({
            where: { tenantId_id: { tenantId, id: report.id } },
            create: row,
            update: row,
          });
        }
      });
    },

    async remove(): Promise<void> {
      await prisma.breachReport.updateMany({
        where: { tenantId, removedAt: null },
        data: { removedAt: new Date() },
      });
    },
  };
}

function mapRowToBreachReport(row: PrismaBreachReport): BreachReport {
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
    affectedSystems: fromJsonArray<string>(row.affectedSystems),
    dataTypes: fromJsonArray<string>(row.dataTypes),
    involvesSensitiveData: row.involvesSensitiveData ?? undefined,
    estimatedAffectedSubjects: row.estimatedAffectedSubjects ?? undefined,
    approximateRecordCount: row.approximateRecordCount ?? undefined,
    dataSubjectCategories: fromOptionalJson<string[]>(row.dataSubjectCategories),
    likelyConsequences: row.likelyConsequences ?? undefined,
    mitigationMeasures: row.mitigationMeasures ?? undefined,
    isPhasedReport: row.isPhasedReport ?? undefined,
    supplementsReportId: row.supplementsReportId ?? undefined,
    dpoContact: fromOptionalJson<BreachReport['dpoContact']>(row.dpoContact),
    status: row.status as BreachReport['status'],
    initialActions: row.initialActions ?? undefined,
    attachments: fromOptionalJson<BreachReport['attachments']>(row.attachments),
  };
}

function mapBreachReportToRow(
  report: BreachReport,
  tenantId: string,
  assessments: RiskAssessment[],
  notifications: RegulatoryNotification[],
): Prisma.BreachReportUncheckedCreateInput {
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
    affectedSystems: toInputJson(report.affectedSystems),
    dataTypes: toInputJson(report.dataTypes),
    involvesSensitiveData: report.involvesSensitiveData ?? null,
    estimatedAffectedSubjects: report.estimatedAffectedSubjects ?? null,
    approximateRecordCount: report.approximateRecordCount ?? null,
    dataSubjectCategories: jsonOrDbNull(report.dataSubjectCategories),
    likelyConsequences: report.likelyConsequences ?? null,
    mitigationMeasures: report.mitigationMeasures ?? null,
    isPhasedReport: report.isPhasedReport ?? null,
    supplementsReportId: report.supplementsReportId ?? null,
    dpoContact: jsonOrDbNull(report.dpoContact),
    initialActions: report.initialActions ?? null,
    attachments: jsonOrDbNull(report.attachments),
    assessments: toInputJson(assessments),
    notifications: toInputJson(notifications),
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

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
function jsonOrDbNull(value: unknown) {
  return value === undefined ? Prisma.DbNull : toInputJson(value);
}
function fromJsonArray<T>(value: Prisma.JsonValue): T[] {
  return value as unknown as T[];
}
function fromOptionalJson<T>(value: Prisma.JsonValue | null): T | undefined {
  return value === null ? undefined : (value as unknown as T);
}
