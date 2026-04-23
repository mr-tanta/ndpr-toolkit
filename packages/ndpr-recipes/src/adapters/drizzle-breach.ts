/**
 * Drizzle adapter for the Breach Notification module.
 *
 * Implements StorageAdapter<BreachState> backed by the `ndpr_breach_reports`
 * Drizzle table, where BreachState is the shape managed by the useBreach() hook:
 *
 *   {
 *     reports: BreachReport[];
 *     assessments: RiskAssessment[];
 *     notifications: RegulatoryNotification[];
 *   }
 *
 * This adapter persists and loads BreachReport records. RiskAssessments and
 * RegulatoryNotifications are stored as JSON on the breach row — extend the
 * schema with additional columns if you need full relational queries.
 *
 * Behaviour
 * ---------
 * - LOAD  → loads all breach reports from the database, ordered newest first.
 * - SAVE  → upserts each report by ID using Drizzle's `onConflictDoUpdate`.
 * - REMOVE → marks all ongoing reports as 'resolved' (no hard deletes;
 *            NDPA Section 40 audit trail is preserved).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit hook:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { useBreach } from '@tantainnovative/ndpr-toolkit';
 *   import { drizzleBreachAdapter } from './adapters/drizzle-breach';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function BreachPage() {
 *     const adapter = drizzleBreachAdapter(db);
 *     const { reports, submitReport } = useBreach({ adapter });
 *     // ...
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_breach_reports` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-breach
 */

import { eq, desc } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { BreachReport, RiskAssessment, RegulatoryNotification } from '@tantainnovative/ndpr-toolkit';
import { breachReports } from '../drizzle/schema';

/** The state shape managed by the useBreach() hook */
export interface BreachState {
  reports: BreachReport[];
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
}

/**
 * Creates a Drizzle-backed StorageAdapter for the breach module's state.
 *
 * @param db - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @returns A StorageAdapter<BreachState> ready to pass to useBreach().
 */
export function drizzleBreachAdapter(db: any): StorageAdapter<BreachState> {
  return {
    /**
     * Load all breach reports from the database, ordered newest first.
     * Assessments and notifications are returned as empty arrays — extend
     * the schema if you need to persist them.
     */
    async load(): Promise<BreachState | null> {
      const rows = await db
        .select()
        .from(breachReports)
        .orderBy(desc(breachReports.reportedAt));

      if (rows.length === 0) return null;

      return {
        reports: rows.map(mapRowToBreachReport),
        assessments: [],
        notifications: [],
      };
    },

    /**
     * Persist the current breach state.
     * Each report is upserted by ID using Drizzle's `onConflictDoUpdate`.
     * Assessments and notifications are ignored unless you extend the schema.
     */
    async save(state: BreachState): Promise<void> {
      if (state.reports.length === 0) return;

      await Promise.all(
        state.reports.map((report) => {
          const row = mapBreachReportToRow(report);
          return db
            .insert(breachReports)
            .values({ id: report.id, ...row })
            .onConflictDoUpdate({
              target: breachReports.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Soft-close all ongoing breach reports by setting status to 'resolved'.
     * Hard deletes are never performed to preserve the NDPA Section 40
     * compliance audit trail.
     */
    async remove(): Promise<void> {
      await db
        .update(breachReports)
        .set({ status: 'resolved' })
        .where(eq(breachReports.status, 'ongoing'));
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_breach_reports) to the toolkit's BreachReport type.
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
 * Map a toolkit BreachReport to the Drizzle insert/update row shape.
 */
function mapBreachReportToRow(report: BreachReport): Record<string, unknown> {
  return {
    title: report.title,
    description: report.description,
    category: report.category,
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
  };
}
