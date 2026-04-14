/**
 * Drizzle adapter for the Consent module.
 *
 * Implements StorageAdapter<ConsentSettings> backed by the `ndpr_consent_records`
 * Drizzle table. Follows the same immutable-audit pattern as the Prisma adapter,
 * as required by NDPA Section 25:
 *
 * - SAVE  → soft-revokes any existing active record, then inserts a new row.
 * - LOAD  → returns the most recent non-revoked record for the subject.
 * - REMOVE → soft-deletes by setting revokedAt on the active record (no hard deletes).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit hook:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { useConsent } from '@tantainnovative/ndpr-toolkit';
 *   import { drizzleConsentAdapter } from './adapters/drizzle-consent';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function MyApp() {
 *     const adapter = drizzleConsentAdapter(db, session.userId);
 *     const { settings, updateConsent } = useConsent({ adapter });
 *     // ...
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_consent_records` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-consent
 */

import { eq, and, isNull, desc } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit';
import { consentRecords } from '../drizzle/schema';

/**
 * Creates a Drizzle-backed StorageAdapter for ConsentSettings.
 *
 * @param db         - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @param subjectId  - Stable identifier for the data subject (e.g. user ID, session ID).
 *                     This scopes all queries and is stored on every record.
 * @returns A StorageAdapter<ConsentSettings> ready to pass to useConsent().
 */
export function drizzleConsentAdapter(
  db: any,
  subjectId: string,
): StorageAdapter<ConsentSettings> {
  return {
    /**
     * Load the latest active (non-revoked) consent record for the subject.
     *
     * Uses Drizzle's type-safe query builder to select the most recent row
     * where `subjectId` matches and `revokedAt` is NULL.
     *
     * Returns null if no record exists — the toolkit hook treats this as
     * "no consent given" and displays the consent banner.
     */
    async load(): Promise<ConsentSettings | null> {
      const rows = await db
        .select()
        .from(consentRecords)
        .where(and(eq(consentRecords.subjectId, subjectId), isNull(consentRecords.revokedAt)))
        .orderBy(desc(consentRecords.createdAt))
        .limit(1);

      const record = rows[0];
      if (!record) return null;

      // Reconstruct the ConsentSettings shape expected by the toolkit hook.
      return {
        consents: record.consents as Record<string, boolean>,
        timestamp: record.createdAt.getTime(),
        version: record.version,
        method: record.method,
        hasInteracted: true,
        lawfulBasis: (record.lawfulBasis as ConsentSettings['lawfulBasis']) ?? undefined,
      };
    },

    /**
     * Persist new consent settings.
     *
     * Step 1: Revoke all currently active records for this subject by setting
     *         revokedAt = now(). This preserves the audit trail as required by
     *         NDPA Section 25 — the old consent history is never erased.
     *
     * Step 2: Insert a fresh record representing the new consent state.
     *
     * Both steps are performed sequentially (not in a transaction by default).
     * Wrap this in a Drizzle transaction if your database supports it and you
     * need atomicity guarantees.
     */
    async save(data: ConsentSettings): Promise<void> {
      // Step 1: Revoke all currently active records for this subject.
      await db
        .update(consentRecords)
        .set({ revokedAt: new Date() })
        .where(and(eq(consentRecords.subjectId, subjectId), isNull(consentRecords.revokedAt)));

      // Step 2: Insert the new consent record.
      await db.insert(consentRecords).values({
        subjectId,
        consents: data.consents,
        version: data.version,
        method: data.method,
        lawfulBasis: data.lawfulBasis ?? null,
        // Pass ipAddress / userAgent by extending this adapter to accept
        // a RequestContext parameter if you need to capture them.
      });
    },

    /**
     * Revoke the current consent record for the subject without deleting it.
     *
     * Hard deletes are never performed so the compliance audit trail is preserved
     * for NDPA Section 26 (right to withdraw consent) accountability purposes.
     */
    async remove(): Promise<void> {
      await db
        .update(consentRecords)
        .set({ revokedAt: new Date() })
        .where(and(eq(consentRecords.subjectId, subjectId), isNull(consentRecords.revokedAt)));
    },
  };
}
