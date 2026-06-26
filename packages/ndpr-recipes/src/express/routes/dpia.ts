/**
 * Express — DPIA (Data Protection Impact Assessment) Router
 *
 * Handles listing, creating, updating, and deleting DPIA records. Under NDPA
 * Section 28, controllers must conduct and document a DPIA before processing
 * that is likely to create high risk for data subjects.
 *
 * Routes
 * ------
 *   GET    /dpia?status=draft — List DPIA records, optionally filtered
 *   GET    /dpia/:id          — Read one DPIA record
 *   POST   /dpia              — Create a validated DPIA record
 *   PUT    /dpia/:id          — Update a DPIA record
 *   DELETE /dpia/:id          — Delete a DPIA record
 *
 * @module express/routes/dpia
 */

import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const prisma = new PrismaClient();
export const dpiaRouter = Router();

const RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);
const STATUSES = new Set(['draft', 'in_progress', 'completed', 'approved', 'rejected']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidDpiaData(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isRecord(value.assessor) &&
    isRecord(value.answers) &&
    Array.isArray(value.risks) &&
    isNonEmptyString(value.conclusion) &&
    isNonEmptyString(value.version)
  );
}

function validateCreateBody(body: unknown) {
  const fields: Record<string, string> = {};

  if (!isRecord(body)) {
    return {
      valid: false as const,
      fields: { body: 'Request body must be a JSON object.' },
    };
  }

  if (!isNonEmptyString(body.projectName)) fields.projectName = 'projectName is required.';
  if (!isNonEmptyString(body.description)) fields.description = 'description is required.';
  if (!isValidDpiaData(body.dpiaData)) {
    fields.dpiaData = 'dpiaData must include assessor, answers, risks, conclusion, and version.';
  }
  if (!RISK_LEVELS.has(asString(body.overallRisk) ?? '')) {
    fields.overallRisk = 'overallRisk must be one of low, medium, high, or critical.';
  }
  if (!isNonNegativeNumber(body.score)) fields.score = 'score must be a non-negative number.';
  if (!isNonEmptyString(body.conductedBy)) fields.conductedBy = 'conductedBy is required.';
  if (body.approvedBy !== undefined && body.approvedBy !== null && typeof body.approvedBy !== 'string') {
    fields.approvedBy = 'approvedBy must be a string when provided.';
  }

  return Object.keys(fields).length > 0
    ? { valid: false as const, fields }
    : { valid: true as const, body };
}

function validateUpdateBody(body: unknown) {
  const fields: Record<string, string> = {};

  if (!isRecord(body)) {
    return {
      valid: false as const,
      fields: { body: 'Request body must be a JSON object.' },
    };
  }

  if (body.projectName !== undefined && !isNonEmptyString(body.projectName)) {
    fields.projectName = 'projectName must be a non-empty string when provided.';
  }
  if (body.description !== undefined && !isNonEmptyString(body.description)) {
    fields.description = 'description must be a non-empty string when provided.';
  }
  if (body.dpiaData !== undefined && !isValidDpiaData(body.dpiaData)) {
    fields.dpiaData = 'dpiaData must include assessor, answers, risks, conclusion, and version.';
  }
  if (body.status !== undefined && !STATUSES.has(asString(body.status) ?? '')) {
    fields.status = 'status must be one of draft, in_progress, completed, approved, or rejected.';
  }
  if (body.overallRisk !== undefined && !RISK_LEVELS.has(asString(body.overallRisk) ?? '')) {
    fields.overallRisk = 'overallRisk must be one of low, medium, high, or critical.';
  }
  if (body.score !== undefined && !isNonNegativeNumber(body.score)) {
    fields.score = 'score must be a non-negative number.';
  }
  if (body.conductedBy !== undefined && !isNonEmptyString(body.conductedBy)) {
    fields.conductedBy = 'conductedBy must be a non-empty string when provided.';
  }
  if (body.approvedBy !== undefined && body.approvedBy !== null && typeof body.approvedBy !== 'string') {
    fields.approvedBy = 'approvedBy must be a string when provided.';
  }

  return Object.keys(fields).length > 0
    ? { valid: false as const, fields }
    : { valid: true as const, body };
}

// ---------------------------------------------------------------------------
// GET /dpia?status=draft
// ---------------------------------------------------------------------------

dpiaRouter.get('/', async (req, res) => {
  const { status } = req.query;

  const records = await prisma.dPIARecord.findMany({
    where: typeof status === 'string' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return res.json(records);
});

// ---------------------------------------------------------------------------
// GET /dpia/:id
// ---------------------------------------------------------------------------

dpiaRouter.get('/:id', async (req, res) => {
  const record = await prisma.dPIARecord.findUnique({ where: { id: req.params.id } });

  if (!record) {
    return res.status(404).json({ error: 'DPIA record not found' });
  }

  return res.json(record);
});

// ---------------------------------------------------------------------------
// POST /dpia
// ---------------------------------------------------------------------------

dpiaRouter.post('/', async (req, res) => {
  const validation = validateCreateBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const {
    projectName,
    description,
    dpiaData,
    overallRisk,
    score,
    conductedBy,
    approvedBy,
  } = validation.body;

  const record = await prisma.dPIARecord.create({
    data: {
      projectName,
      description,
      dpiaData,
      overallRisk,
      score,
      status: 'draft',
      conductedBy,
      approvedBy: approvedBy ?? null,
    },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dpia',
      action: 'created',
      entityId: record.id,
      entityType: 'DPIARecord',
      changes: { projectName, overallRisk, score, status: 'draft' },
    },
  });

  return res.status(201).json(record);
});

// ---------------------------------------------------------------------------
// PUT /dpia/:id
// ---------------------------------------------------------------------------

dpiaRouter.put('/:id', async (req, res) => {
  const validation = validateUpdateBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const { id } = req.params;
  const existing = await prisma.dPIARecord.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'DPIA record not found' });
  }

  const record = await prisma.dPIARecord.update({
    where: { id },
    data: validation.body,
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dpia',
      action: 'updated',
      entityId: record.id,
      entityType: 'DPIARecord',
      changes: validation.body,
    },
  });

  return res.json(record);
});

// ---------------------------------------------------------------------------
// DELETE /dpia/:id
// ---------------------------------------------------------------------------

dpiaRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.dPIARecord.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'DPIA record not found' });
  }

  await prisma.dPIARecord.delete({ where: { id } });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dpia',
      action: 'deleted',
      entityId: id,
      entityType: 'DPIARecord',
      changes: { projectName: existing.projectName },
    },
  });

  return res.json({ success: true });
});
