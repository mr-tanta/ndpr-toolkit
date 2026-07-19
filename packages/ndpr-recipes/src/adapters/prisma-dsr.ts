import {
  Prisma,
  type DSRRequest as PrismaDSRRequest,
  type PrismaClient,
} from '@prisma/client';
import type { DSRRequest, StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import {
  assertSubjectContext,
  serverStorageCapabilities,
  type SubjectAdapterContext,
} from './server-storage';

/** Creates an atomic, tenant- and stable-subject-scoped Prisma DSR adapter. */
export function prismaDSRAdapter(
  prisma: PrismaClient,
  context: SubjectAdapterContext,
): StorageAdapter<DSRRequest[]> {
  assertSubjectContext(context);
  const { tenantId, subjectId } = context;

  return {
    capabilities: serverStorageCapabilities,

    async load(): Promise<DSRRequest[]> {
      const rows = await prisma.dSRRequest.findMany({
        where: { tenantId, subjectId, removedAt: null },
        orderBy: { submittedAt: 'desc' },
      });
      return rows.map(mapRowToDSRRequest);
    },

    async save(requests: DSRRequest[]): Promise<void> {
      const retainedIds = requests.map(({ id }) => id);

      await prisma.$transaction(async (transaction) => {
        await transaction.dSRRequest.updateMany({
          where: {
            tenantId,
            subjectId,
            removedAt: null,
            ...(retainedIds.length > 0 ? { id: { notIn: retainedIds } } : {}),
          },
          data: { removedAt: new Date() },
        });

        for (const request of requests) {
          const row = mapDSRRequestToRow(request, tenantId, subjectId);
          await transaction.dSRRequest.upsert({
            where: { tenantId_subjectId_id: { tenantId, subjectId, id: request.id } },
            create: row,
            update: row,
          });
        }
      });
    },

    async remove(): Promise<void> {
      await prisma.dSRRequest.updateMany({
        where: { tenantId, subjectId, removedAt: null },
        data: { removedAt: new Date() },
      });
    },
  };
}

function mapRowToDSRRequest(row: PrismaDSRRequest): DSRRequest {
  return {
    id: row.id,
    type: row.type as DSRRequest['type'],
    status: row.status as DSRRequest['status'],
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
    additionalInfo: fromJson<DSRRequest['additionalInfo']>(row.additionalInfo),
    internalNotes: fromJson<DSRRequest['internalNotes']>(row.internalNotes),
    verification: fromJson<DSRRequest['verification']>(row.verification),
    rejectionReason: row.rejectionReason ?? undefined,
    attachments: fromJson<DSRRequest['attachments']>(row.attachments),
    extensionRequested: row.extensionRequested ?? undefined,
    extensionReason: row.extensionReason ?? undefined,
  };
}

function mapDSRRequestToRow(
  request: DSRRequest,
  tenantId: string,
  subjectId: string,
): Prisma.DSRRequestUncheckedCreateInput {
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
    additionalInfo: jsonOrDbNull(request.additionalInfo),
    internalNotes: jsonOrDbNull(request.internalNotes),
    verification: jsonOrDbNull(request.verification),
    rejectionReason: request.rejectionReason ?? null,
    attachments: jsonOrDbNull(request.attachments),
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

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
function jsonOrDbNull(value: unknown) {
  return value === undefined ? Prisma.DbNull : toInputJson(value);
}
function fromJson<T>(value: Prisma.JsonValue | null): T | undefined {
  return value === null ? undefined : (value as unknown as T);
}
