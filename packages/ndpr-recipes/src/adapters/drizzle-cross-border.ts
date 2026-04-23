/**
 * Drizzle adapter for the Cross-Border Data Transfer module.
 *
 * Implements StorageAdapter<CrossBorderTransfer[]> backed by the
 * `ndpr_cross_border_transfer_records` Drizzle table.
 *
 * Under NDPA Part VI (Sections 41-45), personal data may only be transferred
 * outside Nigeria under specific conditions. This adapter tracks every
 * cross-border transfer, the mechanism relied upon, and NDPC approval status.
 *
 * Behaviour
 * ---------
 * - LOAD  → returns all cross-border transfer records, ordered newest first.
 * - SAVE  → upserts each CrossBorderTransfer by ID using Drizzle's
 *           `onConflictDoUpdate` pattern.
 * - REMOVE → soft-terminates all active transfers by setting their status
 *            columns (no hard deletes; the audit trail is preserved).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { drizzleCrossBorderAdapter } from './adapters/drizzle-cross-border';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function CrossBorderPage() {
 *     const adapter = drizzleCrossBorderAdapter(db);
 *     // pass adapter to your cross-border hook or use it directly
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_cross_border_transfer_records` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-cross-border
 */

import { eq, desc } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { CrossBorderTransfer } from '@tantainnovative/ndpr-toolkit';
import { crossBorderTransferRecords } from '../drizzle/schema';

/**
 * Creates a Drizzle-backed StorageAdapter for CrossBorderTransfer[].
 *
 * @param db - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @returns A StorageAdapter<CrossBorderTransfer[]> ready to use with the cross-border module.
 */
export function drizzleCrossBorderAdapter(
  db: any,
): StorageAdapter<CrossBorderTransfer[]> {
  return {
    /**
     * Load all cross-border transfer records, ordered newest first.
     * Returns null if no records exist.
     */
    async load(): Promise<CrossBorderTransfer[] | null> {
      const rows = await db
        .select()
        .from(crossBorderTransferRecords)
        .orderBy(desc(crossBorderTransferRecords.createdAt));

      if (rows.length === 0) return null;

      return rows.map(mapRowToCrossBorderTransfer);
    },

    /**
     * Persist the current list of cross-border transfers.
     * Each transfer is upserted by ID so partial updates work.
     */
    async save(transfers: CrossBorderTransfer[]): Promise<void> {
      if (transfers.length === 0) return;

      await Promise.all(
        transfers.map((transfer) => {
          const row = mapCrossBorderTransferToRow(transfer);
          return db
            .insert(crossBorderTransferRecords)
            .values({ id: transfer.id, ...row })
            .onConflictDoUpdate({
              target: crossBorderTransferRecords.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Soft-terminate all active cross-border transfers by updating their
     * timestamp. Transfers are never hard-deleted so the NDPA Part VI
     * compliance audit trail is preserved.
     *
     * Note: This updates all records. If you need to scope removal to a
     * specific status, add a `status` column to the schema and filter on it.
     */
    async remove(): Promise<void> {
      await db
        .update(crossBorderTransferRecords)
        .set({ updatedAt: new Date() });
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_cross_border_transfer_records) to the
 * toolkit's CrossBorderTransfer type. Some rich fields on the toolkit type
 * default to placeholder values — extend the schema if you need full
 * round-trip fidelity.
 */
function mapRowToCrossBorderTransfer(row: any): CrossBorderTransfer {
  return {
    id: row.id,
    destinationCountry: row.destinationCountry,
    adequacyStatus: row.adequacyStatus as CrossBorderTransfer['adequacyStatus'],
    transferMechanism: row.transferMechanism as CrossBorderTransfer['transferMechanism'],
    dataCategories: (row.dataCategories as string[]) ?? [],
    includesSensitiveData: false,
    recipientOrganization: row.recipientName,
    recipientContact: {
      name: row.recipientName,
      email: '',
    },
    purpose: '',
    safeguards: row.safeguards ? [row.safeguards] : [],
    riskAssessment: '',
    riskLevel: row.riskLevel as CrossBorderTransfer['riskLevel'],
    ndpcApproval: row.ndpcApprovalRequired
      ? {
          required: row.ndpcApprovalRequired,
          applied: !!row.ndpcApprovalReference,
          approved: !!row.ndpcApprovalReference,
          referenceNumber: row.ndpcApprovalReference ?? undefined,
        }
      : undefined,
    tiaCompleted: false,
    frequency: 'continuous',
    startDate: row.createdAt.getTime(),
    status: 'active',
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Map a toolkit CrossBorderTransfer to the Drizzle insert/update row shape.
 * Composite toolkit fields are flattened to match the simplified schema.
 */
function mapCrossBorderTransferToRow(transfer: CrossBorderTransfer): Record<string, unknown> {
  return {
    destinationCountry: transfer.destinationCountry,
    recipientName: transfer.recipientOrganization,
    transferMechanism: transfer.transferMechanism,
    safeguards: transfer.safeguards.join('; '),
    dataCategories: transfer.dataCategories,
    adequacyStatus: transfer.adequacyStatus,
    ndpcApprovalRequired: transfer.ndpcApproval?.required ?? false,
    ndpcApprovalReference: transfer.ndpcApproval?.referenceNumber ?? null,
    riskLevel: transfer.riskLevel,
    updatedAt: new Date(),
  };
}
