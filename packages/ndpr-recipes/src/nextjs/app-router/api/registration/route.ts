/**
 * Next.js App Router — DCPMI Registration & Compliance Audit Return Route
 *
 * Surfaces an organisation's NDPC GAID 2025 obligations:
 *   - DCPMI tier (UHL / EHL / OHL / listed / none) and annual registration fee,
 *     derived from the number of data subjects processed in a six-month window.
 *   - The Compliance Audit Return (CAR) schedule — initial-audit due date and the
 *     next annual filing deadline — for UHL/EHL controllers that must file.
 *
 * Both are pure computations from the toolkit's React-free `/server` entry, so
 * this route needs no database. Feed it numbers from your own org profile.
 *
 * Endpoints
 * ---------
 *   GET /api/registration?dataSubjects=6200&commencementDate=2025-01-15
 *       — classify the tier and (when applicable) compute the CAR schedule.
 *
 * How to use
 * ----------
 * Copy this file to `app/api/registration/route.ts`. Replace the query-param
 * inputs with values read from your settings/database as appropriate.
 *
 * @module registration/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  classifyDCPMI,
  generateComplianceAuditReturn,
} from '@tantainnovative/ndpr-toolkit/server';

// GET /api/registration?dataSubjects=6200&commencementDate=2025-01-15&asOf=2026-06-01
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const dataSubjects = Number(sp.get('dataSubjects') ?? '0');
  const isDesignated = sp.get('designated') === 'true';
  const commencementDate = sp.get('commencementDate') ?? undefined;
  const asOf = sp.get('asOf') ?? undefined;

  if (!Number.isFinite(dataSubjects) || dataSubjects < 0) {
    return NextResponse.json(
      { error: 'dataSubjects must be a non-negative number' },
      { status: 400 },
    );
  }

  const classification = classifyDCPMI({
    dataSubjectsInSixMonths: dataSubjects,
    isDesignated,
  });

  // The CAR schedule only makes sense once we know when processing commenced.
  // UHL/EHL controllers must file annually; OHL renews registration instead and
  // non-DCPMIs have no CAR obligation — the toolkit reflects that in `applicable`.
  const auditReturn = commencementDate
    ? generateComplianceAuditReturn({
        commencementDate,
        tier: classification.tier,
        asOf,
      })
    : null;

  return NextResponse.json({
    classification,
    auditReturn,
    asOf: asOf ?? new Date().toISOString().slice(0, 10),
  });
}
