/**
 * Express — DSR (Data Subject Rights) Router
 *
 * Handles listing, creating, retrieving, and updating Data Subject Rights
 * requests as required by NDPA Sections 34–38 (rights to access, rectification,
 * erasure, portability, and objection). Requests must be fulfilled within
 * 30 days of submission under the Act.
 *
 * Routes
 * ------
 *   GET    /dsr              — List DSR requests (optional ?status= filter)
 *   POST   /dsr              — Submit a new DSR request
 *   GET    /dsr/:id          — Fetch a single DSR request by ID
 *   PATCH  /dsr/:id          — Update request status, assignee, or internal notes
 *
 * How to use
 * ----------
 * This router is mounted automatically by `createNDPRRouter()` in `../index.ts`.
 *
 * @module express/routes/dsr
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dsrRouter = Router();

// ---------------------------------------------------------------------------
// GET /dsr?status=pending
// ---------------------------------------------------------------------------

/**
 * List all DSR requests, optionally filtered by status.
 *
 * Returns requests ordered newest-first so overdue items are easier to spot.
 * Filter by status=pending to see requests awaiting acknowledgement.
 *
 * Query params:
 *   status (optional) — pending | in_progress | completed | rejected
 *
 * Returns 200 with an array of DSRRequest rows.
 */
dsrRouter.get('/', async (req, res) => {
  const { status } = req.query;

  const requests = await prisma.dSRRequest.findMany({
    where: typeof status === 'string' ? { status } : undefined,
    orderBy: { submittedAt: 'desc' },
  });

  return res.json(requests);
});

// ---------------------------------------------------------------------------
// POST /dsr
// ---------------------------------------------------------------------------

/**
 * Submit a new Data Subject Rights request.
 *
 * Creates a new request with status 'pending' and automatically sets the
 * statutory 30-day deadline (dueAt) as required by NDPA Section 34.
 * An audit log entry is created for accountability purposes.
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
dsrRouter.post('/', async (req, res) => {
  const {
    type,
    subjectName,
    subjectEmail,
    subjectPhone,
    identifierType,
    identifierValue,
    description,
  } = req.body;

  if (!type || !subjectName || !subjectEmail || !identifierType || !identifierValue) {
    return res.status(400).json({
      error:
        'type, subjectName, subjectEmail, identifierType, and identifierValue are required',
    });
  }

  // NDPA mandates a 30-day response window from submission.
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

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dsr',
      action: 'submitted',
      entityId: request.id,
      entityType: 'DSRRequest',
      changes: { type, subjectEmail, status: 'pending' },
    },
  });

  return res.status(201).json(request);
});

// ---------------------------------------------------------------------------
// GET /dsr/:id
// ---------------------------------------------------------------------------

/**
 * Fetch a single DSR request by its ID.
 *
 * Returns full request details including the due date, submission timestamp,
 * assignee, and any internal notes added by the DPO.
 *
 * Path params:
 *   id (required) — the DSRRequest record ID
 *
 * Returns 200 with the DSRRequest row, or 404 if not found.
 */
dsrRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const request = await prisma.dSRRequest.findUnique({ where: { id } });

  if (!request) {
    return res.status(404).json({ error: 'DSR request not found' });
  }

  return res.json(request);
});

// ---------------------------------------------------------------------------
// PATCH /dsr/:id
// ---------------------------------------------------------------------------

/**
 * Update a DSR request's status, assignee, or internal notes.
 *
 * Used by DPO tooling to progress requests through the statutory workflow:
 * pending → in_progress → completed (or rejected). Status transitions are
 * timestamped so the 30-day SLA can be tracked per NDPA Section 34.
 *
 * Body (JSON, all fields optional):
 *   status        — pending | in_progress | completed | rejected
 *   assignedTo    — name/ID of the staff member handling the request
 *   internalNotes — free-text notes visible only to internal staff
 *
 * Returns 200 with the updated DSRRequest row.
 */
dsrRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, internalNotes } = req.body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    data.status = status;
    if (status === 'in_progress') data.acknowledgedAt = new Date();
    if (status === 'completed') data.completedAt = new Date();
  }
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      error: 'At least one of status, assignedTo, or internalNotes must be provided',
    });
  }

  const updated = await prisma.dSRRequest.update({ where: { id }, data });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dsr',
      action: 'updated',
      entityId: id,
      entityType: 'DSRRequest',
      changes: data as any,
    },
  });

  return res.json(updated);
});
