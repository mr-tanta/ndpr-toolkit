import { Prisma, type PrismaClient } from '@prisma/client';
import type { RegulatoryNotification, RiskAssessment } from '@tantainnovative/ndpr-toolkit/server';
import {
  DSR_OPERATIONAL_TARGET_NOTICE,
  getDsrOperationalTargetDays,
} from './shared-contracts';

const AUDIT_LOOKBACK_DAYS = 30;

/**
 * Build tenant-scoped operational observations. These are deliberately not
 * labelled a compliance score: database presence cannot establish legal
 * applicability, evidence quality, or full organisational compliance.
 */
export async function buildOperationalIndicators(
  prisma: PrismaClient,
  tenantId: string,
) {
  const asOf = new Date();
  const auditSince = new Date(
    asOf.getTime() - AUDIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );
  const [activeConsentRecords, dsrRows, breachRows, ropaRows, recentAuditEvents] =
    await Promise.all([
      prisma.consentRecord.count({
        where: { tenantId, revokedAt: null },
      }),
      prisma.dSRRequest.findMany({
        where: { tenantId, removedAt: null },
        select: { status: true, completedAt: true, dueAt: true },
      }),
      prisma.breachReport.findMany({
        where: { tenantId, removedAt: null },
        select: { assessments: true, notifications: true },
      }),
      prisma.processingRecord.findMany({
        where: { tenantId, removedAt: null },
        select: { status: true, recordData: true },
      }),
      prisma.complianceAuditLog.count({
        where: { tenantId, createdAt: { gte: auditSince } },
      }),
    ]);

  const completedWithTarget = dsrRows.filter(
    (row) => row.completedAt !== null && row.dueAt !== null,
  );
  const completedWithinTarget = completedWithTarget.filter(
    (row) => (row.completedAt as Date) <= (row.dueAt as Date),
  );
  const openOverTarget = dsrRows.filter(
    (row) =>
      row.completedAt === null &&
      row.dueAt !== null &&
      row.dueAt < asOf &&
      !['completed', 'rejected'].includes(row.status),
  );

  const breachEvidence = breachRows.map((row) => ({
    assessments: jsonArray<RiskAssessment>(row.assessments),
    notifications: jsonArray<RegulatoryNotification>(row.notifications),
  }));
  const assessedBreaches = breachEvidence.filter(
    (state) => state.assessments.length > 0,
  );
  const notificationRequiredBreaches = breachEvidence.filter((state) => {
    const latest = [...state.assessments].sort(
      (left, right) => right.assessedAt - left.assessedAt,
    )[0];
    return latest?.risksToRightsAndFreedoms === true;
  });
  const requiredWithNotificationEvidence = notificationRequiredBreaches.filter(
    (state) => state.notifications.length > 0,
  );
  const recordsWithSnapshots = ropaRows.filter((row) => row.recordData !== null);
  const activeRopaRecords = ropaRows.filter((row) => row.status === 'active');

  return {
    kind: 'ndpr-advisory-operational-indicators',
    advisoryNotice:
      'Operational database indicators only. They do not determine legal compliance; verify applicability, evidence quality, and current guidance with qualified reviewers.',
    tenantScope: {
      tenantId,
      source: 'server NDPR_TENANT_ID',
    },
    applicability: {
      consentEvidence: observed(activeConsentRecords > 0, 'active consent records'),
      dsrOperations: observed(dsrRows.length > 0, 'DSR workflow records'),
      breachOperations: observed(breachRows.length > 0, 'breach records'),
      ropaOperations: observed(ropaRows.length > 0, 'processing records'),
      auditActivity: observed(recentAuditEvents > 0, 'recent audit events'),
    },
    indicators: {
      consentEvidence: {
        activeRecordCount: activeConsentRecords,
        percentage: null,
        reasonPercentageUnavailable:
          'The database does not define the complete population of data subjects for a meaningful denominator.',
      },
      dsrOperationalTarget: {
        requestCount: dsrRows.length,
        completedWithTargetCount: completedWithTarget.length,
        completedWithinTargetCount: completedWithinTarget.length,
        completionWithinTargetPercent: percentageOrNull(
          completedWithinTarget.length,
          completedWithTarget.length,
        ),
        openOverTargetCount: openOverTarget.length,
        targetDays: getDsrOperationalTargetDays(),
        notice: DSR_OPERATIONAL_TARGET_NOTICE,
      },
      breachEvidence: {
        reportCount: breachRows.length,
        assessedReportCount: assessedBreaches.length,
        assessmentEvidenceCoveragePercent: percentageOrNull(
          assessedBreaches.length,
          breachRows.length,
        ),
        knownNotificationRequiredCount: notificationRequiredBreaches.length,
        requiredWithNotificationEvidenceCount:
          requiredWithNotificationEvidence.length,
        notificationEvidenceCoveragePercent: percentageOrNull(
          requiredWithNotificationEvidence.length,
          notificationRequiredBreaches.length,
        ),
      },
      ropaEvidence: {
        recordCount: ropaRows.length,
        activeRecordCount: activeRopaRecords.length,
        losslessSnapshotCount: recordsWithSnapshots.length,
        snapshotCoveragePercent: percentageOrNull(
          recordsWithSnapshots.length,
          ropaRows.length,
        ),
      },
      auditActivity: {
        eventCount: recentAuditEvents,
        lookbackDays: AUDIT_LOOKBACK_DAYS,
      },
    },
    provenance: {
      indicatorSet: 'ndpr-recipes-operational-observations',
      version: '1.0.0',
      asOf: asOf.toISOString(),
      sources: [
        'ndpr_consent_records',
        'ndpr_dsr_requests',
        'ndpr_breach_reports',
        'ndpr_processing_records',
        'ndpr_audit_log',
      ],
      dsrTarget: {
        environmentVariable: 'NDPR_DSR_TARGET_DAYS',
        resolvedDays: getDsrOperationalTargetDays(),
        nature: 'configurable operational target',
      },
      auditLookbackDays: AUDIT_LOOKBACK_DAYS,
    },
  };
}

function observed(value: boolean, evidence: string) {
  return {
    applicability: 'unknown',
    evidenceState: value ? 'observed' : 'not-observed',
    evidence,
    reason: value
      ? 'Database evidence is present, but legal applicability still requires review.'
      : 'No tenant-scoped rows were observed; absence is not treated as non-applicability or full marks.',
  };
}

function percentageOrNull(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : Math.round((numerator / denominator) * 100);
}

function jsonArray<T>(value: Prisma.JsonValue): T[] {
  return Array.isArray(value) ? value as unknown as T[] : [];
}
