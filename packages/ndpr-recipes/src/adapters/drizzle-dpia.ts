/**
 * Drizzle adapter for the DPIA (Data Protection Impact Assessment) module.
 *
 * Implements StorageAdapter<DPIAResult[]> backed by the `ndpr_dpia_records`
 * Drizzle table. Each row stores a complete DPIA assessment including its
 * risk analysis, answers, and approval status.
 *
 * Behaviour
 * ---------
 * - LOAD  → returns all DPIA records, ordered newest first. The full DPIAResult
 *           is reconstructed from the JSON `dpiaData` column merged with scalar
 *           columns for filtering/indexing.
 * - SAVE  → upserts each DPIAResult by ID using Drizzle's `onConflictDoUpdate`.
 * - REMOVE → marks all draft/in-progress assessments as 'rejected' (no hard
 *            deletes; completed assessments are left untouched for the audit trail).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit hook:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { drizzleDPIAAdapter } from './adapters/drizzle-dpia';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function DPIAPage() {
 *     const adapter = drizzleDPIAAdapter(db);
 *     // pass adapter to your DPIA hook or use it directly
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_dpia_records` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-dpia
 */

import { eq, desc, notInArray } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { DPIAResult } from '@tantainnovative/ndpr-toolkit';
import { dpiaRecords } from '../drizzle/schema';

/**
 * Creates a Drizzle-backed StorageAdapter for DPIAResult[].
 *
 * @param db - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @returns A StorageAdapter<DPIAResult[]> ready to use with the DPIA module.
 */
export function drizzleDPIAAdapter(db: any): StorageAdapter<DPIAResult[]> {
  return {
    /**
     * Load all DPIA records from the database, ordered newest first.
     * Returns null if no records exist.
     */
    async load(): Promise<DPIAResult[] | null> {
      const rows = await db
        .select()
        .from(dpiaRecords)
        .orderBy(desc(dpiaRecords.createdAt));

      if (rows.length === 0) return null;

      return rows.map(mapRowToDPIAResult);
    },

    /**
     * Persist the current list of DPIA assessments.
     * Each assessment is upserted by ID so partial updates work.
     */
    async save(results: DPIAResult[]): Promise<void> {
      if (results.length === 0) return;

      await Promise.all(
        results.map((result) => {
          const row = mapDPIAResultToRow(result);
          return db
            .insert(dpiaRecords)
            .values({ id: result.id, ...row })
            .onConflictDoUpdate({
              target: dpiaRecords.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Soft-delete draft and in-progress assessments by marking them as 'rejected'.
     * Completed and approved assessments are left untouched to preserve the
     * NDPA Sections 38-39 compliance audit trail.
     */
    async remove(): Promise<void> {
      await db
        .update(dpiaRecords)
        .set({ status: 'rejected' })
        .where(notInArray(dpiaRecords.status, ['completed', 'approved']));
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_dpia_records) to the toolkit's DPIAResult type.
 * The full DPIAResult is stored in the `dpiaData` JSON column; scalar columns
 * are used for indexing and filtering.
 */
function mapRowToDPIAResult(row: any): DPIAResult {
  const dpiaData = (row.dpiaData ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    title: row.projectName,
    processingDescription: row.description,
    startedAt: row.createdAt.getTime(),
    completedAt: row.updatedAt.getTime(),
    assessor: (dpiaData.assessor as DPIAResult['assessor']) ?? {
      name: row.conductedBy,
      role: '',
      email: row.conductedBy,
    },
    answers: (dpiaData.answers as DPIAResult['answers']) ?? {},
    risks: (dpiaData.risks as DPIAResult['risks']) ?? [],
    overallRiskLevel: row.overallRisk as DPIAResult['overallRiskLevel'],
    canProceed: row.status === 'approved',
    conclusion: (dpiaData.conclusion as string) ?? '',
    recommendations: (dpiaData.recommendations as string[]) ?? undefined,
    reviewDate: (dpiaData.reviewDate as number) ?? undefined,
    version: (dpiaData.version as string) ?? '1.0',
    ndpcConsultationRequired: (dpiaData.ndpcConsultationRequired as boolean) ?? undefined,
    ndpcConsultationDate: (dpiaData.ndpcConsultationDate as number) ?? undefined,
    ndpcConsultationReference: (dpiaData.ndpcConsultationReference as string) ?? undefined,
    lawfulBasis: (dpiaData.lawfulBasis as string) ?? undefined,
    involvesCrossBorderTransfer: (dpiaData.involvesCrossBorderTransfer as boolean) ?? undefined,
  };
}

/**
 * Map a toolkit DPIAResult to the Drizzle insert/update row shape.
 * Rich nested data is stored in the `dpiaData` JSON column while key fields
 * are duplicated as scalar columns for indexing.
 */
function mapDPIAResultToRow(result: DPIAResult): Record<string, unknown> {
  return {
    projectName: result.title,
    description: result.processingDescription,
    dpiaData: {
      assessor: result.assessor,
      answers: result.answers,
      risks: result.risks,
      conclusion: result.conclusion,
      recommendations: result.recommendations,
      reviewDate: result.reviewDate,
      version: result.version,
      ndpcConsultationRequired: result.ndpcConsultationRequired,
      ndpcConsultationDate: result.ndpcConsultationDate,
      ndpcConsultationReference: result.ndpcConsultationReference,
      lawfulBasis: result.lawfulBasis,
      involvesCrossBorderTransfer: result.involvesCrossBorderTransfer,
    },
    overallRisk: result.overallRiskLevel,
    score: calculateRiskScore(result),
    status: result.canProceed ? 'approved' : 'draft',
    conductedBy: result.assessor.email || result.assessor.name,
    approvedBy: result.canProceed ? result.assessor.email : null,
    updatedAt: new Date(),
  };
}

/**
 * Calculate a numeric risk score from the DPIA result's risk entries.
 * Uses the maximum individual risk score, or derives from the overall risk level.
 */
function calculateRiskScore(result: DPIAResult): number {
  if (result.risks.length > 0) {
    return Math.max(...result.risks.map((r) => r.score));
  }

  const levelScores: Record<string, number> = {
    low: 5,
    medium: 10,
    high: 15,
    critical: 25,
  };

  return levelScores[result.overallRiskLevel] ?? 10;
}
