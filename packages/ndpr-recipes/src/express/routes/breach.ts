/**
 * Express — Breach Notification Router
 *
 * Handles listing, creating, retrieving, and updating data breach reports as
 * required by NDPA Section 40, which mandates that controllers notify the NDPC
 * within 72 hours of discovering a breach that poses a risk to data subject
 * rights and freedoms.
 *
 * Routes
 * ------
 *   GET   /breach            — List breach reports (optional ?status= filter)
 *   POST  /breach            — Create a new breach report (auto-calculates severity)
 *   GET   /breach/:id        — Fetch a single breach report by ID
 *   PATCH /breach/:id        — Update status, severity, actions, or NDPC notification flag
 *
 * How to use
 * ----------
 * This router is mounted automatically by `createNDPRRouter()` in `../index.ts`.
 *
 * @module express/routes/breach
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { assessBreachNotification } from '@tantainnovative/ndpr-toolkit/server';

const prisma = new PrismaClient();
export const breachRouter = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = new Set(['ongoing', 'investigating', 'resolved', 'closed']);
const VALID_SEVERITIES = new Set(['critical', 'high', 'medium', 'low']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isValidDateString(value: unknown): boolean {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

function hasItems(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string');
}

function validateBreachCreate(body: unknown) {
  if (!isRecord(body)) {
    return { valid: false as const, fields: { body: 'Request body must be a JSON object.' } };
  }

  const fields: Record<string, string> = {};
  for (const field of ['title', 'description', 'category', 'reporterName']) {
    if (!asString(body[field])?.trim()) {
      fields[field] = `${field} is required.`;
    }
  }
  if (!isValidDateString(body.discoveredAt)) {
    fields.discoveredAt = 'discoveredAt must be a valid ISO date.';
  }
  if (body.occurredAt !== undefined && body.occurredAt !== null && !isValidDateString(body.occurredAt)) {
    fields.occurredAt = 'occurredAt must be a valid ISO date when provided.';
  }
  if (!asString(body.reporterEmail)?.trim() || !EMAIL_RE.test(asString(body.reporterEmail) ?? '')) {
    fields.reporterEmail = 'reporterEmail must be a valid email address.';
  }
  if (!hasItems(body.affectedSystems)) {
    fields.affectedSystems = 'affectedSystems must include at least one affected system.';
  }
  if (!hasItems(body.dataTypes)) {
    fields.dataTypes = 'dataTypes must include at least one data type.';
  }
  if (
    body.estimatedAffected !== undefined &&
    body.estimatedAffected !== null &&
    (typeof body.estimatedAffected !== 'number' || !Number.isFinite(body.estimatedAffected) || body.estimatedAffected < 0)
  ) {
    fields.estimatedAffected = 'estimatedAffected must be a non-negative number when provided.';
  }

  return Object.keys(fields).length > 0 ? { valid: false as const, fields } : { valid: true as const, body };
}

function validatePatchBody(body: unknown) {
  if (!isRecord(body)) {
    return { valid: false as const, fields: { body: 'Request body must be a JSON object.' } };
  }

  const fields: Record<string, string> = {};
  if (body.status !== undefined && (typeof body.status !== 'string' || !VALID_STATUSES.has(body.status))) {
    fields.status = 'status must be one of ongoing, investigating, resolved, or closed.';
  }
  if (
    body.severity !== undefined &&
    (typeof body.severity !== 'string' || !VALID_SEVERITIES.has(body.severity))
  ) {
    fields.severity = 'severity must be one of critical, high, medium, or low.';
  }
  if (body.initialActions !== undefined && typeof body.initialActions !== 'string') {
    fields.initialActions = 'initialActions must be a string when provided.';
  }
  if (body.ndpcNotificationSent !== undefined && typeof body.ndpcNotificationSent !== 'boolean') {
    fields.ndpcNotificationSent = 'ndpcNotificationSent must be a boolean when provided.';
  }

  return Object.keys(fields).length > 0 ? { valid: false as const, fields } : { valid: true as const, body };
}

// ---------------------------------------------------------------------------
// NDPC notification readiness (GAID 2025 Article 33(5))
// ---------------------------------------------------------------------------

/**
 * Assess a stored breach row against the NDPA S.40 / GAID 2025 Article 33(5)
 * notification content requirements. Returns which mandated items are still
 * missing and how long is left on the 72-hour clock.
 *
 * This recipe's `BreachReport` table is intentionally simplified, so fields
 * like likely consequences, mitigation measures, data-subject categories and
 * record count aren't persisted — they show as "missing" until you extend the
 * schema. Set NDPR_DPO_NAME / NDPR_DPO_EMAIL to record the contact point.
 */
function assessReadiness(report: any) {
  const a = assessBreachNotification({
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    discoveredAt: new Date(report.discoveredAt).getTime(),
    occurredAt: report.occurredAt ? new Date(report.occurredAt).getTime() : undefined,
    reportedAt: new Date(report.reportedAt ?? report.discoveredAt).getTime(),
    reporter: {
      name: report.reporterName,
      email: report.reporterEmail,
      department: report.reporterDepartment ?? '',
    },
    affectedSystems: report.affectedSystems ?? [],
    dataTypes: report.dataTypes ?? [],
    estimatedAffectedSubjects: report.estimatedAffected ?? undefined,
    initialActions: report.initialActions ?? undefined,
    dpoContact: process.env.NDPR_DPO_EMAIL
      ? { name: process.env.NDPR_DPO_NAME ?? 'DPO', email: process.env.NDPR_DPO_EMAIL }
      : undefined,
    status: report.status,
  });
  return {
    complete: a.complete,
    completeness: a.completeness,
    missing: a.missing,
    hoursRemaining: a.timing.hoursRemaining,
    overdue: a.timing.overdue,
  };
}

// ---------------------------------------------------------------------------
// Severity auto-calculation helper
// ---------------------------------------------------------------------------

/**
 * Derive an initial severity rating from breach category and scale of impact.
 * The DPO should review and adjust this before the NDPC notification is sent.
 */
function calculateSeverity(
  category: string,
  estimatedAffected?: number,
): 'critical' | 'high' | 'medium' | 'low' {
  const highRiskCategories = [
    'unauthorized_access',
    'ransomware',
    'data_exfiltration',
    'identity_theft',
  ];

  if (highRiskCategories.includes(category)) {
    if ((estimatedAffected ?? 0) > 1000) return 'critical';
    return 'high';
  }

  if ((estimatedAffected ?? 0) > 500) return 'high';
  if ((estimatedAffected ?? 0) > 50) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// GET /breach?status=ongoing
// ---------------------------------------------------------------------------

/**
 * List all breach reports, optionally filtered by status.
 *
 * Returns reports ordered by reportedAt descending so the most recent
 * (likely most urgent) incidents appear first. Use ?status=ongoing to view
 * only active incidents requiring attention or NDPC notification.
 *
 * Query params:
 *   status (optional) — ongoing | investigating | resolved | closed
 *
 * Returns 200 with an array of BreachReport rows.
 */
breachRouter.get('/', async (req, res) => {
  const { status } = req.query;

  const reports = await prisma.breachReport.findMany({
    where: typeof status === 'string' ? { status } : undefined,
    orderBy: { reportedAt: 'desc' },
  });

  return res.json(reports);
});

// ---------------------------------------------------------------------------
// POST /breach
// ---------------------------------------------------------------------------

/**
 * Create a new data breach report.
 *
 * The 72-hour NDPC notification clock (NDPA Section 40) starts from the
 * discoveredAt timestamp. Severity is auto-calculated from category and scale
 * — the DPO should review before submitting the formal NDPC notification.
 *
 * Body (JSON):
 *   title                (required) — short descriptive title
 *   description          (required) — detailed description of the incident
 *   category             (required) — breach category (e.g. 'unauthorized_access')
 *   discoveredAt         (required) — ISO timestamp when breach was discovered
 *   reporterName         (required) — name of the reporting person
 *   reporterEmail        (required) — reporter's email address
 *   affectedSystems      (required) — array of affected system/service names
 *   dataTypes            (required) — array of data type labels affected
 *   reporterDepartment   (optional) — reporter's department
 *   occurredAt           (optional) — ISO timestamp when breach occurred (if known)
 *   estimatedAffected    (optional) — approximate number of affected data subjects
 *   initialActions       (optional) — containment actions already taken
 *
 * Returns 201 with the newly created BreachReport row including auto-severity.
 */
breachRouter.post('/', async (req, res) => {
  const validation = validateBreachCreate(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const {
    title,
    description,
    category,
    discoveredAt,
    occurredAt,
    reporterName,
    reporterEmail,
    reporterDepartment,
    affectedSystems,
    dataTypes,
    estimatedAffected,
    initialActions,
  } = validation.body;

  const severity = calculateSeverity(category as string, estimatedAffected as number | undefined);

  const report = await prisma.breachReport.create({
    data: {
      title,
      description,
      category,
      severity,
      status: 'ongoing',
      discoveredAt: new Date(discoveredAt as string),
      occurredAt: occurredAt ? new Date(occurredAt as string) : null,
      reporterName,
      reporterEmail,
      reporterDepartment: reporterDepartment ?? null,
      affectedSystems,
      dataTypes,
      estimatedAffected: estimatedAffected ?? null,
      initialActions: initialActions ?? null,
    },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'breach',
      action: 'reported',
      entityId: report.id,
      entityType: 'BreachReport',
      changes: { title, category, severity, status: 'ongoing' },
    },
  });

  return res.status(201).json({ ...report, ndpcReadiness: assessReadiness(report) });
});

// ---------------------------------------------------------------------------
// GET /breach/:id
// ---------------------------------------------------------------------------

/**
 * Fetch a single breach report by its ID.
 *
 * Returns the full report including affected systems, data types, reporter
 * details, and NDPC notification status. Used by the incident detail view
 * and for generating the formal NDPC notification document.
 *
 * Path params:
 *   id (required) — the BreachReport record ID
 *
 * Returns 200 with the BreachReport row, or 404 if not found.
 */
breachRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const report = await prisma.breachReport.findUnique({ where: { id } });

  if (!report) {
    return res.status(404).json({ error: 'Breach report not found' });
  }

  // Surface NDPC notification readiness so the incident detail view can show
  // what's still needed before filing (GAID 2025 Art. 33).
  return res.json({ ...report, ndpcReadiness: assessReadiness(report) });
});

// ---------------------------------------------------------------------------
// PATCH /breach/:id
// ---------------------------------------------------------------------------

/**
 * Update a breach report's status, severity, actions, or NDPC notification flag.
 *
 * Key workflow transitions tracked here:
 *   ongoing → investigating     (DPO has begun assessment)
 *   investigating → resolved    (threat contained, remediation complete)
 *   resolved → closed           (post-incident review done, NDPC notified)
 *
 * Setting ndpcNotificationSent=true stamps ndpcNotifiedAt, fulfilling the
 * 72-hour notification requirement under NDPA Section 40.
 *
 * Body (JSON, all fields optional):
 *   status                — ongoing | investigating | resolved | closed
 *   severity              — critical | high | medium | low
 *   initialActions        — containment/remediation actions text
 *   ndpcNotificationSent  — boolean — set true once NDPC is formally notified
 *
 * Returns 200 with the updated BreachReport row.
 */
breachRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const validation = validatePatchBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed.', fields: validation.fields });
  }

  const { status, severity, initialActions, ndpcNotificationSent } = validation.body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (severity !== undefined) data.severity = severity;
  if (initialActions !== undefined) data.initialActions = initialActions;
  if (ndpcNotificationSent === true) {
    data.ndpcNotificationSent = true;
    data.ndpcNotifiedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      error:
        'At least one of status, severity, initialActions, or ndpcNotificationSent must be provided',
    });
  }

  const updated = await prisma.breachReport.update({ where: { id }, data });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'breach',
      action: 'updated',
      entityId: id,
      entityType: 'BreachReport',
      changes: data as any,
    },
  });

  return res.json(updated);
});
