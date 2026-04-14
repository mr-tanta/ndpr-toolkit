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

const prisma = new PrismaClient();
export const breachRouter = Router();

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
  } = req.body;

  if (!title || !description || !category || !discoveredAt || !reporterName || !reporterEmail) {
    return res.status(400).json({
      error:
        'title, description, category, discoveredAt, reporterName, and reporterEmail are required',
    });
  }

  if (!Array.isArray(affectedSystems) || !Array.isArray(dataTypes)) {
    return res.status(400).json({
      error: 'affectedSystems and dataTypes must be arrays',
    });
  }

  const severity = calculateSeverity(category, estimatedAffected);

  const report = await prisma.breachReport.create({
    data: {
      title,
      description,
      category,
      severity,
      status: 'ongoing',
      discoveredAt: new Date(discoveredAt),
      occurredAt: occurredAt ? new Date(occurredAt) : null,
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

  return res.status(201).json(report);
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

  return res.json(report);
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
  const { status, severity, initialActions, ndpcNotificationSent } = req.body;

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
