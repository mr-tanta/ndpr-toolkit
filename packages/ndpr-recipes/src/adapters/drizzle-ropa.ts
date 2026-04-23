/**
 * Drizzle adapter for the ROPA (Record of Processing Activities) module.
 *
 * Implements StorageAdapter<RecordOfProcessingActivities> backed by the
 * `ndpr_processing_records` Drizzle table.
 *
 * The toolkit's useROPA() hook stores a single RecordOfProcessingActivities
 * object that wraps an array of ProcessingRecord entries plus organisation
 * metadata. This adapter maps between that object and the flat Drizzle table.
 *
 * Behaviour
 * ---------
 * - LOAD  → reads all ProcessingRecord rows and assembles them into a
 *           RecordOfProcessingActivities using the org metadata you provide.
 * - SAVE  → upserts each ProcessingRecord individually by ID using Drizzle's
 *           `onConflictDoUpdate` pattern.
 * - REMOVE → marks all active records as 'archived' (no hard deletes).
 *
 * Organisation metadata
 * ---------------------
 * Because the ROPA object includes organisation-level fields (name, contact,
 * address, DPO details) that are not stored in the processing records table,
 * you must supply them when creating the adapter.
 *
 * Usage
 * -----
 * Copy this file into your project alongside your Drizzle client, then wire it
 * into the toolkit hook:
 *
 *   import { drizzle } from 'drizzle-orm/node-postgres';
 *   import { Pool } from 'pg';
 *   import { useROPA } from '@tantainnovative/ndpr-toolkit';
 *   import { drizzleROPAAdapter } from './adapters/drizzle-ropa';
 *   import * as schema from './drizzle/schema';
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = drizzle(pool, { schema });
 *
 *   function ROPAPage() {
 *     const adapter = drizzleROPAAdapter(db, {
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
 * - The `ndpr_processing_records` table must exist (run your Drizzle migration).
 * - `drizzle-orm` must be installed in your project.
 * - `@tantainnovative/ndpr-toolkit` must be installed in your project.
 *
 * @module adapters/drizzle-ropa
 */

import { eq, desc } from 'drizzle-orm';
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import type { RecordOfProcessingActivities, ProcessingRecord } from '@tantainnovative/ndpr-toolkit';
import { processingRecords } from '../drizzle/schema';

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
 * Creates a Drizzle-backed StorageAdapter for RecordOfProcessingActivities.
 *
 * @param db       - Your Drizzle database instance (any driver — pg, neon, libsql, etc.)
 * @param orgMeta  - Organisation-level metadata used to build the ROPA envelope.
 * @returns A StorageAdapter<RecordOfProcessingActivities> ready to pass to useROPA().
 */
export function drizzleROPAAdapter(
  db: any,
  orgMeta: ROPAOrgMetadata,
): StorageAdapter<RecordOfProcessingActivities> {
  return {
    /**
     * Load all processing records and wrap them in a RecordOfProcessingActivities.
     * Returns null if no records exist yet so the hook renders an empty ROPA.
     */
    async load(): Promise<RecordOfProcessingActivities | null> {
      const rows = await db
        .select()
        .from(processingRecords)
        .orderBy(desc(processingRecords.createdAt));

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
      if (ropa.records.length === 0) return;

      await Promise.all(
        ropa.records.map((record) => {
          const row = mapProcessingRecordToRow(record);
          return db
            .insert(processingRecords)
            .values({ id: record.id, ...row })
            .onConflictDoUpdate({
              target: processingRecords.id,
              set: row,
            });
        }),
      );
    },

    /**
     * Archive all active processing records without deleting them.
     * Archived records are excluded from active ROPA reports but are retained
     * for audit purposes as required by the NDPA accountability principle.
     */
    async remove(): Promise<void> {
      await db
        .update(processingRecords)
        .set({ status: 'archived' })
        .where(eq(processingRecords.status, 'active'));
    },
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw Drizzle row (from ndpr_processing_records) to the toolkit's
 * ProcessingRecord type. Several rich fields on the toolkit type default to
 * placeholder values — extend the schema if you need full round-trip fidelity.
 */
function mapRowToProcessingRecord(row: any): ProcessingRecord {
  return {
    id: row.id,
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
 * Map a toolkit ProcessingRecord to the Drizzle insert/update row shape.
 * Composite toolkit fields are flattened to match the simplified schema.
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
    updatedAt: new Date(),
  };
}
