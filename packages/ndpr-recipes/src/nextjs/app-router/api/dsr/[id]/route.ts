/**
 * Next.js App Router — DSR Single-Request Route
 *
 * Handles reading and updating individual Data Subject Rights requests.
 * Used by the DPO/admin interface to view request details and move requests
 * through the processing workflow as required by NDPA Sections 34–38.
 *
 * Endpoints
 * ---------
 *   GET   /api/dsr/[id]   — Fetch a single DSR request by ID
 *   PATCH /api/dsr/[id]   — Update request status, assignee, or internal notes
 *
 * How to use
 * ----------
 * Copy this file to `app/api/dsr/[id]/route.ts` in your Next.js project.
 *
 * @module dsr/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Next.js App Router route context — contains dynamic segment params */
interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// GET /api/dsr/[id]
// ---------------------------------------------------------------------------

/**
 * Fetch a single DSR request by its ID.
 *
 * Used by the admin detail view to display full request information including
 * the submission timestamp, due date, and any internal notes added by the DPO.
 *
 * Path params:
 *   id (required) — the DSRRequest record ID
 *
 * Returns 200 with the DSRRequest row, or 404 if not found.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params;

  const request = await prisma.dSRRequest.findUnique({ where: { id } });

  if (!request) {
    return NextResponse.json({ error: 'DSR request not found' }, { status: 404 });
  }

  return NextResponse.json(request);
}

// ---------------------------------------------------------------------------
// PATCH /api/dsr/[id]
// ---------------------------------------------------------------------------

/**
 * Update a DSR request's status, assignee, or internal notes.
 *
 * This route is called by DPO tooling to progress a request through the
 * statutory workflow: pending → in_progress → completed (or rejected).
 * Status transitions are timestamped so the 30-day SLA can be tracked.
 *
 * Body (JSON, all fields optional):
 *   status        — pending | in_progress | completed | rejected
 *   assignedTo    — name/ID of the staff member handling the request
 *   internalNotes — free-text notes visible only to internal staff
 *
 * Returns 200 with the updated DSRRequest row.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const body = await req.json();
  const { status, assignedTo, internalNotes } = body;

  // Build the update payload — only include fields the caller supplied.
  const data: Record<string, unknown> = {};

  if (status !== undefined) {
    data.status = status;

    // Stamp workflow timestamps when moving to acknowledged or completed states.
    if (status === 'in_progress') data.acknowledgedAt = new Date();
    if (status === 'completed') data.completedAt = new Date();
  }

  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'At least one of status, assignedTo, or internalNotes must be provided' },
      { status: 400 },
    );
  }

  const updated = await prisma.dSRRequest.update({ where: { id }, data });

  // Audit log for every status change (NDPA Section 44 accountability).
  await prisma.complianceAuditLog.create({
    data: {
      module: 'dsr',
      action: 'updated',
      entityId: id,
      entityType: 'DSRRequest',
      changes: data as any,
    },
  });

  return NextResponse.json(updated);
}
