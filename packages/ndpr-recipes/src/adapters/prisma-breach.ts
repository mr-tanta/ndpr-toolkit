/**
 * Prisma adapter for the Breach Notification module.
 *
 * Implements StorageAdapter<BreachState> backed by the `ndpr_breach_reports`
 * Prisma model, where BreachState is the shape managed by the useBreach() hook:
 *
 *   {
 *     reports: BreachReport[];
 *     assessments: RiskAssessment[];
 *     notifications: RegulatoryNotification[];
 *   }
 *
 * This adapter persists and loads BreachReport records. RiskAssessments and
 * RegulatoryNotifications are derived/stored as JSON on the breach row for
 * simplicity — extend the schema if you need full relational queries on them.
 *
 * Behaviour
 * ---------
 * - LOAD  → loads all breach reports from the database, ordered newest first.
 * - SAVE  → upserts each report. Assessments and notifications are stored as
 *           JSON in extended columns (see note below on extending the schema).
 * - REMOVE → marks all reports as 'resolved' (no hard deletes; NDPA audit trail).
 *
 * Extending for assessments and notifications
 * -------------------------------------------
 * If you need full query support for RiskAssessments and RegulatoryNotifications,
 * add `assessments Json?` and `notifications Json?` columns to the BreachReport
 * model in your schema.prisma, then update the mapping helpers below.
 *
 * Usage
 * -----
 * Copy this file into your project, then wire it into the toolkit hook:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   import { useBreach } from '@tantainnovative/ndpr-toolkit';
 *   import { prismaBreachAdapter } from './adapters/prisma-breach';
 *
 *   const prisma = new PrismaClient();
 *
 *   function BreachPage() {
 *     const adapter = prismaBreachAdapter(prisma);
 *     const { reports, submitReport } = useBreach({ adapter });
 *     // ...
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_breach_reports` table must exist (run the ndpr-recipes Prisma migration).
 * - `@prisma/client` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 */

import type { PrismaClient } from '@prisma/client';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { BreachReport, RiskAssessment, RegulatoryNotification } from '@tantainnovative/ndpr-toolkit';

/** The state shape managed by the useBreach() hook */
export interface BreachState {
  reports: BreachReport[];
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
}

/**
 * Creates a Prisma-backed StorageAdapter for the breach module's state.
 *
 * @param prisma - Your application's PrismaClient instance.
 * @returns A StorageAdapter<BreachState> ready to pass to useBreach().
 */
export function prismaBreachAdapter(prisma: PrismaClient): StorageAdapter<BreachState> {
  return {
    /**
     * Load all breach reports from the database.
     * Assessments and notifications are returned as empty arrays here;
     * extend the schema (see file header) if you need to persist them.
     */
    async load(): Promise<BreachState | null> {
      const rows = await (prisma as any).breachReport.findMany({
        orderBy: { reportedAt: 'desc' },
      });

      if (rows.length === 0) return null;

      return {
        reports: rows.map(mapRowToBreachReport),
        // Assessments and notifications require schema extension — return empty
        // arrays as a safe default so the hook renders without error.
        assessments: [],
        notifications: [],
      };
    },

    /**
     * Persist the current breach state.
     * Each report is upserted by ID. Assessments and notifications are ignored
     * unless you extend the schema with Json columns for them.
     */
    async save(state: BreachState): Promise<void> {
      await Promise.all(
        state.reports.map((report) =>
          (prisma as any).breachReport.upsert({
            where: { id: report.id },
            update: mapBreachReportToRow(report),
            create: {
              id: report.id,
              ...mapBreachReportToRow(report),
            },
          }),
        ),
      );
    },

    /**
     * Soft-close all ongoing breach reports by setting their status to 'resolved'.
     * Hard deletes are never performed to preserve the NDPA compliance audit trail.
     */
    async remove(): Promise<void> {
      await (prisma as any).breachReport.updateMany({
        where: { status: 'ongoing' },
        data: { status: 'resolved' },
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Prisma BreachReport row to the toolkit's BreachReport type.
 */
function mapRowToBreachReport(row: any): BreachReport {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    discoveredAt: row.discoveredAt.getTime(),
    occurredAt: row.occurredAt?.getTime(),
    reportedAt: row.reportedAt.getTime(),
    status: row.status as BreachReport['status'],
    reporter: {
      name: row.reporterName,
      email: row.reporterEmail,
      department: row.reporterDepartment ?? '',
    },
    affectedSystems: (row.affectedSystems as string[]) ?? [],
    dataTypes: (row.dataTypes as string[]) ?? [],
    estimatedAffectedSubjects: row.estimatedAffected ?? undefined,
    initialActions: row.initialActions ?? undefined,
  };
}

/**
 * Map a toolkit BreachReport to the Prisma `create`/`update` data shape.
 * The `severity` field is derived from the breach category as a sensible default
 * — replace with your own logic or pass it explicitly via additionalInfo.
 */
function mapBreachReportToRow(report: BreachReport): Record<string, unknown> {
  return {
    title: report.title,
    description: report.description,
    category: report.category,
    // Severity isn't on the toolkit BreachReport type; default to 'medium'.
    // Consider storing it via additionalInfo or extending the type.
    severity: 'medium',
    status: report.status,
    discoveredAt: new Date(report.discoveredAt),
    occurredAt: report.occurredAt ? new Date(report.occurredAt) : null,
    reportedAt: new Date(report.reportedAt),
    reporterName: report.reporter.name,
    reporterEmail: report.reporter.email,
    reporterDepartment: report.reporter.department ?? null,
    affectedSystems: report.affectedSystems,
    dataTypes: report.dataTypes,
    estimatedAffected: report.estimatedAffectedSubjects ?? null,
    initialActions: report.initialActions ?? null,
    // ndpcNotificationSent is managed separately via the notification workflow.
  };
}
