import { and, desc, eq, isNull, notInArray } from 'drizzle-orm';
import type { DSRRequest, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import { dsrRequests, type NewDSRRequest } from '../drizzle/schema';
import {
  assertSubjectContext,
  serverStorageCapabilities,
  type SubjectAdapterContext,
} from './server-storage';

/** Creates an atomic, tenant- and stable-subject-scoped Drizzle DSR adapter. */
export function drizzleDSRAdapter(
  db: any,
  context: SubjectAdapterContext,
): StorageAdapter<DSRRequest[]> {
  assertSubjectContext(context);
  const { tenantId, subjectId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<DSRRequest[]> {
      const rows: Array<typeof dsrRequests.$inferSelect> = await db
        .select()
        .from(dsrRequests)
        .where(
          and(
            eq(dsrRequests.tenantId, tenantId),
            eq(dsrRequests.subjectId, subjectId),
            isNull(dsrRequests.removedAt),
          ),
        )
        .orderBy(desc(dsrRequests.submittedAt));
      return rows.map(mapRowToDSRRequest);
    },

    async save(requests: DSRRequest[]): Promise<void> {
      const retainedIds = requests.map(({ id }) => id);
      await db.transaction(async (transaction: typeof db) => {
        await transaction
          .update(dsrRequests)
          .set({ removedAt: new Date() })
          .where(
            retainedIds.length > 0
              ? and(
                  eq(dsrRequests.tenantId, tenantId),
                  eq(dsrRequests.subjectId, subjectId),
                  isNull(dsrRequests.removedAt),
                  notInArray(dsrRequests.id, retainedIds),
                )
              : and(
                  eq(dsrRequests.tenantId, tenantId),
                  eq(dsrRequests.subjectId, subjectId),
                  isNull(dsrRequests.removedAt),
                ),
          );

        for (const request of requests) {
          const row = mapDSRRequestToRow(request, tenantId, subjectId);
          await transaction
            .insert(dsrRequests)
            .values(row)
            .onConflictDoUpdate({
              target: [dsrRequests.tenantId, dsrRequests.subjectId, dsrRequests.id],
              set: row,
            });
        }
      });
    },

    async remove(): Promise<void> {
      await db
        .update(dsrRequests)
        .set({ removedAt: new Date() })
        .where(
          and(
            eq(dsrRequests.tenantId, tenantId),
            eq(dsrRequests.subjectId, subjectId),
            isNull(dsrRequests.removedAt),
          ),
        );
    },
  };
}

function mapRowToDSRRequest(row: typeof dsrRequests.$inferSelect): DSRRequest {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    createdAt: row.submittedAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    completedAt: row.completedAt?.getTime(),
    verifiedAt: row.verifiedAt?.getTime(),
    dueDate: row.dueAt?.getTime(),
    description: row.description ?? undefined,
    lawfulBasis: row.lawfulBasis ?? undefined,
    subject: {
      name: row.subjectName,
      email: row.subjectEmail,
      phone: row.subjectPhone ?? undefined,
      identifierType: row.identifierType ?? undefined,
      identifierValue: row.identifierValue ?? undefined,
    },
    additionalInfo: row.additionalInfo ?? undefined,
    internalNotes: row.internalNotes ?? undefined,
    verification: row.verification ?? undefined,
    rejectionReason: row.rejectionReason ?? undefined,
    attachments: row.attachments ?? undefined,
    extensionRequested: row.extensionRequested ?? undefined,
    extensionReason: row.extensionReason ?? undefined,
  };
}

function mapDSRRequestToRow(
  request: DSRRequest,
  tenantId: string,
  subjectId: string,
): NewDSRRequest {
  return {
    tenantId,
    id: request.id,
    subjectId,
    type: request.type,
    status: request.status,
    subjectName: request.subject.name,
    subjectEmail: request.subject.email,
    subjectPhone: request.subject.phone ?? null,
    identifierType: request.subject.identifierType ?? null,
    identifierValue: request.subject.identifierValue ?? null,
    description: request.description ?? null,
    lawfulBasis: request.lawfulBasis ?? null,
    additionalInfo: request.additionalInfo ?? null,
    internalNotes: request.internalNotes ?? null,
    verification: request.verification ?? null,
    rejectionReason: request.rejectionReason ?? null,
    attachments: request.attachments ?? null,
    extensionRequested: request.extensionRequested ?? null,
    extensionReason: request.extensionReason ?? null,
    submittedAt: new Date(request.createdAt),
    updatedAt: new Date(request.updatedAt),
    verifiedAt: request.verifiedAt ? new Date(request.verifiedAt) : null,
    completedAt: request.completedAt ? new Date(request.completedAt) : null,
    dueAt: request.dueDate ? new Date(request.dueDate) : null,
    removedAt: null,
  };
}
