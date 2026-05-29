/**
 * Compliance Audit Returns (CAR) scheduling under the NDPC General Application
 * and Implementation Directive (GAID) 2025.
 *
 * A Data Controller/Processor of Major Importance (DCPMI) must conduct an
 * initial compliance audit within 15 months of commencing data processing, and
 * thereafter file a Compliance Audit Return with the NDPC annually (default
 * deadline 31 March, filed through the NDPC Information Management Portal/NIMP).
 *
 * This computes the schedule (initial-audit due date, the next annual filing
 * deadline relative to a reference date) and a light status. NDPC deadlines
 * shift (the 2026 filing was extended to 30 May), so the annual deadline is
 * configurable and per-year overrides are supported. The audit *content* itself
 * is the organisation's compliance posture — pair this with `getComplianceScore`.
 *
 * @see NDPC General Application and Implementation Directive (GAID) 2025
 */

import type { DCPMITier } from './dcpmi';

export interface CARInput {
  /** ISO date (YYYY-MM-DD) the organisation commenced data processing. */
  commencementDate: string;
  /** Reference date to evaluate against (YYYY-MM-DD). Defaults to today. */
  asOf?: string;
  /** DCPMI tier; CAR applies to DCPMIs only. Omit to assume applicable. */
  tier?: DCPMITier;
}

export interface CAROptions {
  /** Default annual filing deadline (month is 1-12). Defaults to 31 March. */
  annualDeadline?: { month: number; day: number };
  /** Per-year overrides for the annual deadline, e.g. `{ 2026: '2026-05-30' }`. */
  deadlineOverrides?: Record<number, string>;
  /** Months after commencement the initial audit is due. Defaults to 15. */
  initialAuditWithinMonths?: number;
}

export interface ComplianceAuditReturn {
  /** Whether CAR applies (false for non-DCPMI organisations). */
  applicable: boolean;
  schedule: {
    commencementDate: string;
    initialAuditWithinMonths: number;
    /** Commencement date + the initial-audit window. */
    initialAuditDueDate: string;
    /** The next annual filing deadline on or after `asOf`. */
    nextFilingDeadline: string;
    /** The year the next filing deadline falls in. */
    filingYear: number;
  };
  status: {
    /** Whether the initial-audit obligation has arisen (asOf ≥ due date). */
    initialAuditDue: boolean;
    /** Whole days from `asOf` to the next filing deadline. */
    daysUntilNextDeadline: number;
  };
  notes: string[];
  asOf: string;
}

const DAY_MS = 86400000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Parse a YYYY-MM-DD string into a UTC Date (timezone-safe). */
function parseUTC(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(Date.UTC(y, m - 1 + months, d)));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Derive the CAR schedule and status for a DCPMI under NDPC GAID 2025.
 */
export function generateComplianceAuditReturn(
  input: CARInput,
  options: CAROptions = {},
): ComplianceAuditReturn {
  const asOf = input.asOf ?? todayISO();
  const initialAuditWithinMonths = options.initialAuditWithinMonths ?? 15;
  const deadlineMonth = options.annualDeadline?.month ?? 3;
  const deadlineDay = options.annualDeadline?.day ?? 31;
  const overrides = options.deadlineOverrides ?? {};

  const applicable = input.tier === undefined ? true : input.tier !== 'none';

  const initialAuditDueDate = addMonthsISO(input.commencementDate, initialAuditWithinMonths);

  const deadlineFor = (year: number): string =>
    overrides[year] ?? `${year}-${pad(deadlineMonth)}-${pad(deadlineDay)}`;

  let filingYear = Number(asOf.slice(0, 4));
  let nextFilingDeadline = deadlineFor(filingYear);
  if (asOf > nextFilingDeadline) {
    filingYear += 1;
    nextFilingDeadline = deadlineFor(filingYear);
  }

  const daysUntilNextDeadline = Math.round(
    (parseUTC(nextFilingDeadline).getTime() - parseUTC(asOf).getTime()) / DAY_MS,
  );

  const initialAuditDue = asOf >= initialAuditDueDate;

  const notes: string[] = [];
  if (!applicable) {
    notes.push('Compliance Audit Returns apply only to Data Controllers/Processors of Major Importance.');
  } else {
    notes.push(
      'File the Compliance Audit Return with the NDPC via the NDPC Information Management Portal (NIMP).',
    );
    if (initialAuditDue) {
      notes.push('The initial compliance-audit window has elapsed — ensure the initial audit has been conducted.');
    }
  }
  notes.push(
    'Filing deadlines follow the NDPC GAID 2025 baseline and can be extended — verify the current deadline with the NDPC.',
  );

  return {
    applicable,
    schedule: {
      commencementDate: input.commencementDate,
      initialAuditWithinMonths,
      initialAuditDueDate,
      nextFilingDeadline,
      filingYear,
    },
    status: { initialAuditDue, daysUntilNextDeadline },
    notes,
    asOf,
  };
}
