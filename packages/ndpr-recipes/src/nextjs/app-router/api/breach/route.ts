/**
 * Next.js App Router — Breach Notification List/Create Route
 *
 * Handles listing and creating data breach reports as required by NDPA
 * Section 40, which mandates that controllers notify the NDPC within 72 hours
 * of discovering a breach that poses a risk to data subject rights and freedoms.
 *
 * Endpoints
 * ---------
 *   GET  /api/breach       — List breach reports (optional ?status= filter)
 *   POST /api/breach       — Create a new breach report
 *
 * How to use
 * ----------
 * Copy this file to `app/api/breach/route.ts` in your Next.js project.
 * For single-report operations see `app/api/breach/[id]/route.ts`.
 *
 * @module breach/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Severity auto-calculation helper
// ---------------------------------------------------------------------------

/**
 * Derive an initial severity rating from the breach category and the number
 * of estimated affected subjects. This is a heuristic — the DPO should review
 * and adjust before the NDPC notification is sent.
 *
 * @param category          - Breach category string (e.g. 'unauthorized_access')
 * @param estimatedAffected - Approximate number of affected data subjects
 * @returns 'critical' | 'high' | 'medium' | 'low'
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
// GET /api/breach?status=ongoing
// ---------------------------------------------------------------------------

/**
 * List all breach reports, optionally filtered by status.
 *
 * Supports the DPO dashboard view. Returns reports ordered by reportedAt
 * descending so the most recent (and likely most urgent) items appear first.
 * Combine with the ?status=ongoing filter to see active incidents.
 *
 * Query params:
 *   status (optional) — ongoing | investigating | resolved | closed
 *
 * Returns 200 with an array of BreachReport rows.
 */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');

  const reports = await prisma.breachReport.findMany({
    where: status ? { status } : undefined,
    orderBy: { reportedAt: 'desc' },
  });

  return NextResponse.json(reports);
}

// ---------------------------------------------------------------------------
// POST /api/breach
// ---------------------------------------------------------------------------

/**
 * Create a new data breach report.
 *
 * The NDPA Section 40 72-hour notification window begins from the moment a
 * breach is discovered. This endpoint captures the initial report and
 * auto-calculates an initial severity so the DPO can prioritise accordingly.
 *
 * Body (JSON):
 *   title                (required) — short descriptive title
 *   description          (required) — detailed description of the incident
 *   category             (required) — breach category (e.g. 'unauthorized_access')
 *   discoveredAt         (required) — ISO timestamp when breach was discovered
 *   reporterName         (required) — name of the person filing the report
 *   reporterEmail        (required) — reporter's email address
 *   affectedSystems      (required) — array of system/service names affected
 *   dataTypes            (required) — array of data type labels (e.g. ['PII', 'Financial'])
 *   reporterDepartment   (optional) — reporter's department
 *   occurredAt           (optional) — ISO timestamp when breach occurred (if known)
 *   estimatedAffected    (optional) — approximate number of affected data subjects
 *   initialActions       (optional) — immediate containment actions already taken
 *
 * Returns 201 with the newly created BreachReport row including auto-severity.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
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
  } = body;

  if (!title || !description || !category || !discoveredAt || !reporterName || !reporterEmail) {
    return NextResponse.json(
      {
        error:
          'title, description, category, discoveredAt, reporterName, and reporterEmail are required',
      },
      { status: 400 },
    );
  }

  if (!Array.isArray(affectedSystems) || !Array.isArray(dataTypes)) {
    return NextResponse.json(
      { error: 'affectedSystems and dataTypes must be arrays' },
      { status: 400 },
    );
  }

  // Auto-calculate severity from category and scale of impact.
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

  // Audit log — breach report creation is a high-significance event.
  await prisma.complianceAuditLog.create({
    data: {
      module: 'breach',
      action: 'reported',
      entityId: report.id,
      entityType: 'BreachReport',
      changes: { title, category, severity, status: 'ongoing' },
    },
  });

  return NextResponse.json(report, { status: 201 });
}
