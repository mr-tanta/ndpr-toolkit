/**
 * Next.js App Router — ROPA (Record of Processing Activities) Route
 *
 * Handles listing, creating, updating, and archiving processing activity records.
 * Under the NDPA accountability principle (analogous to GDPR Article 30), data
 * controllers with more than 250 employees — or that process sensitive data —
 * must maintain a Record of Processing Activities (ROPA).
 *
 * Endpoints
 * ---------
 *   GET    /api/ropa         — List all processing records (optional ?status= filter)
 *   POST   /api/ropa         — Create a new processing record
 *   PATCH  /api/ropa         — Update an existing processing record (body includes `id`)
 *   DELETE /api/ropa?id=xxx  — Archive a processing record (soft delete)
 *
 * How to use
 * ----------
 * Copy this file to `app/api/ropa/route.ts` in your Next.js project.
 *
 * @module ropa/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/ropa?status=active
// ---------------------------------------------------------------------------

/**
 * List all processing activity records.
 *
 * Returns records ordered by creation date ascending so the ROPA reads
 * chronologically. Filter by status to distinguish active from archived entries.
 *
 * Query params:
 *   status (optional) — active | archived (default: returns all)
 *
 * Returns 200 with an array of ProcessingRecord rows.
 */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');

  const records = await prisma.processingRecord.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(records);
}

// ---------------------------------------------------------------------------
// POST /api/ropa
// ---------------------------------------------------------------------------

/**
 * Create a new processing activity record.
 *
 * Each record documents a single processing activity — for example, "Customer
 * order processing" or "Marketing email campaigns". Together, all active records
 * form the organisation's ROPA as required under the NDPA accountability principle.
 *
 * Body (JSON):
 *   purpose             (required) — description of the processing activity
 *   lawfulBasis         (required) — consent | contract | legal_obligation | vital_interests
 *                                    | public_task | legitimate_interests
 *   dataCategories      (required) — array of data category labels (e.g. ['name', 'email'])
 *   dataSubjects        (required) — array of subject category labels (e.g. ['customers'])
 *   recipients          (required) — array of recipient labels (e.g. ['payment processor'])
 *   retentionPeriod     (required) — human-readable retention policy (e.g. '7 years')
 *   securityMeasures    (required) — array of security measures in place
 *   transferCountries   (optional) — array of countries receiving cross-border transfers
 *   transferMechanism   (optional) — legal mechanism for transfers (e.g. 'adequacy decision')
 *   dpiaConducted       (optional) — whether a DPIA has been performed (default false)
 *
 * Returns 201 with the newly created ProcessingRecord row.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
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
  } = body;

  if (
    !purpose ||
    !lawfulBasis ||
    !Array.isArray(dataCategories) ||
    !Array.isArray(dataSubjects) ||
    !Array.isArray(recipients) ||
    !retentionPeriod ||
    !Array.isArray(securityMeasures)
  ) {
    return NextResponse.json(
      {
        error:
          'purpose, lawfulBasis, dataCategories, dataSubjects, recipients, retentionPeriod, and securityMeasures are required',
      },
      { status: 400 },
    );
  }

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

  return NextResponse.json(record, { status: 201 });
}

// ---------------------------------------------------------------------------
// PATCH /api/ropa
// ---------------------------------------------------------------------------

/**
 * Update an existing processing activity record.
 *
 * Call this when a processing activity changes — e.g. a new data category
 * is added, the retention period changes, or a DPIA is conducted. Keeping
 * the ROPA up to date is part of the NDPA accountability obligation.
 *
 * Body (JSON):
 *   id   (required) — ID of the ProcessingRecord to update
 *   ...  (all other fields from POST are optional — only send what changed)
 *
 * Returns 200 with the updated ProcessingRecord row.
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required in the request body' }, { status: 400 });
  }

  const existing = await prisma.processingRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Processing record not found' }, { status: 404 });
  }

  const updated = await prisma.processingRecord.update({
    where: { id },
    data: fields,
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'ropa',
      action: 'updated',
      entityId: id,
      entityType: 'ProcessingRecord',
      changes: fields,
    },
  });

  return NextResponse.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE /api/ropa?id=xxx
// ---------------------------------------------------------------------------

/**
 * Archive a processing activity record (soft delete).
 *
 * Records are never hard-deleted — archiving sets status to 'archived' so
 * the historical ROPA remains available for regulatory review. This supports
 * the NDPA accountability principle requirement to demonstrate compliance
 * over time, not just in the present.
 *
 * Query params:
 *   id (required) — ID of the ProcessingRecord to archive
 *
 * Returns 200 `{ success: true }` when complete.
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
  }

  const existing = await prisma.processingRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Processing record not found' }, { status: 404 });
  }

  await prisma.processingRecord.update({
    where: { id },
    data: { status: 'archived' },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'ropa',
      action: 'archived',
      entityId: id,
      entityType: 'ProcessingRecord',
    },
  });

  return NextResponse.json({ success: true });
}
