/**
 * Next.js App Router — DSR (Data Subject Rights) List/Create Route
 *
 * Handles listing and creating Data Subject Rights requests as required by
 * NDPA Sections 34–38 (rights to access, rectification, erasure, portability,
 * and objection). All requests must be acknowledged within 72 hours and
 * fulfilled within 30 days under the Act.
 *
 * Endpoints
 * ---------
 *   GET  /api/dsr          — List DSR requests (optional ?status= filter)
 *   POST /api/dsr          — Submit a new DSR request
 *
 * How to use
 * ----------
 * Copy this file to `app/api/dsr/route.ts` in your Next.js project.
 * For single-request operations see `app/api/dsr/[id]/route.ts`.
 *
 * @module dsr/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/dsr?status=pending
// ---------------------------------------------------------------------------

/**
 * List all DSR requests, optionally filtered by status.
 *
 * Supports the admin/DPO dashboard — returns requests ordered newest-first
 * so overdue items surface quickly. The optional `status` query parameter
 * lets you display only pending, in-progress, or completed requests.
 *
 * Query params:
 *   status (optional) — filter by request status: pending | in_progress | completed | rejected
 *
 * Returns 200 with an array of DSRRequest rows.
 */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');

  const requests = await prisma.dSRRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { submittedAt: 'desc' },
  });

  return NextResponse.json(requests);
}

// ---------------------------------------------------------------------------
// POST /api/dsr
// ---------------------------------------------------------------------------

/**
 * Submit a new Data Subject Rights request.
 *
 * The NDPA requires organisations to provide a clear mechanism for data
 * subjects to exercise their rights (Section 34). This route:
 *   1. Validates required fields.
 *   2. Calculates the statutory 30-day deadline (dueAt).
 *   3. Persists the request with status 'pending'.
 *   4. Writes an audit log entry for accountability.
 *
 * Body (JSON):
 *   type             (required) — access | rectification | erasure | portability | objection
 *   subjectName      (required) — full name of the data subject
 *   subjectEmail     (required) — email address of the data subject
 *   identifierType   (required) — how the subject is identified (e.g. 'email', 'account_id')
 *   identifierValue  (required) — the subject's identifier value
 *   subjectPhone     (optional) — phone number
 *   description      (optional) — additional context from the subject
 *
 * Returns 201 with the newly created DSRRequest row.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    type,
    subjectName,
    subjectEmail,
    subjectPhone,
    identifierType,
    identifierValue,
    description,
  } = body;

  if (!type || !subjectName || !subjectEmail || !identifierType || !identifierValue) {
    return NextResponse.json(
      { error: 'type, subjectName, subjectEmail, identifierType, and identifierValue are required' },
      { status: 400 },
    );
  }

  // NDPA mandates a 30-day response window from the date of submission.
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 30);

  const request = await prisma.dSRRequest.create({
    data: {
      type,
      subjectName,
      subjectEmail,
      subjectPhone: subjectPhone ?? null,
      identifierType,
      identifierValue,
      description: description ?? null,
      status: 'pending',
      dueAt,
    },
  });

  // Audit log for NDPA Section 44 accountability principle.
  await prisma.complianceAuditLog.create({
    data: {
      module: 'dsr',
      action: 'submitted',
      entityId: request.id,
      entityType: 'DSRRequest',
      changes: { type, subjectEmail, status: 'pending' },
    },
  });

  return NextResponse.json(request, { status: 201 });
}
