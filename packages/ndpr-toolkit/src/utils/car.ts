/**
 * Compliance Audit Returns (CAR) scheduling under the NDPC GAID 2025.
 *
 * The result separates future scheduling from missed-filing evidence and
 * records the exact ruleset used. Deadlines remain configurable because the
 * Commission can extend them.
 */

import type { DCPMITier } from './dcpmi';

export interface CARFilingEvidence {
  year: number;
  filedAt: string;
  referenceNumber?: string;
  acknowledgedAt?: string;
}

export interface CARInput {
  commencementDate: string;
  asOf?: string;
  tier?: DCPMITier;
  /** Evidence that the initial audit was actually completed. */
  initialAuditCompletedAt?: string;
  /** Annual filing evidence, keyed by each return's filing year. */
  filings?: CARFilingEvidence[];
}

export interface CAROptions {
  annualDeadline?: { month: number; day: number };
  deadlineOverrides?: Record<number, string>;
  initialAuditWithinMonths?: number;
  rulesetId?: string;
  rulesetVersion?: string;
  rulesetEffectiveDate?: string;
}

export type CARAnnualFilingStatus = 'not-applicable' | 'pending' | 'due-soon' | 'filed' | 'overdue';

export interface ComplianceAuditReturn {
  applicable: boolean;
  schedule: {
    commencementDate: string;
    initialAuditWithinMonths: number;
    initialAuditDueDate: string;
    /** Current calendar year's configured deadline, even when it has passed. */
    currentFilingDeadline: string;
    /** Next future, unfiled deadline on or after `asOf`. */
    nextFilingDeadline: string;
    filingYear: number;
    firstFilingYear: number;
  };
  status: {
    initialAuditDue: boolean;
    initialAuditCompleted: boolean;
    initialAuditOverdue: boolean;
    daysUntilNextDeadline: number;
    annualFiling: CARAnnualFilingStatus;
    currentFilingFiled: boolean;
    missedFilingYears: number[];
  };
  evidence: {
    initialAuditCompletedAt?: string;
    filings: CARFilingEvidence[];
  };
  provenance: {
    rulesetId: string;
    rulesetVersion: string;
    rulesetEffectiveDate: string;
    annualDeadline: { month: number; day: number };
    deadlineOverrides: Record<number, string>;
    initialAuditWithinMonths: number;
  };
  notes: string[];
  asOf: string;
}

const DAY_MS = 86_400_000;
const CAR_TIERS = new Set<DCPMITier>(['UHL', 'EHL', 'OHL', 'listed', 'none']);
export const DEFAULT_CAR_RULESET = {
  id: 'ndpc-gaid-2025-car',
  version: '2026.05-extension',
  effectiveDate: '2026-05-01',
} as const;

/** Repository-reviewed deadline extensions included in the default snapshot. */
export const DEFAULT_CAR_DEADLINE_OVERRIDES: Record<number, string> = {
  2026: '2026-05-30',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseISO(iso: string, label: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new RangeError(`${label} must use YYYY-MM-DD format.`);
  }
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (toISO(date) !== iso) throw new RangeError(`${label} must be a real calendar date.`);
  return date;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Add calendar months while clamping month-end dates (31 Jan + 1 month = 28/29 Feb). */
function addMonthsISO(iso: string, months: number): string {
  const source = parseISO(iso, 'commencementDate');
  const targetMonthIndex = source.getUTCMonth() + months;
  const targetYear = source.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12 + 1;
  const targetDay = Math.min(source.getUTCDate(), daysInMonth(targetYear, targetMonth));
  return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function validateDeadlineOverrides(value: unknown): Record<number, string> {
  if (value === undefined) return Object.create(null) as Record<number, string>;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('deadlineOverrides must be a plain object keyed by canonical four-digit years.');
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('deadlineOverrides must be a plain object or null-prototype record.');
  }

  const validated = Object.create(null) as Record<number, string>;
  for (const key of Reflect.ownKeys(value)) {
    const yearText = typeof key === 'string' ? key : String(key);
    const path = `deadlineOverrides.${yearText}`;
    if (typeof key !== 'string' || !/^\d{4}$/.test(key)) {
      throw new RangeError(`${path} key must be a canonical four-digit year from 2000 to 9999.`);
    }
    const year = Number(key);
    if (year < 2000 || year > 9999) {
      throw new RangeError(`${path} key must be a canonical four-digit year from 2000 to 9999.`);
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError(`${path} must be an enumerable data property.`);
    }
    if (typeof descriptor.value !== 'string') {
      throw new TypeError(`${path} must be a YYYY-MM-DD string.`);
    }
    parseISO(descriptor.value, path);
    if (descriptor.value.slice(0, 4) !== key) {
      throw new RangeError(`${path} must fall within year ${key}.`);
    }
    validated[year] = descriptor.value;
  }
  return validated;
}

function copyPlainDataProperties(
  value: unknown,
  label: string,
  allowedKeys: ReadonlySet<string>,
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain object or null-prototype record.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain object or null-prototype record.`);
  }
  const copy = Object.create(null) as Record<string, unknown>;
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !allowedKeys.has(key)) {
      throw new TypeError(`${label}.${String(key)} is not a supported option.`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError(`${label}.${key} must be an enumerable data property.`);
    }
    copy[key] = descriptor.value;
  }
  return copy;
}

function validateOptions(options: CAROptions): {
  annualDeadline: { month: number; day: number };
  initialAuditWithinMonths: number;
  deadlineOverrides: Record<number, string>;
  rulesetId: string;
  rulesetVersion: string;
  rulesetEffectiveDate: string;
} {
  const values = copyPlainDataProperties(options, 'options', new Set([
    'annualDeadline',
    'deadlineOverrides',
    'initialAuditWithinMonths',
    'rulesetId',
    'rulesetVersion',
    'rulesetEffectiveDate',
  ]));
  const annualDeadline = values.annualDeadline === undefined
    ? { month: 3, day: 31 }
    : copyPlainDataProperties(
        values.annualDeadline,
        'annualDeadline',
        new Set(['month', 'day']),
      );
  if (!Number.isInteger(annualDeadline.month) || (annualDeadline.month as number) < 1 || (annualDeadline.month as number) > 12) {
    throw new RangeError('annualDeadline.month must be an integer from 1 to 12.');
  }
  if (!Number.isInteger(annualDeadline.day) || (annualDeadline.day as number) < 1 || (annualDeadline.day as number) > 31) {
    throw new RangeError('annualDeadline.day must be an integer from 1 to 31.');
  }
  const initialAuditWithinMonths = values.initialAuditWithinMonths ?? 15;
  if (!Number.isInteger(initialAuditWithinMonths) || (initialAuditWithinMonths as number) <= 0) {
    throw new RangeError('initialAuditWithinMonths must be a positive integer.');
  }
  const suppliedDeadlineOverrides = validateDeadlineOverrides(values.deadlineOverrides);
  const deadlineOverrides = Object.assign(
    Object.create(null) as Record<number, string>,
    DEFAULT_CAR_DEADLINE_OVERRIDES,
    suppliedDeadlineOverrides,
  );
  for (const [label, value] of [
    ['rulesetId', values.rulesetId],
    ['rulesetVersion', values.rulesetVersion],
  ] as const) {
    if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0)) {
      throw new TypeError(`${label} must be a non-empty string.`);
    }
  }
  if (values.rulesetEffectiveDate !== undefined) {
    if (typeof values.rulesetEffectiveDate !== 'string') {
      throw new TypeError('rulesetEffectiveDate must be a YYYY-MM-DD string.');
    }
    parseISO(values.rulesetEffectiveDate, 'rulesetEffectiveDate');
  }
  return {
    annualDeadline: annualDeadline as { month: number; day: number },
    initialAuditWithinMonths: initialAuditWithinMonths as number,
    deadlineOverrides,
    rulesetId: (values.rulesetId as string | undefined) ?? DEFAULT_CAR_RULESET.id,
    rulesetVersion: (values.rulesetVersion as string | undefined) ?? DEFAULT_CAR_RULESET.version,
    rulesetEffectiveDate:
      (values.rulesetEffectiveDate as string | undefined) ?? DEFAULT_CAR_RULESET.effectiveDate,
  };
}

export function generateComplianceAuditReturn(
  input: CARInput,
  options: CAROptions = {},
): ComplianceAuditReturn {
  const {
    annualDeadline,
    initialAuditWithinMonths,
    deadlineOverrides,
    rulesetId,
    rulesetVersion,
    rulesetEffectiveDate,
  } = validateOptions(options);
  const asOf = input.asOf ?? todayISO();
  const asOfDate = parseISO(asOf, 'asOf');
  parseISO(input.commencementDate, 'commencementDate');

  if (input.tier !== undefined && !CAR_TIERS.has(input.tier)) {
    throw new RangeError('tier must be UHL, EHL, OHL, listed, or none.');
  }
  if (input.initialAuditCompletedAt) {
    parseISO(input.initialAuditCompletedAt, 'initialAuditCompletedAt');
    if (input.initialAuditCompletedAt < input.commencementDate) {
      throw new RangeError('initialAuditCompletedAt must not be earlier than commencementDate.');
    }
    if (input.initialAuditCompletedAt > asOf) {
      throw new RangeError('initialAuditCompletedAt must not be later than asOf.');
    }
  }
  const filings = [...(input.filings ?? [])].map((filing, index) => {
    if (!Number.isInteger(filing.year) || filing.year < 2000 || filing.year > 9999) {
      throw new RangeError(`filings.${index}.year must be a four-digit year.`);
    }
    parseISO(filing.filedAt, `filings.${index}.filedAt`);
    if (filing.filedAt < input.commencementDate) {
      throw new RangeError(`filings.${index}.filedAt must not be earlier than commencementDate.`);
    }
    if (filing.filedAt > asOf) {
      throw new RangeError(`filings.${index}.filedAt must not be later than asOf.`);
    }
    if (filing.referenceNumber !== undefined && filing.referenceNumber.trim().length === 0) {
      throw new RangeError(`filings.${index}.referenceNumber must be a non-empty string when provided.`);
    }
    if (filing.acknowledgedAt) {
      parseISO(filing.acknowledgedAt, `filings.${index}.acknowledgedAt`);
      if (filing.acknowledgedAt < filing.filedAt) {
        throw new RangeError(`filings.${index}.acknowledgedAt must not be earlier than filedAt.`);
      }
      if (filing.acknowledgedAt > asOf) {
        throw new RangeError(`filings.${index}.acknowledgedAt must not be later than asOf.`);
      }
    }
    return { ...filing };
  });
  const duplicateYears = filings.filter((filing, index) => filings.findIndex((item) => item.year === filing.year) !== index);
  if (duplicateYears.length > 0) throw new RangeError('filings must contain at most one evidence record per year.');

  const applicable = input.tier === undefined || input.tier === 'UHL' || input.tier === 'EHL';
  const initialAuditDueDate = addMonthsISO(input.commencementDate, initialAuditWithinMonths);
  const initialAuditCompleted = Boolean(
    input.initialAuditCompletedAt && input.initialAuditCompletedAt <= asOf,
  );
  const initialAuditDue = asOf >= initialAuditDueDate;
  const initialAuditOverdue = applicable && initialAuditDue && !initialAuditCompleted;

  const deadlineFor = (year: number): string => {
    if (deadlineOverrides[year]) return deadlineOverrides[year];
    const day = Math.min(annualDeadline.day, daysInMonth(year, annualDeadline.month));
    return `${year}-${pad(annualDeadline.month)}-${pad(day)}`;
  };

  const initialYear = Number(initialAuditDueDate.slice(0, 4));
  const firstFilingYear = initialAuditDueDate <= deadlineFor(initialYear) ? initialYear : initialYear + 1;
  const prematureFiling = filings.find((filing) => filing.year < firstFilingYear);
  if (prematureFiling) {
    throw new RangeError(`filings year ${prematureFiling.year} is earlier than first filing year ${firstFilingYear}.`);
  }
  const currentYear = asOfDate.getUTCFullYear();
  const currentFilingDeadline = deadlineFor(currentYear);
  const filingForCurrentYear = filings.find((filing) => filing.year === currentYear && filing.filedAt <= asOf);

  const missedFilingYears: number[] = [];
  if (applicable) {
    for (let year = firstFilingYear; year <= currentYear; year += 1) {
      const deadline = deadlineFor(year);
      const filed = filings.some((filing) => filing.year === year && filing.filedAt <= asOf);
      if (deadline < asOf && !filed) missedFilingYears.push(year);
    }
  }

  let filingYear = Math.max(currentYear, firstFilingYear);
  while (
    deadlineFor(filingYear) < asOf ||
    filings.some((filing) => filing.year === filingYear && filing.filedAt <= asOf)
  ) {
    filingYear += 1;
  }
  const nextFilingDeadline = deadlineFor(filingYear);
  const daysUntilNextDeadline = Math.round(
    (parseISO(nextFilingDeadline, 'nextFilingDeadline').getTime() - asOfDate.getTime()) / DAY_MS,
  );

  const daysUntilCurrentDeadline = Math.round(
    (parseISO(currentFilingDeadline, 'currentFilingDeadline').getTime() - asOfDate.getTime()) / DAY_MS,
  );
  let annualFiling: CARAnnualFilingStatus;
  if (!applicable || currentYear < firstFilingYear) annualFiling = 'not-applicable';
  else if (filingForCurrentYear) annualFiling = 'filed';
  else if (asOf > currentFilingDeadline) annualFiling = 'overdue';
  else if (daysUntilCurrentDeadline <= 30) annualFiling = 'due-soon';
  else annualFiling = 'pending';

  const notes: string[] = [];
  if (!applicable) {
    notes.push(
      input.tier === 'OHL'
        ? 'Under this ruleset, OHL organisations renew registration annually and do not file CAR.'
        : 'CAR applies to UHL/EHL classifications under this ruleset.',
    );
  } else {
    notes.push('File applicable returns through the current NDPC filing channel (including NIMP where applicable) and retain acknowledgement evidence.');
    if (initialAuditOverdue) notes.push('No initial-audit completion evidence was supplied after the due date.');
    if (missedFilingYears.length > 0) notes.push(`No filing evidence was supplied for: ${missedFilingYears.join(', ')}.`);
  }
  notes.push('GAID deadlines use the recorded ruleset snapshot and may be extended; verify current NDPC guidance.');

  return {
    applicable,
    schedule: {
      commencementDate: input.commencementDate,
      initialAuditWithinMonths,
      initialAuditDueDate,
      currentFilingDeadline,
      nextFilingDeadline,
      filingYear,
      firstFilingYear,
    },
    status: {
      initialAuditDue,
      initialAuditCompleted,
      initialAuditOverdue,
      daysUntilNextDeadline,
      annualFiling,
      currentFilingFiled: Boolean(filingForCurrentYear),
      missedFilingYears,
    },
    evidence: {
      initialAuditCompletedAt: input.initialAuditCompletedAt,
      filings,
    },
    provenance: {
      rulesetId,
      rulesetVersion,
      rulesetEffectiveDate,
      annualDeadline: { ...annualDeadline },
      deadlineOverrides: { ...deadlineOverrides },
      initialAuditWithinMonths,
    },
    notes,
    asOf,
  };
}
