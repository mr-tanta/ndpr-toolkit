/**
 * Next.js App Router — Consent API Route
 *
 * Handles reading, writing, and revoking data subject consent records as
 * required by NDPA Section 25 (lawful basis) and Section 26 (consent withdrawal).
 *
 * Endpoints
 * ---------
 *   GET    /api/consent?subjectId=xxx   — Load the active consent record
 *   POST   /api/consent                 — Save new consent (revokes previous)
 *   DELETE /api/consent?subjectId=xxx   — Revoke all active consent
 *
 * How to use
 * ----------
 * Copy this file to `app/api/consent/route.ts` in your Next.js project.
 * Ensure the `ndpr_consent_records` table exists (run the ndpr-recipes migration).
 *
 * @module consent/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  validateConsentStructured,
  type ConsentSettings,
} from '@tantainnovative/ndpr-toolkit/server';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/consent?subjectId=xxx
// ---------------------------------------------------------------------------

/**
 * Load the most recent active (non-revoked) consent record for a data subject.
 *
 * NDPA Section 25 requires that data controllers retain evidence of consent —
 * this endpoint lets your front-end verify whether a subject has already
 * consented so you can skip the consent banner on return visits.
 *
 * Query params:
 *   subjectId (required) — stable identifier for the data subject
 *
 * Returns 200 with the ConsentRecord, or 200 with `null` if none exists.
 */
export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId');

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId required' }, { status: 400 });
  }

  const record = await prisma.consentRecord.findFirst({
    where: { subjectId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(record);
}

// ---------------------------------------------------------------------------
// POST /api/consent
// ---------------------------------------------------------------------------

/**
 * Persist a new consent decision for a data subject.
 *
 * The route follows the immutable-audit pattern mandated by NDPA Section 25:
 * any previously active record is soft-revoked before the new one is inserted,
 * so the full consent history is preserved for accountability purposes.
 *
 * Body (JSON):
 *   subjectId   (required) — stable subject identifier
 *   consents    (required) — map of consent category → boolean
 *   version     (required) — consent policy version string
 *   method      (optional) — how consent was captured (default: 'api')
 *   lawfulBasis (optional) — NDPA lawful basis, e.g. 'consent', 'legitimate_interest'
 *
 * Returns 201 with the newly created ConsentRecord.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Body must be valid JSON.', fields: {} },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: 'Validation failed.', fields: { _root: 'Payload must be an object' } },
      { status: 400 },
    );
  }

  const subjectId = typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const { valid, errors, data } = validateConsentStructured(body as ConsentSettings);

  if (!subjectId || !valid || !data) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        fields: {
          ...(!subjectId ? { subjectId: 'subjectId is required' } : {}),
          ...Object.fromEntries(errors.map((error) => [error.field, error.message])),
        },
      },
      { status: 400 },
    );
  }

  // Revoke any previously active consent records so there is at most one
  // active record per subject at all times (immutable-audit pattern).
  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  // Insert the new consent record, capturing request metadata for evidence.
  const record = await prisma.consentRecord.create({
    data: {
      subjectId,
      consents: data.consents,
      version: data.version,
      method: data.method,
      lawfulBasis: data.lawfulBasis ?? null,
      ipAddress: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    },
  });

  // Write an audit log entry for accountability (NDPA Section 44).
  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'created',
      entityId: record.id,
      entityType: 'ConsentRecord',
      changes: { subjectId, version: data.version, consents: data.consents },
    },
  });

  return NextResponse.json(record, { status: 201 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------------------------------------------------------------------------
// DELETE /api/consent?subjectId=xxx
// ---------------------------------------------------------------------------

/**
 * Revoke all active consent records for a data subject.
 *
 * NDPA Section 26 grants data subjects the right to withdraw consent at any
 * time. This endpoint soft-revokes records rather than deleting them so the
 * audit trail remains intact for regulatory inspection.
 *
 * Query params:
 *   subjectId (required) — stable identifier for the data subject
 *
 * Returns 200 `{ success: true }` when complete.
 */
export async function DELETE(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId');

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId required' }, { status: 400 });
  }

  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  // Write an audit log entry for the revocation.
  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'revoked',
      entityId: subjectId,
      entityType: 'ConsentRecord',
    },
  });

  return NextResponse.json({ success: true });
}
