/**
 * Next.js App Router — Breach Notification Single-Report Route
 *
 * Handles reading and updating individual breach reports.
 * Used by the DPO interface to track an incident through its lifecycle
 * and record the NDPC notification status as required by NDPA Section 40.
 *
 * Endpoints
 * ---------
 *   GET   /api/breach/[id]   — Fetch a single breach report by ID
 *   PATCH /api/breach/[id]   — Update breach status, severity, or add actions taken
 *
 * How to use
 * ----------
 * Copy this file to `app/api/breach/[id]/route.ts` in your Next.js project.
 *
 * @module breach/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { assessBreachNotification } from '@tantainnovative/ndpr-toolkit/server';

const prisma = new PrismaClient();

/** Next.js App Router route context — contains dynamic segment params */
interface RouteContext {
  params: { id: string };
}

/**
 * Assess a stored breach row against the NDPA S.40 / GAID 2025 Article 33(5)
 * notification content requirements, returning which mandated items are still
 * missing and how long is left on the 72-hour clock.
 *
 * Note: this recipe's `BreachReport` table is intentionally simplified, so
 * fields like likely consequences, mitigation measures, data-subject categories
 * and record count aren't persisted — they'll show as "missing" until you
 * extend the schema. Set NDPR_DPO_NAME / NDPR_DPO_EMAIL to record the contact
 * point (Art. 33(5)(h)).
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
// GET /api/breach/[id]
// ---------------------------------------------------------------------------

/**
 * Fetch a single breach report by its ID.
 *
 * Returns the full report including affected systems, data types, and the
 * NDPC notification status. Used by the incident detail page and for
 * generating the formal NDPC breach notification document.
 *
 * Path params:
 *   id (required) — the BreachReport record ID
 *
 * Returns 200 with the BreachReport row, or 404 if not found.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params;

  const report = await prisma.breachReport.findUnique({ where: { id } });

  if (!report) {
    return NextResponse.json({ error: 'Breach report not found' }, { status: 404 });
  }

  // Surface NDPC notification readiness alongside the report so the incident
  // detail view can show what's still needed before filing (GAID 2025 Art. 33).
  return NextResponse.json({ ...report, ndpcReadiness: assessReadiness(report) });
}

// ---------------------------------------------------------------------------
// PATCH /api/breach/[id]
// ---------------------------------------------------------------------------

/**
 * Update a breach report's status, severity, NDPC notification status, or
 * containment actions.
 *
 * Key workflow transitions tracked here:
 *   ongoing → investigating     (DPO has begun assessment)
 *   investigating → resolved    (threat contained, remediation complete)
 *   resolved → closed           (post-incident review done, NDPC notified)
 *
 * The ndpcNotificationSent flag and ndpcNotifiedAt timestamp are set here
 * once the formal NDPC notification has been dispatched, fulfilling the
 * 72-hour reporting obligation under NDPA Section 40.
 *
 * Body (JSON, all fields optional):
 *   status                — ongoing | investigating | resolved | closed
 *   severity              — critical | high | medium | low
 *   initialActions        — append/replace containment actions text
 *   ndpcNotificationSent  — boolean — set true once NDPC is formally notified
 *
 * Returns 200 with the updated BreachReport row.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const body = await req.json();
  const { status, severity, initialActions, ndpcNotificationSent } = body;

  const data: Record<string, unknown> = {};

  if (status !== undefined) data.status = status;
  if (severity !== undefined) data.severity = severity;
  if (initialActions !== undefined) data.initialActions = initialActions;

  // Stamp the NDPC notification timestamp when the flag is first set to true.
  if (ndpcNotificationSent === true) {
    data.ndpcNotificationSent = true;
    data.ndpcNotifiedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'At least one of status, severity, initialActions, or ndpcNotificationSent must be provided' },
      { status: 400 },
    );
  }

  const updated = await prisma.breachReport.update({ where: { id }, data });

  // Audit log — every status change on a breach is significant for compliance.
  await prisma.complianceAuditLog.create({
    data: {
      module: 'breach',
      action: 'updated',
      entityId: id,
      entityType: 'BreachReport',
      changes: data as any,
    },
  });

  return NextResponse.json(updated);
}
