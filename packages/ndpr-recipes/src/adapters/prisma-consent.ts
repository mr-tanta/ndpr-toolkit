/**
 * Prisma adapter for the Consent module.
 *
 * Implements StorageAdapter<ConsentSettings> backed by the `ndpr_consent_records`
 * Prisma model. Follows the immutable-audit pattern required by NDPA Section 25:
 *
 * - SAVE  → marks any existing non-revoked record as revoked, then inserts a new row.
 * - LOAD  → returns the most recent non-revoked record for the subject.
 * - REMOVE → soft-deletes by setting revokedAt on the active record (no hard deletes).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Prisma client, then wire it
 * into the toolkit hook:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   import { useConsent } from '@tantainnovative/ndpr-toolkit';
 *   import { prismaConsentAdapter } from './adapters/prisma-consent';
 *
 *   const prisma = new PrismaClient();
 *
 *   function MyApp() {
 *     const adapter = prismaConsentAdapter(prisma, session.userId);
 *     const { settings, updateConsent } = useConsent({ adapter });
 *     // ...
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_consent_records` table must exist (run the ndpr-recipes Prisma migration).
 * - `@prisma/client` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 */

import type { PrismaClient } from '@prisma/client';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit';

/**
 * Creates a Prisma-backed StorageAdapter for ConsentSettings.
 *
 * @param prisma     - Your application's PrismaClient instance.
 * @param subjectId  - Stable identifier for the data subject (e.g. user ID, session ID).
 *                     This is stored on every record and used to scope all queries.
 * @returns A StorageAdapter<ConsentSettings> ready to pass to useConsent().
 */
export function prismaConsentAdapter(
  prisma: PrismaClient,
  subjectId: string,
): StorageAdapter<ConsentSettings> {
  return {
    /**
     * Load the latest active (non-revoked) consent record for the subject.
     * Returns null if no record exists yet — the hook will treat this as
     * "no consent given" and show the consent banner.
     */
    async load(): Promise<ConsentSettings | null> {
      const record = await (prisma as any).consentRecord.findFirst({
        where: {
          subjectId,
          revokedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

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
     * Step 1: Revoke all existing active records for this subject so the audit
     *         trail stays accurate (NDPA requires a record of when consent was
     *         withdrawn or superseded).
     * Step 2: Insert a fresh record representing the new consent state.
     */
    async save(data: ConsentSettings): Promise<void> {
      // Revoke any currently active records for this subject.
      await (prisma as any).consentRecord.updateMany({
        where: {
          subjectId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Insert the new consent record.
      await (prisma as any).consentRecord.create({
        data: {
          subjectId,
          consents: data.consents,
          version: data.version,
          method: data.method,
          lawfulBasis: data.lawfulBasis ?? null,
          // ipAddress and userAgent can be added by middleware before calling save().
          // Extend this adapter to accept RequestContext if needed.
        },
      });
    },

    /**
     * Revoke the current consent record without deleting it.
     * Hard deletes are avoided to preserve the compliance audit trail.
     */
    async remove(): Promise<void> {
      await (prisma as any).consentRecord.updateMany({
        where: {
          subjectId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    },
  };
}
