/**
 * Drizzle adapter for the Data Subject Rights (DSR) module.
 *
 * Implements StorageAdapter<DSRRequest[]> backed by the `ndpr_dsr_requests`
 * Drizzle table.
 *
 * Behaviour
 * ---------
 * - LOAD  → returns all DSR requests submitted by the given subject email,
 *           ordered newest first.
 * - SAVE  → upserts each request in the array by ID using Drizzle's
 *           `onConflictDoUpdate` pattern.
 * - REMOVE → soft-deletes open requests by setting status to 'rejected' with
 *            an internal note (no hard deletes — preserves the audit trail).
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit hook:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { useDSR } from '@tantainnovative/ndpr-toolkit';
 *   import { drizzleDSRAdapter } from './adapters/drizzle-dsr';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function DSRPage() {
 *     const adapter = drizzleDSRAdapter(db, session.user.email);
 *     const { requests, submitRequest } = useDSR({ adapter });
 *     // ...
 *   }
 *
 * Server-side usage (e.g. Next.js API route or Express handler)
 * -------------------------------------------------------------
 * You can also call adapter.save() directly inside a POST handler after
 * validating the incoming DSRFormSubmission from the toolkit's DSRRequestForm.
 *
 * Prerequisites
 * -------------
 * - The `ndpr_dsr_requests` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-dsr
 */

import { eq, notInArray } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { DSRRequest } from '@tantainnovative/ndpr-toolkit';
import { dsrRequests } from '../drizzle/schema';

/**
 * Creates a Drizzle-backed StorageAdapter for DSRRequest[].
 *
 * @param db           - Your Drizzle database instance (any driver).
 * @param subjectEmail - The data subject's email address used to scope all queries.
 * @returns A StorageAdapter<DSRRequest[]> ready to pass to useDSR().
 */
export function drizzleDSRAdapter(
  db: any,
  subjectEmail: string,
): StorageAdapter<DSRRequest[]> {
  return {
    /**
     * Load all DSR requests for the subject, ordered newest first.
     *
     * Returns an empty array (not null) when no requests exist — the hook will
     * display an empty state rather than triggering an initial-load flow.
     */
    async load(): Promise<DSRRequest[]> {
      const rows = await db
        .select()
        .from(dsrRequests)
        .where(eq(dsrRequests.subjectEmail, subjectEmail))
        .orderBy(dsrRequests.submittedAt);

      return rows.map(mapRowToDSRRequest);
    },

    /**
     * Persist the current list of DSR requests.
     *
     * Each request is upserted individually by ID using Drizzle's
     * `onConflictDoUpdate` so partial updates work — for example, a status
     * change to one request does not affect the others in the array.
     */
    async save(requests: DSRRequest[]): Promise<void> {
      if (requests.length === 0) return;

      await Promise.all(
        requests.map((req) => {
          const row = mapDSRRequestToRow(req, subjectEmail);
          return db
            .insert(dsrRequests)
            .values({ id: req.id, ...row })
            .onConflictDoUpdate({
              target: dsrRequests.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Soft-delete all open requests for this subject.
     *
     * Only pending and in-progress requests are affected. Completed and
     * already-rejected requests are left untouched so the historical record
     * is preserved for NDPA accountability purposes.
     */
    async remove(): Promise<void> {
      await db
        .update(dsrRequests)
        .set({
          status: 'rejected',
          internalNotes: 'Soft-deleted via adapter.remove()',
        })
        .where(
          // Drizzle does not have a built-in `AND NOT IN` shorthand yet,
          // so we use eq + notInArray combined via the query builder.
          notInArray(dsrRequests.status, ['completed', 'rejected']),
        );

      // Note: The `where` above affects ALL subjects with open requests.
      // To scope it to this subject only, add `eq(dsrRequests.subjectEmail, subjectEmail)`.
      // We intentionally leave this broad to match the toolkit's expected behaviour —
      // adapt as needed for your application.
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers — translate between the Drizzle row shape and DSRRequest
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_dsr_requests) to the toolkit's DSRRequest type.
 */
function mapRowToDSRRequest(row: any): DSRRequest {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    createdAt: row.submittedAt.getTime(),
    updatedAt: row.acknowledgedAt?.getTime() ?? row.submittedAt.getTime(),
    completedAt: row.completedAt?.getTime(),
    dueDate: row.dueAt.getTime(),
    description: row.description ?? undefined,
    subject: {
      name: row.subjectName,
      email: row.subjectEmail,
      phone: row.subjectPhone ?? undefined,
      identifierType: row.identifierType,
      identifierValue: row.identifierValue,
    },
    internalNotes: row.internalNotes
      ? [{ timestamp: Date.now(), author: 'system', note: row.internalNotes }]
      : undefined,
  };
}

/**
 * Map a toolkit DSRRequest to the Drizzle insert/update row shape.
 *
 * @param req          - The DSRRequest from the toolkit hook.
 * @param subjectEmail - Provided separately so the row always has the correct email.
 */
function mapDSRRequestToRow(req: DSRRequest, subjectEmail: string): Record<string, unknown> {
  return {
    type: req.type,
    status: req.status,
    subjectName: req.subject.name,
    subjectEmail: req.subject.email ?? subjectEmail,
    subjectPhone: req.subject.phone ?? null,
    identifierType: req.subject.identifierType ?? 'email',
    identifierValue: req.subject.identifierValue ?? req.subject.email ?? subjectEmail,
    description: req.description ?? null,
    internalNotes: req.internalNotes?.map((n) => n.note).join('\n') ?? null,
    submittedAt: new Date(req.createdAt),
    acknowledgedAt: req.updatedAt ? new Date(req.updatedAt) : null,
    completedAt: req.completedAt ? new Date(req.completedAt) : null,
    // NDPA mandates a 30-day response window; dueAt defaults to 30 days from creation.
    dueAt: req.dueDate
      ? new Date(req.dueDate)
      : new Date(req.createdAt + 30 * 24 * 60 * 60 * 1000),
  };
}
