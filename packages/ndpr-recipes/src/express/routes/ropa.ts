/**
 * Express — ROPA (Record of Processing Activities) Router
 *
 * Handles listing, creating, updating, and archiving processing activity records.
 * Under the NDPA accountability principle, data controllers must maintain a
 * Record of Processing Activities (ROPA). This router provides the full CRUD
 * surface for managing that record.
 *
 * Routes
 * ------
 *   GET    /ropa           — List all processing records (optional ?status= filter)
 *   POST   /ropa           — Create a new processing record
 *   PATCH  /ropa           — Update a processing record (body must include `id`)
 *   DELETE /ropa?id=xxx    — Archive a processing record (soft delete)
 *
 * How to use
 * ----------
 * This router is mounted automatically by `createNDPRRouter()` in `../index.ts`.
 *
 * @module express/routes/ropa
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  validateProcessingRecord,
  type ProcessingRecord,
} from '@tantainnovative/ndpr-toolkit/server';

const prisma = new PrismaClient();
export const ropaRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function createValidationRecord(
  body: Record<string, unknown>,
  id = 'new-processing-record',
): ProcessingRecord {
  const purpose = asString(body.purpose) ?? '';
  const dataSubjectCategories = asStringArray(body.dataSubjectCategories ?? body.dataSubjects);
  const purposes = asStringArray(body.purposes);

  return {
    id: asString(body.id) ?? id,
    name: asString(body.name) ?? purpose,
    description: asString(body.description) ?? purpose,
    controllerDetails: body.controllerDetails as ProcessingRecord['controllerDetails'],
    lawfulBasis: body.lawfulBasis as ProcessingRecord['lawfulBasis'],
    lawfulBasisJustification: asString(body.lawfulBasisJustification) ?? '',
    purposes: purposes.length > 0 ? purposes : [purpose].filter(Boolean),
    dataCategories: asStringArray(body.dataCategories),
    sensitiveDataCategories: asStringArray(body.sensitiveDataCategories),
    dataSubjectCategories,
    recipients: asStringArray(body.recipients),
    retentionPeriod: asString(body.retentionPeriod) ?? '',
    retentionJustification: asString(body.retentionJustification),
    securityMeasures: asStringArray(body.securityMeasures),
    dataSource: (asString(body.dataSource) ?? 'data_subject') as ProcessingRecord['dataSource'],
    thirdPartySourceDetails: asString(body.thirdPartySourceDetails),
    dpiaRequired: Boolean(body.dpiaRequired ?? body.dpiaConducted ?? false),
    dpiaReference: asString(body.dpiaReference),
    automatedDecisionMaking: Boolean(body.automatedDecisionMaking ?? false),
    automatedDecisionMakingDetails: asString(body.automatedDecisionMakingDetails),
    status: (asString(body.status) ?? 'active') as ProcessingRecord['status'],
    department: asString(body.department),
    systemsUsed: asStringArray(body.systemsUsed),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function validateRopaBody(body: unknown) {
  if (!isRecord(body)) {
    return {
      valid: false as const,
      fields: { body: 'Request body must be a JSON object.' },
    };
  }

  const result = validateProcessingRecord(createValidationRecord(body));
  if (!result.valid) {
    return {
      valid: false as const,
      fields: { processingRecord: result.errors },
    };
  }

  return { valid: true as const, body };
}

// ---------------------------------------------------------------------------
// GET /ropa?status=active
// ---------------------------------------------------------------------------

/**
 * List all processing activity records.
 *
 * Returns records ordered by creation date ascending so the ROPA reads
 * chronologically. Filter by status=active to see only current activities;
 * status=archived to review historical entries retained for audit purposes.
 *
 * Query params:
 *   status (optional) — active | archived
 *
 * Returns 200 with an array of ProcessingRecord rows.
 */
ropaRouter.get('/', async (req, res) => {
  const { status } = req.query;

  const records = await prisma.processingRecord.findMany({
    where: typeof status === 'string' ? { status } : undefined,
    orderBy: { createdAt: 'asc' },
  });

  return res.json(records);
});

// ---------------------------------------------------------------------------
// POST /ropa
// ---------------------------------------------------------------------------

/**
 * Create a new processing activity record.
 *
 * Each record documents a single processing activity (e.g. "Customer order
 * processing" or "Marketing email campaigns"). Together, all active records
 * form the organisation's ROPA required under the NDPA accountability principle.
 *
 * Body (JSON):
 *   purpose             (required) — description of the processing activity
 *   lawfulBasis         (required) — consent | contract | legal_obligation |
 *                                    vital_interests | public_interest | legitimate_interests
 *   lawfulBasisJustification (required) — documented reason for the chosen lawful basis
 *   controllerDetails   (required) — { name, contact, address }
 *   dataCategories      (required) — array of data category labels
 *   dataSubjects        (required) — array of subject category labels
 *   recipients          (required) — array of recipient category labels
 *   retentionPeriod     (required) — human-readable retention policy (e.g. '7 years')
 *   securityMeasures    (required) — array of security measures in place
 *   dataSource          (optional) — data_subject | third_party | public_source | other
 *   transferCountries   (optional) — array of countries receiving cross-border transfers
 *   transferMechanism   (optional) — legal mechanism for the transfers
 *   dpiaRequired        (optional) — whether a DPIA is required (default false)
 *   dpiaReference       (required when dpiaRequired=true)
 *
 * Returns 201 with the newly created ProcessingRecord row.
 */
ropaRouter.post('/', async (req, res) => {
  const validation = validateRopaBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const {
    purpose,
    lawfulBasis,
    dataCategories,
    dataSubjects,
    recipients,
    retentionPeriod,
    securityMeasures,
    transferCountries,
    transferMechanism,
    dpiaConducted,
  } = validation.body;

  const record = await prisma.processingRecord.create({
    data: {
      purpose,
      lawfulBasis,
      dataCategories,
      dataSubjects,
      recipients,
      retentionPeriod,
      securityMeasures,
      transferCountries: transferCountries ?? null,
      transferMechanism: transferMechanism ?? null,
      dpiaConducted: dpiaConducted ?? false,
      status: 'active',
    },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'ropa',
      action: 'created',
      entityId: record.id,
      entityType: 'ProcessingRecord',
      changes: { purpose, lawfulBasis, status: 'active' },
    },
  });

  return res.status(201).json(record);
});

// ---------------------------------------------------------------------------
// PATCH /ropa
// ---------------------------------------------------------------------------

/**
 * Update an existing processing activity record.
 *
 * Call this when a processing activity changes — e.g. a new data category
 * is added, the retention policy is updated, or a DPIA is conducted.
 * Keeping the ROPA accurate and current is part of the NDPA accountability obligation.
 *
 * Body (JSON):
 *   id   (required) — ID of the ProcessingRecord to update
 *   ...  (all other POST fields are optional — only include what changed)
 *
 * Returns 200 with the updated ProcessingRecord row.
 */
ropaRouter.patch('/', async (req, res) => {
  const { id, ...fields } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'id is required in the request body' });
  }

  const existing = await prisma.processingRecord.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Processing record not found' });
  }

  const updated = await prisma.processingRecord.update({ where: { id }, data: fields });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'ropa',
      action: 'updated',
      entityId: id,
      entityType: 'ProcessingRecord',
      changes: fields,
    },
  });

  return res.json(updated);
});

// ---------------------------------------------------------------------------
// DELETE /ropa?id=xxx
// ---------------------------------------------------------------------------

/**
 * Archive a processing activity record (soft delete).
 *
 * Records are never hard-deleted — archiving sets status to 'archived' so
 * the historical ROPA remains available for regulatory review. This supports
 * the NDPA accountability principle requirement to demonstrate compliance
 * over time, not just at a single point in time.
 *
 * Query params:
 *   id (required) — ID of the ProcessingRecord to archive
 *
 * Returns 200 `{ success: true }` when complete.
 */
ropaRouter.delete('/', async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id query parameter required' });
  }

  const existing = await prisma.processingRecord.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Processing record not found' });
  }

  await prisma.processingRecord.update({ where: { id }, data: { status: 'archived' } });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'ropa',
      action: 'archived',
      entityId: id,
      entityType: 'ProcessingRecord',
    },
  });

  return res.json({ success: true });
});
