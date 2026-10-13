/**
 * The collision engine: NDPA data subject rights against other Nigerian
 * statutes that require data to be kept, collected or not erased.
 *
 * A bank that receives an erasure request for a customer with an active loan
 * cannot simply delete. Anti-money-laundering, cybercrime, tax and sector
 * rules impose retention floors that interact with NDPA Section 34. Today
 * those refusals are written as free text. This module types them:
 *
 * - A register of rows, each citing an instrument and provision, with a
 *   review status. Only rows a named reviewer has signed (`reviewed`) can
 *   produce a hold. `unverified` rows can only route a category to human
 *   review, citing the row as a candidate ground.
 * - `resolveDsrOutcome` partitions a request's data categories into act now,
 *   hold until a date, and needs human review, and drafts the letter. Every
 *   outcome is a draft that requires a named reviewer before it is sent.
 * - `planRetention` computes per-record retention decisions. It never deletes.
 *
 * The register records that a statute *interacts with* a right. It never
 * asserts that the statute overrides the NDPA; that judgement belongs to the
 * reviewer. Pure utility, zero React. Not legal advice.
 */

import type { DSRType } from '../types/dsr';

export type ExceptionObligation = 'retention_floor' | 'retention_ceiling' | 'erasure_bar' | 'collection_mandate';
export type ExceptionReviewStatus = 'unverified' | 'reviewed';
export type RetentionTrigger = 'collection' | 'transaction' | 'relationship_end';
export type CollidingRight = Extract<DSRType, 'erasure' | 'restriction' | 'objection' | 'rectification' | 'portability' | 'withdraw_consent'>;

export interface StatutoryExceptionRow {
  id: string;
  issuer: string;
  instrument: string;
  /** e.g. "s.38(1)". Use "unconfirmed" until a reviewer confirms the provision. */
  provision: string;
  obligation: ExceptionObligation;
  /** Sectors the row applies to, e.g. ["banking", "fintech"]. "*" means all. */
  sectors: string[];
  /** Data categories the row applies to, using your RoPA category names. */
  dataCategories: string[];
  /** Retention period in months, when the obligation has one. */
  durationMonths?: number;
  durationTrigger?: RetentionTrigger;
  /** Rights this obligation interacts with. */
  interactsWith: CollidingRight[];
  summary: string;
  sourceUrl?: string;
  /** Verbatim quote of the provision, once a reviewer has extracted it. */
  quote?: string;
  /** ISO date the reviewer last checked the source. */
  lastVerified?: string;
  /** Name of the lawyer, DPO or DPCO who reviewed the row. Required when reviewed. */
  reviewedBy?: string;
  reviewStatus: ExceptionReviewStatus;
  /** True when practitioners disagree about how the provision applies. */
  contested?: boolean;
}

export interface ExceptionRowError {
  rowId: string;
  field: string;
  code: string;
  message: string;
}

/**
 * Starter rows. Both are UNVERIFIED candidates: they route requests to human
 * review and never refuse on their own. A reviewer must confirm the
 * provision, add the quote and sign the row before it can produce a hold.
 */
export const STARTER_EXCEPTION_REGISTER: StatutoryExceptionRow[] = [
  {
    id: 'ng-cybercrimes-2015-traffic-data',
    issuer: 'National Assembly',
    instrument: 'Cybercrimes (Prohibition, Prevention, etc.) Act 2015',
    provision: 's.38(1)',
    obligation: 'retention_floor',
    sectors: ['telecoms', 'internet_service'],
    dataCategories: ['traffic_data', 'subscriber_information'],
    durationMonths: 24,
    durationTrigger: 'collection',
    interactsWith: ['erasure', 'restriction'],
    summary: 'Service providers keep traffic data and subscriber information for two years.',
    reviewStatus: 'unverified',
  },
  {
    id: 'ng-mlppa-2022-records',
    issuer: 'National Assembly',
    instrument: 'Money Laundering (Prevention and Prohibition) Act 2022',
    provision: 'unconfirmed',
    obligation: 'retention_floor',
    sectors: ['banking', 'fintech', 'insurance', 'gaming', 'dnfbp'],
    dataCategories: ['kyc_identity', 'transaction_records', 'account_records'],
    durationMonths: 60,
    durationTrigger: 'relationship_end',
    interactsWith: ['erasure', 'restriction'],
    summary: 'Reporting entities keep customer identification and transaction records for five years.',
    reviewStatus: 'unverified',
  },
];

const OBLIGATIONS: ExceptionObligation[] = ['retention_floor', 'retention_ceiling', 'erasure_bar', 'collection_mandate'];
const TRIGGERS: RetentionTrigger[] = ['collection', 'transaction', 'relationship_end'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Structural validation for register rows, including the review contract. */
export function validateExceptionRow(row: StatutoryExceptionRow): ExceptionRowError[] {
  const errors: ExceptionRowError[] = [];
  const id = typeof row?.id === 'string' && row.id ? row.id : '(missing id)';
  const add = (field: string, code: string, message: string) => errors.push({ rowId: id, field, code, message });
  const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

  if (!text(row?.id)) add('id', 'id_required', 'Row id is required.');
  for (const field of ['issuer', 'instrument', 'provision', 'summary'] as const) {
    if (!text(row?.[field])) add(field, `${field}_required`, `${field} is required.`);
  }
  if (!OBLIGATIONS.includes(row?.obligation)) add('obligation', 'obligation_invalid', `obligation must be one of ${OBLIGATIONS.join(', ')}.`);
  if (!Array.isArray(row?.sectors) || row.sectors.length === 0) add('sectors', 'sectors_required', 'At least one sector (or "*") is required.');
  if (!Array.isArray(row?.dataCategories) || row.dataCategories.length === 0) add('dataCategories', 'categories_required', 'At least one data category is required.');
  if (!Array.isArray(row?.interactsWith) || row.interactsWith.length === 0) add('interactsWith', 'rights_required', 'List the rights this obligation interacts with.');
  if (row?.durationMonths !== undefined) {
    if (!Number.isSafeInteger(row.durationMonths) || row.durationMonths <= 0) add('durationMonths', 'duration_invalid', 'durationMonths must be a positive integer.');
    if (!row.durationTrigger || !TRIGGERS.includes(row.durationTrigger)) add('durationTrigger', 'trigger_required', 'A duration needs a trigger.');
  }
  if (row?.reviewStatus === 'reviewed') {
    if (!text(row.reviewedBy)) add('reviewedBy', 'reviewer_required', 'A reviewed row must name its reviewer.');
    if (!text(row.quote)) add('quote', 'quote_required', 'A reviewed row must carry the verbatim provision text.');
    if (!text(row.sourceUrl)) add('sourceUrl', 'source_required', 'A reviewed row must link its source.');
    if (!row.lastVerified || !ISO_DATE.test(row.lastVerified)) add('lastVerified', 'verified_date_required', 'A reviewed row needs an ISO lastVerified date.');
    if (/unconfirmed/i.test(row.provision ?? '')) add('provision', 'provision_unconfirmed', 'Confirm the provision before marking the row reviewed.');
  } else if (row?.reviewStatus !== 'unverified') {
    add('reviewStatus', 'review_status_invalid', 'reviewStatus must be "unverified" or "reviewed".');
  }
  return errors;
}

export interface ExceptionQuery {
  sector: string;
  dataCategory?: string;
  right?: CollidingRight;
}

export function findStatutoryExceptions(register: StatutoryExceptionRow[], query: ExceptionQuery): StatutoryExceptionRow[] {
  return register.filter(
    (row) =>
      (row.sectors.includes('*') || row.sectors.includes(query.sector)) &&
      (!query.dataCategory || row.dataCategories.includes(query.dataCategory)) &&
      (!query.right || row.interactsWith.includes(query.right)),
  );
}

/** Adds whole months in UTC, clamping to the last day of the target month. */
export function addMonthsUTC(iso: string, months: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

function triggerDate(trigger: RetentionTrigger | undefined, dates: RetentionDates): string | undefined {
  if (trigger === 'relationship_end') return dates.relationshipEndedAt;
  if (trigger === 'transaction') return dates.lastTransactionAt ?? dates.collectedAt;
  return dates.collectedAt;
}

export interface RetentionDates {
  collectedAt?: string;
  lastTransactionAt?: string;
  /** Omit while the relationship (account, loan, policy) is still open. */
  relationshipEndedAt?: string;
}

export interface LegalHold {
  dataCategory: string;
  reference: string;
  /** ISO date the hold lifts. Omit for an open-ended hold. */
  until?: string;
}

export interface DsrCollisionRequest {
  id: string;
  type: DSRType;
  sector: string;
  dataCategories: string[];
  dates?: RetentionDates;
  subjectMayBeChild?: boolean;
}

export interface DsrOutcomeHold {
  dataCategory: string;
  /** ISO date the hold lifts; undefined while it cannot yet be computed. */
  until?: string;
  grounds: Array<{ rowId: string; citation: string }>;
  legalHold?: string;
}

export interface DsrOutcomeReview {
  dataCategory: string;
  reason: string;
  candidateGrounds: Array<{ rowId: string; citation: string }>;
}

export type DsrProposedOutcome = 'fulfil' | 'partially_fulfil' | 'refuse_statutory' | 'needs_human_review';

export interface DsrOutcomeDraft {
  requestId: string;
  status: 'draft';
  proposed: DsrProposedOutcome;
  actNow: string[];
  hold: DsrOutcomeHold[];
  needsHumanReview: DsrOutcomeReview[];
  letter: string[];
  /** Always true: a named DPO or reviewer must approve before anything is sent. */
  requiresSignOff: true;
  warnings: string[];
  asOf: string;
}

export interface ResolveDsrOutcomeOptions {
  register?: StatutoryExceptionRow[];
  legalHolds?: LegalHold[];
  /** ISO date for reproducible evaluation. Defaults to today (UTC). */
  asOf?: string;
  organisation?: string;
}

const COLLIDING: ReadonlySet<DSRType> = new Set(['erasure', 'restriction', 'objection', 'rectification', 'portability', 'withdraw_consent']);
const citationOf = (row: StatutoryExceptionRow) => `${row.instrument}, ${row.provision}`;

/**
 * Drafts the outcome of a data subject request where other statutes may
 * require data to be kept. The result is a draft: record the reviewer and
 * the date it was sent on your DSR record, never automatically.
 *
 * @example
 * ```ts
 * const draft = resolveDsrOutcome(
 *   { id: 'dsr_1', type: 'erasure', sector: 'banking', dataCategories: ['marketing_preferences', 'kyc_identity'] },
 *   { register: myReviewedRegister, asOf: '2026-10-13' },
 * );
 * draft.actNow;           // ['marketing_preferences']
 * draft.hold[0].grounds;  // the reviewed rows that require kyc_identity to be kept
 * ```
 */
export function resolveDsrOutcome(request: DsrCollisionRequest, options: ResolveDsrOutcomeOptions = {}): DsrOutcomeDraft {
  if (!request || typeof request.id !== 'string' || !request.id) throw new TypeError('request.id is required.');
  if (!Array.isArray(request.dataCategories)) throw new TypeError('request.dataCategories must be an array.');
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  if (!ISO_DATE.test(asOf)) throw new RangeError('asOf must be an ISO date (YYYY-MM-DD).');
  const register = options.register ?? STARTER_EXCEPTION_REGISTER;
  const invalid = register.flatMap(validateExceptionRow);
  if (invalid.length > 0) {
    throw new TypeError(`Invalid register row(s): ${invalid.map((e) => `${e.rowId}.${e.field} (${e.code})`).join(', ')}`);
  }

  const actNow: string[] = [];
  const hold: DsrOutcomeHold[] = [];
  const needsHumanReview: DsrOutcomeReview[] = [];
  const warnings: string[] = [];
  const dates = request.dates ?? {};

  if (request.subjectMayBeChild) {
    warnings.push('The data subject may be a child (NDPA Section 31). Every category goes to human review.');
  }

  for (const category of request.dataCategories) {
    if (!COLLIDING.has(request.type)) {
      actNow.push(category);
      continue;
    }
    const legal = options.legalHolds?.find((h) => h.dataCategory === category && (!h.until || h.until > asOf));
    const rows = findStatutoryExceptions(register, { sector: request.sector, dataCategory: category, right: request.type as CollidingRight });
    const reviewed = rows.filter((r) => r.reviewStatus === 'reviewed' && (r.obligation === 'retention_floor' || r.obligation === 'erasure_bar'));
    const unverified = rows.filter((r) => r.reviewStatus === 'unverified');

    if (request.subjectMayBeChild) {
      needsHumanReview.push({
        dataCategory: category,
        reason: 'possible child data subject',
        candidateGrounds: rows.map((r) => ({ rowId: r.id, citation: citationOf(r) })),
      });
      continue;
    }

    const live = reviewed
      .map((row) => {
        if (row.durationMonths === undefined) return { row, until: undefined as string | undefined, open: true };
        const start = triggerDate(row.durationTrigger, dates);
        if (!start) return { row, until: undefined, open: true }; // trigger not reached (e.g. relationship still open)
        const until = addMonthsUTC(start, row.durationMonths);
        return { row, until, open: until > asOf };
      })
      .filter((x) => x.open);

    if (live.length > 0 || legal) {
      const dated = live.map((x) => x.until).filter((u): u is string => Boolean(u));
      const indefinite = live.some((x) => !x.until) || (legal !== undefined && !legal.until);
      const latest = [...dated, ...(legal?.until ? [legal.until] : [])].sort().pop();
      hold.push({
        dataCategory: category,
        until: indefinite ? undefined : latest,
        grounds: live.map((x) => ({ rowId: x.row.id, citation: citationOf(x.row) })),
        legalHold: legal?.reference,
      });
      if (live.some((x) => x.row.contested)) {
        warnings.push(`A ground for "${category}" is marked contested; confirm with counsel before relying on it.`);
      }
      continue;
    }

    if (unverified.length > 0) {
      needsHumanReview.push({
        dataCategory: category,
        reason: 'candidate statutory ground has not been reviewed',
        candidateGrounds: unverified.map((r) => ({ rowId: r.id, citation: citationOf(r) })),
      });
      continue;
    }

    actNow.push(category);
  }

  let proposed: DsrProposedOutcome;
  if (needsHumanReview.length > 0) proposed = 'needs_human_review';
  else if (hold.length === 0) proposed = 'fulfil';
  else if (actNow.length === 0) proposed = 'refuse_statutory';
  else proposed = 'partially_fulfil';

  const org = options.organisation ?? 'We';
  const letter: string[] = [];
  if (actNow.length > 0) {
    letter.push(`${org} have acted on your ${request.type.replace(/_/g, ' ')} request for: ${actNow.join(', ')}.`);
  }
  for (const h of hold) {
    const until = h.until ? ` until ${h.until}` : ' while the obligation continues';
    const why = h.grounds.map((g) => g.citation).concat(h.legalHold ? [`legal hold ${h.legalHold}`] : []).join('; ');
    letter.push(`We must keep ${h.dataCategory}${until} because of ${why}. We will not use it for any other purpose, and we will act on your request when that period ends.`);
  }
  if (needsHumanReview.length > 0) {
    letter.push('Part of your request needs review by our Data Protection Officer. We will write to you again without unreasonable delay.');
  }
  if (hold.length > 0 || proposed === 'needs_human_review') {
    letter.push('You may lodge a complaint with the Nigeria Data Protection Commission under NDPA Section 46 if you disagree with this response.');
  }
  if (proposed === 'refuse_statutory' || proposed === 'partially_fulfil') {
    warnings.push('An automatically sent refusal can itself be an automated decision under NDPA Section 37. Have a person approve this draft.');
  }

  return { requestId: request.id, status: 'draft', proposed, actNow, hold, needsHumanReview, letter, requiresSignOff: true, warnings, asOf };
}

export interface RetentionRecord extends RetentionDates {
  id: string;
  dataCategory: string;
}

export interface RetentionPolicyEntry {
  months: number;
  trigger: RetentionTrigger;
}

export type RetentionDecision = 'retain' | 'review_for_deletion' | 'statutory_hold' | 'needs_human_review';

export interface RetentionPlanItem {
  recordId: string;
  dataCategory: string;
  decision: RetentionDecision;
  /** Date the organisation's own policy period ends, when computable. */
  policyEndsOn?: string;
  /** Latest date any reviewed statutory floor requires keeping it, when computable. */
  statutoryFloorEndsOn?: string;
  grounds: string[];
}

/**
 * Plans retention for records against your policy and the register. It
 * produces decisions only; deleting anything is your system's job, after a
 * person has reviewed the plan.
 */
export function planRetention(
  records: RetentionRecord[],
  policy: Record<string, RetentionPolicyEntry>,
  options: { sector: string; register?: StatutoryExceptionRow[]; asOf?: string },
): RetentionPlanItem[] {
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const register = options.register ?? STARTER_EXCEPTION_REGISTER;
  return records.map((record) => {
    const rows = findStatutoryExceptions(register, { sector: options.sector, dataCategory: record.dataCategory })
      .filter((r) => r.obligation === 'retention_floor' || r.obligation === 'erasure_bar');
    const entry = policy[record.dataCategory];
    const policyStart = entry ? triggerDate(entry.trigger, record) : undefined;
    const policyEndsOn = entry && policyStart ? addMonthsUTC(policyStart, entry.months) : undefined;

    const floors = rows
      .filter((r) => r.reviewStatus === 'reviewed')
      .map((r) => {
        if (r.durationMonths === undefined) return { r, end: undefined as string | undefined, open: true };
        const start = triggerDate(r.durationTrigger, record);
        if (!start) return { r, end: undefined, open: true };
        const end = addMonthsUTC(start, r.durationMonths);
        return { r, end, open: end > asOf };
      });
    const openFloors = floors.filter((f) => f.open);
    const statutoryFloorEndsOn = openFloors.some((f) => !f.end) ? undefined : openFloors.map((f) => f.end!).sort().pop();
    const base = { recordId: record.id, dataCategory: record.dataCategory, policyEndsOn, statutoryFloorEndsOn };

    if (!entry) {
      return { ...base, decision: 'needs_human_review', grounds: ['no retention policy for this category'] };
    }
    if (openFloors.length > 0) {
      return { ...base, decision: 'statutory_hold', grounds: openFloors.map((f) => citationOf(f.r)) };
    }
    if (rows.some((r) => r.reviewStatus === 'unverified') && policyEndsOn !== undefined && policyEndsOn <= asOf) {
      return { ...base, decision: 'needs_human_review', grounds: rows.filter((r) => r.reviewStatus === 'unverified').map((r) => `unreviewed: ${citationOf(r)}`) };
    }
    if (policyEndsOn === undefined) {
      return { ...base, decision: 'retain', grounds: ['policy period has not started (trigger not reached)'] };
    }
    return policyEndsOn <= asOf
      ? { ...base, decision: 'review_for_deletion', grounds: ['retention policy period has ended'] }
      : { ...base, decision: 'retain', grounds: ['within retention policy period'] };
  });
}
