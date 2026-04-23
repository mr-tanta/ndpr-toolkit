/**
 * Drizzle adapter for the Lawful Basis module.
 *
 * Implements StorageAdapter<ProcessingActivity[]> backed by the
 * `ndpr_lawful_basis_records` Drizzle table.
 *
 * Every processing activity must have a documented lawful basis under NDPA
 * Part III (Sections 24-28). This adapter stores the assessment of which
 * lawful basis applies, along with the justification and data categories.
 *
 * Behaviour
 * ---------
 * - LOAD  → returns all lawful basis records, ordered newest first.
 * - SAVE  → upserts each ProcessingActivity by ID using Drizzle's
 *           `onConflictDoUpdate` pattern.
 * - REMOVE → soft-deletes by clearing the records (sets justification to
 *            'Archived via adapter.remove()' and clears data categories).
 *            No hard deletes — the audit trail is preserved.
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { drizzleLawfulBasisAdapter } from './adapters/drizzle-lawful-basis';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function LawfulBasisPage() {
 *     const adapter = drizzleLawfulBasisAdapter(db, 'dpo@example.com');
 *     // pass adapter to your lawful basis hook or use it directly
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_lawful_basis_records` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-lawful-basis
 */

import { eq, desc } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { ProcessingActivity } from '@tantainnovative/ndpr-toolkit';
import { lawfulBasisRecords } from '../drizzle/schema';

/**
 * Creates a Drizzle-backed StorageAdapter for ProcessingActivity[].
 *
 * @param db         - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @param assessedBy - Identifier (email or name) of the person responsible for
 *                     lawful basis assessments. Stored on every record.
 * @returns A StorageAdapter<ProcessingActivity[]> ready to use with the lawful basis module.
 */
export function drizzleLawfulBasisAdapter(
  db: any,
  assessedBy: string,
): StorageAdapter<ProcessingActivity[]> {
  return {
    /**
     * Load all lawful basis records, ordered newest first.
     * Returns null if no records exist.
     */
    async load(): Promise<ProcessingActivity[] | null> {
      const rows = await db
        .select()
        .from(lawfulBasisRecords)
        .where(eq(lawfulBasisRecords.assessedBy, assessedBy))
        .orderBy(desc(lawfulBasisRecords.createdAt));

      if (rows.length === 0) return null;

      return rows.map(mapRowToProcessingActivity);
    },

    /**
     * Persist the current list of processing activities with their lawful basis.
     * Each activity is upserted by ID so partial updates work.
     */
    async save(activities: ProcessingActivity[]): Promise<void> {
      if (activities.length === 0) return;

      await Promise.all(
        activities.map((activity) => {
          const row = mapProcessingActivityToRow(activity, assessedBy);
          return db
            .insert(lawfulBasisRecords)
            .values({ id: activity.id, ...row })
            .onConflictDoUpdate({
              target: lawfulBasisRecords.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Soft-archive all lawful basis records for this assessor.
     * Records are not deleted — they are marked with an archive note
     * so the NDPA compliance audit trail is preserved.
     */
    async remove(): Promise<void> {
      await db
        .update(lawfulBasisRecords)
        .set({
          justification: 'Archived via adapter.remove()',
          updatedAt: new Date(),
        })
        .where(eq(lawfulBasisRecords.assessedBy, assessedBy));
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_lawful_basis_records) to the toolkit's
 * ProcessingActivity type. Some rich fields default to placeholder values —
 * extend the schema if you need full round-trip fidelity.
 */
function mapRowToProcessingActivity(row: any): ProcessingActivity {
  return {
    id: row.id,
    name: row.activityName,
    description: row.justification,
    lawfulBasis: row.lawfulBasis as ProcessingActivity['lawfulBasis'],
    lawfulBasisJustification: row.justification,
    dataCategories: (row.dataCategories as string[]) ?? [],
    involvesSensitiveData: false,
    dataSubjectCategories: [],
    purposes: (row.purposes as string[]) ?? [],
    retentionPeriod: '',
    crossBorderTransfer: false,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    reviewDate: row.reviewDate?.getTime() ?? undefined,
    status: 'active',
  };
}

/**
 * Map a toolkit ProcessingActivity to the Drizzle insert/update row shape.
 */
function mapProcessingActivityToRow(
  activity: ProcessingActivity,
  assessedBy: string,
): Record<string, unknown> {
  return {
    activityName: activity.name,
    lawfulBasis: activity.lawfulBasis,
    justification: activity.lawfulBasisJustification || activity.description,
    dataCategories: activity.dataCategories,
    purposes: activity.purposes,
    assessedBy,
    assessedAt: new Date(activity.createdAt),
    reviewDate: activity.reviewDate ? new Date(activity.reviewDate) : null,
    updatedAt: new Date(),
  };
}
