/**
 * Prisma adapter for the ROPA (Record of Processing Activities) module.
 *
 * Implements StorageAdapter<RecordOfProcessingActivities> backed by the
 * `ndpr_processing_records` Prisma model.
 *
 * The toolkit's useROPA() hook stores a single RecordOfProcessingActivities
 * object that wraps an array of ProcessingRecord entries plus organisation
 * metadata. This adapter maps between that object and the flat Prisma table.
 *
 * Behaviour
 * ---------
 * - LOAD  → reads all ProcessingRecord rows and assembles them into a
 *           RecordOfProcessingActivities using the org metadata you provide.
 * - SAVE  → upserts each ProcessingRecord individually by ID.
 * - REMOVE → marks all active records as 'archived' (no hard deletes).
 *
 * Organisation metadata
 * ---------------------
 * Because the ROPA object includes organisation-level fields (name, contact,
 * address, DPO details) that are not stored in the processing records table,
 * you must supply them when creating the adapter. Typically these come from
 * your app's settings or environment config.
 *
 * Usage
 * -----
 * Copy this file into your project, then wire it into the toolkit hook:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   import { useROPA } from '@tantainnovative/ndpr-toolkit';
 *   import { prismaROPAAdapter } from './adapters/prisma-ropa';
 *
 *   const prisma = new PrismaClient();
 *
 *   function ROPAPage() {
 *     const adapter = prismaROPAAdapter(prisma, {
 *       organizationName: process.env.ORG_NAME!,
 *       organizationContact: process.env.DPO_EMAIL!,
 *       organizationAddress: process.env.ORG_ADDRESS!,
 *     });
 *     const { ropa, addRecord } = useROPA({ adapter });
 *     // ...
 *   }
 *
 * Prerequisites
 * -------------
 * - The `ndpr_processing_records` table must exist (run the ndpr-recipes migration).
 * - `@prisma/client` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 */

import type { PrismaClient } from '@prisma/client';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { RecordOfProcessingActivities, ProcessingRecord } from '@tantainnovative/ndpr-toolkit';

/** Organisation metadata required to construct the ROPA envelope */
export interface ROPAOrgMetadata {
  organizationName: string;
  organizationContact: string;
  organizationAddress: string;
  dpoDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
  ndpcRegistrationNumber?: string;
}

/**
 * Creates a Prisma-backed StorageAdapter for RecordOfProcessingActivities.
 *
 * @param prisma   - Your application's PrismaClient instance.
 * @param orgMeta  - Organisation-level metadata used to build the ROPA envelope.
 * @returns A StorageAdapter<RecordOfProcessingActivities> ready to pass to useROPA().
 */
export function prismaROPAAdapter(
  prisma: PrismaClient,
  orgMeta: ROPAOrgMetadata,
): StorageAdapter<RecordOfProcessingActivities> {
  return {
    /**
     * Load all processing records and wrap them in a RecordOfProcessingActivities.
     * Returns null if no records exist yet so the hook renders an empty ROPA.
     */
    async load(): Promise<RecordOfProcessingActivities | null> {
      const rows = await (prisma as any).processingRecord.findMany({
        orderBy: { createdAt: 'asc' },
      });

      if (rows.length === 0) return null;

      const records: ProcessingRecord[] = rows.map(mapRowToProcessingRecord);
      const lastUpdated = Math.max(...rows.map((r: any) => r.updatedAt.getTime()));

      return {
        id: 'ropa-' + orgMeta.organizationName.toLowerCase().replace(/\s+/g, '-'),
        organizationName: orgMeta.organizationName,
        organizationContact: orgMeta.organizationContact,
        organizationAddress: orgMeta.organizationAddress,
        dpoDetails: orgMeta.dpoDetails,
        ndpcRegistrationNumber: orgMeta.ndpcRegistrationNumber,
        records,
        lastUpdated,
        version: '1.0',
      };
    },

    /**
     * Persist the ROPA by upserting each ProcessingRecord individually.
     * The organisation envelope fields are not stored in the database — they
     * come from orgMeta on every load.
     */
    async save(ropa: RecordOfProcessingActivities): Promise<void> {
      await Promise.all(
        ropa.records.map((record) =>
          (prisma as any).processingRecord.upsert({
            where: { id: record.id },
            update: mapProcessingRecordToRow(record),
            create: {
              id: record.id,
              ...mapProcessingRecordToRow(record),
            },
          }),
        ),
      );
    },

    /**
     * Archive all active processing records without deleting them.
     * Archived records are excluded from active ROPA reports but are retained
     * for audit purposes as required by the NDPA accountability principle.
     */
    async remove(): Promise<void> {
      await (prisma as any).processingRecord.updateMany({
        where: { status: 'active' },
        data: { status: 'archived' },
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Prisma ProcessingRecord row to the toolkit's ProcessingRecord type.
 * Several rich fields on the toolkit type (controllerDetails, lawfulBasisJustification, etc.)
 * are not in the simplified Prisma schema — they default to placeholder values.
 * Extend the schema with additional columns if you need full round-trip fidelity.
 */
function mapRowToProcessingRecord(row: any): ProcessingRecord {
  return {
    id: row.id,
    // `name` and `description` are derived from purpose since the schema is simplified.
    name: row.purpose,
    description: row.purpose,
    controllerDetails: {
      name: '',
      contact: '',
      address: '',
    },
    lawfulBasis: row.lawfulBasis as ProcessingRecord['lawfulBasis'],
    lawfulBasisJustification: '',
    purposes: [row.purpose],
    dataCategories: (row.dataCategories as string[]) ?? [],
    dataSubjectCategories: (row.dataSubjects as string[]) ?? [],
    recipients: (row.recipients as string[]) ?? [],
    crossBorderTransfers: row.transferCountries
      ? (row.transferCountries as string[]).map((country: string) => ({
          destinationCountry: country,
          safeguards: '',
          transferMechanism: row.transferMechanism ?? '',
        }))
      : undefined,
    retentionPeriod: row.retentionPeriod,
    securityMeasures: (row.securityMeasures as string[]) ?? [],
    dataSource: 'data_subject',
    dpiaRequired: row.dpiaConducted,
    automatedDecisionMaking: false,
    status: row.status as ProcessingRecord['status'],
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Map a toolkit ProcessingRecord to the Prisma `create`/`update` data shape.
 * Composite toolkit fields are flattened to match the simplified Prisma schema.
 */
function mapProcessingRecordToRow(record: ProcessingRecord): Record<string, unknown> {
  return {
    purpose: record.purposes[0] ?? record.name,
    lawfulBasis: record.lawfulBasis,
    dataCategories: record.dataCategories,
    dataSubjects: record.dataSubjectCategories,
    recipients: record.recipients,
    retentionPeriod: record.retentionPeriod,
    securityMeasures: record.securityMeasures,
    transferCountries: record.crossBorderTransfers?.map((t) => t.destinationCountry) ?? null,
    transferMechanism: record.crossBorderTransfers?.[0]?.transferMechanism ?? null,
    dpiaConducted: record.dpiaRequired,
    status: record.status,
  };
}
