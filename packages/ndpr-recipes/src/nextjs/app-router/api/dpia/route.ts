/**
 * Next.js App Router — DPIA (Data Protection Impact Assessment) Route
 *
 * Handles listing, creating, updating, and deleting DPIA records. Under NDPA
 * Section 28, controllers must conduct and document a DPIA before processing
 * that is likely to create high risk for data subjects.
 *
 * Endpoints
 * ---------
 *   GET    /api/dpia?status=draft — List DPIA records, optionally filtered
 *   GET    /api/dpia?id=xxx       — Read one DPIA record
 *   POST   /api/dpia              — Create a validated DPIA record
 *   PUT    /api/dpia              — Update a DPIA record; body includes `id`
 *   DELETE /api/dpia?id=xxx       — Delete a DPIA record
 *
 * @module dpia/route
 */

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

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

  if (!isNonEmptyString(body.id)) fields.id = 'id is required in the request body.';
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

async function parseJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function validationResponse(fields: Record<string, string>) {
  return NextResponse.json({ error: 'Validation failed.', fields }, { status: 400 });
}

// ---------------------------------------------------------------------------
// GET /api/dpia?status=draft OR /api/dpia?id=xxx
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    const record = await prisma.dPIARecord.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  }

  const status = req.nextUrl.searchParams.get('status');
  const records = await prisma.dPIARecord.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(records);
}

// ---------------------------------------------------------------------------
// POST /api/dpia
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const parsed = await parseJson(req);
  const validation = validateCreateBody(parsed);
  if (!validation.valid) return validationResponse(validation.fields);

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

  return NextResponse.json(record, { status: 201 });
}

// ---------------------------------------------------------------------------
// PUT /api/dpia
// ---------------------------------------------------------------------------

export async function PUT(req: NextRequest) {
  const parsed = await parseJson(req);
  const validation = validateUpdateBody(parsed);
  if (!validation.valid) return validationResponse(validation.fields);

  const { id, ...fields } = validation.body;

  const existing = await prisma.dPIARecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
  }

  const record = await prisma.dPIARecord.update({
    where: { id },
    data: fields,
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'dpia',
      action: 'updated',
      entityId: record.id,
      entityType: 'DPIARecord',
      changes: fields,
    },
  });

  return NextResponse.json(record);
}

// ---------------------------------------------------------------------------
// DELETE /api/dpia?id=xxx
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const existing = await prisma.dPIARecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'DPIA record not found' }, { status: 404 });
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

  return NextResponse.json({ success: true });
}
