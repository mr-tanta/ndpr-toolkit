/**
 * Prisma adapter for the Data Subject Rights (DSR) module.
 *
 * Implements StorageAdapter<DSRRequest[]> backed by the `ndpr_dsr_requests`
 * Prisma model.
 *
 * Behaviour
 * ---------
 * - LOAD  → returns all DSR requests submitted by the given subject email.
 * - SAVE  → upserts each request in the array by ID.
 * - REMOVE → soft-deletes all requests for the subject by setting status to
 *            'rejected' with an internal note (preserves the audit trail).
 *
 * Usage
 * -----
 * Copy this file into your project, then wire it into the toolkit hook:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   import { useDSR } from '@tantainnovative/ndpr-toolkit';
 *   import { prismaDSRAdapter } from './adapters/prisma-dsr';
 *
 *   const prisma = new PrismaClient();
 *
 *   function DSRPage() {
 *     const adapter = prismaDSRAdapter(prisma, session.user.email);
 *     const { requests, submitRequest } = useDSR({ adapter });
 *     // ...
 *   }
 *
 * Server-side usage (e.g. Next.js API route)
 * ------------------------------------------
 * You can also call adapter.save() directly inside a POST handler after
 * validating the incoming DSRFormSubmission from the toolkit's DSRRequestForm.
 *
 * Prerequisites
 * -------------
 * - The `ndpr_dsr_requests` table must exist (run the ndpr-recipes Prisma migration).
 * - `@prisma/client` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 */

import type { PrismaClient } from '@prisma/client';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { DSRRequest } from '@tantainnovative/ndpr-toolkit';

/**
 * Creates a Prisma-backed StorageAdapter for DSRRequest[].
 *
 * @param prisma       - Your application's PrismaClient instance.
 * @param subjectEmail - The data subject's email address used to scope all queries.
 * @returns A StorageAdapter<DSRRequest[]> ready to pass to useDSR().
 */
export function prismaDSRAdapter(
  prisma: PrismaClient,
  subjectEmail: string,
): StorageAdapter<DSRRequest[]> {
  return {
    /**
     * Load all DSR requests for the subject.
     * Returns an empty array (not null) when no requests exist — the hook
     * will display an empty state rather than triggering an initial-load flow.
     */
    async load(): Promise<DSRRequest[]> {
      const rows = await (prisma as any).dSRRequest.findMany({
        where: { subjectEmail },
        orderBy: { submittedAt: 'desc' },
      });

      return rows.map(mapRowToDSRRequest);
    },

    /**
     * Persist the current list of DSR requests.
     * Each request is upserted individually by ID so partial updates work
     * (e.g. a status change to a single request doesn't overwrite others).
     */
    async save(requests: DSRRequest[]): Promise<void> {
      await Promise.all(
        requests.map((req) =>
          (prisma as any).dSRRequest.upsert({
            where: { id: req.id },
            update: mapDSRRequestToRow(req),
            create: {
              id: req.id,
              ...mapDSRRequestToRow(req),
            },
          }),
        ),
      );
    },

    /**
     * Soft-delete all pending/in-progress requests for this subject.
     * Completed and already-rejected requests are left untouched so the
     * historical record is preserved for accountability purposes.
     */
    async remove(): Promise<void> {
      await (prisma as any).dSRRequest.updateMany({
        where: {
          subjectEmail,
          status: { notIn: ['completed', 'rejected'] },
        },
        data: {
          status: 'rejected',
          internalNotes: 'Soft-deleted via adapter.remove()',
        },
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers — translate between the Prisma row shape and DSRRequest
// ---------------------------------------------------------------------------

/**
 * Map a raw Prisma row to the DSRRequest shape expected by the toolkit.
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
 * Map a DSRRequest to the Prisma `create`/`update` data shape.
 * Fields not present on the toolkit type (e.g. assignedTo) default to null.
 */
function mapDSRRequestToRow(req: DSRRequest): Record<string, unknown> {
  return {
    type: req.type,
    status: req.status,
    subjectName: req.subject.name,
    subjectEmail: req.subject.email,
    subjectPhone: req.subject.phone ?? null,
    identifierType: req.subject.identifierType ?? 'email',
    identifierValue: req.subject.identifierValue ?? req.subject.email,
    description: req.description ?? null,
    internalNotes: req.internalNotes?.map((n) => n.note).join('\n') ?? null,
    submittedAt: new Date(req.createdAt),
    acknowledgedAt: req.updatedAt ? new Date(req.updatedAt) : null,
    completedAt: req.completedAt ? new Date(req.completedAt) : null,
    // NDPA mandates a 30-day response window; dueAt should be set on creation.
    dueAt: req.dueDate ? new Date(req.dueDate) : new Date(req.createdAt + 30 * 24 * 60 * 60 * 1000),
  };
}
