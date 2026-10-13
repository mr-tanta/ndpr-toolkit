/**
 * Section 37 decision receipts.
 *
 * NDPA 2023 Section 37 gives a data subject rights in respect of decisions
 * based solely on automated processing, including profiling, that produce
 * legal or similarly significant effects. Those rights are hard to exercise
 * when the person cannot point to the decision. A decision receipt gives
 * them a handle: a short code they can quote to ask for human review,
 * express their view, or contest the outcome.
 *
 * The toolkit never chooses the legal basis for the automated decision.
 * The adopter must state it, and the record keeps it for audit.
 *
 * Pure utility, zero React. Not legal advice; have counsel review the
 * notice wording before relying on it.
 */

import type { DSRType } from '../types/dsr';

/** The grounds on which a solely automated decision may be made. Chosen by the adopter. */
export type AutomatedDecisionBasis = 'contract' | 'authorised_by_law' | 'explicit_consent';

export interface DecisionReceiptInput {
  /** Stable identifier of the model or rules engine that made the decision. */
  systemId: string;
  /** e.g. "loan_application", "cv_screening", "fraud_hold". */
  decisionType: string;
  /** Outcome as shown to the person, e.g. "declined". Not stored in the SMS text. */
  outcome: string;
  basis: AutomatedDecisionBasis;
  /** Your internal reference for the data subject. Never a NIN, BVN or phone number. */
  subjectRef: string;
  /** Epoch milliseconds. */
  decidedAt: number;
  /** Where the person can ask for review: a URL, email address or short code. */
  contestChannel: string;
  /** Organisation name shown in the notice. */
  organisation: string;
  /** Main factors in plain language, shown to the person. */
  mainFactors?: string[];
  /** Mark when the data subject may be a child (NDPA Section 31). */
  subjectMayBeChild?: boolean;
  /** Injectable ID generator for tests. Defaults to crypto.randomUUID. */
  generateId?: () => string;
}

export interface DecisionReceipt {
  receiptId: string;
  /** Eight-character code a person can read out over the phone or type into SMS. */
  shortCode: string;
  record: {
    receiptId: string;
    shortCode: string;
    systemId: string;
    decisionType: string;
    outcome: string;
    basis: AutomatedDecisionBasis;
    subjectRef: string;
    decidedAt: number;
    mainFactors: string[];
    subjectMayBeChild: boolean;
    humanReviewRequired: boolean;
  };
  notice: {
    /** Full notice for web or email. */
    long: string;
    /** SMS-length notice: code and channel only, never the outcome. */
    sms: string;
  };
  warnings: string[];
}

const BASES: AutomatedDecisionBasis[] = ['contract', 'authorised_by_law', 'explicit_consent'];
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function defaultId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (!c?.randomUUID) {
    throw new Error('crypto.randomUUID is unavailable; pass generateId.');
  }
  return c.randomUUID();
}

function fnv1a(text: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Derives an 8-character Crockford base32 code (no I, L, O or U) from the
 * receipt ID. It is a lookup handle, not a secret: always resolve it to the
 * stored record and verify the requester before acting on it.
 */
export function shortCodeFor(receiptId: string): string {
  const halves = [fnv1a(receiptId, 0x811c9dc5), fnv1a(receiptId, 0x9e3779b9)];
  let code = '';
  for (const half of halves) {
    for (let i = 0; i < 4; i += 1) code += CROCKFORD[(half >>> (i * 5)) & 31];
  }
  return code;
}

function requireText(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required.`);
  return value.trim();
}

/**
 * Issues a receipt for a solely automated decision with legal or similarly
 * significant effect. Persist `record` server-side with your audit log.
 *
 * @example
 * ```ts
 * const receipt = issueDecisionReceipt({
 *   systemId: 'credit-model-v4', decisionType: 'loan_application', outcome: 'declined',
 *   basis: 'contract', subjectRef: 'cust_812', decidedAt: Date.now(),
 *   contestChannel: 'https://lender.ng/review', organisation: 'Lender Ltd',
 * });
 * sendSms(phone, receipt.notice.sms);
 * ```
 */
export function issueDecisionReceipt(input: DecisionReceiptInput): DecisionReceipt {
  const systemId = requireText('systemId', input?.systemId);
  const decisionType = requireText('decisionType', input.decisionType);
  const outcome = requireText('outcome', input.outcome);
  const subjectRef = requireText('subjectRef', input.subjectRef);
  const contestChannel = requireText('contestChannel', input.contestChannel);
  const organisation = requireText('organisation', input.organisation);
  if (!BASES.includes(input.basis)) {
    throw new TypeError(`basis must be one of ${BASES.join(', ')}; the toolkit does not choose it for you.`);
  }
  if (!Number.isSafeInteger(input.decidedAt) || input.decidedAt <= 0) {
    throw new RangeError('decidedAt must be epoch milliseconds.');
  }
  if (/^\+?\d{10,14}$/.test(subjectRef.replace(/[\s-]/g, ''))) {
    throw new TypeError('subjectRef looks like a phone, NIN, BVN or account number; use an internal reference instead.');
  }

  const receiptId = (input.generateId ?? defaultId)();
  const shortCode = shortCodeFor(receiptId);
  const mainFactors = (input.mainFactors ?? []).map((f) => f.trim()).filter(Boolean);
  const subjectMayBeChild = input.subjectMayBeChild === true;
  const warnings: string[] = [];
  if (subjectMayBeChild) {
    warnings.push('The data subject may be a child (NDPA Section 31). Route this decision to a person before it takes effect.');
  }
  if (mainFactors.length === 0) {
    warnings.push('No main factors supplied. People can contest a decision more fairly when they know what drove it.');
  }

  const factorsText = mainFactors.length > 0 ? ` The main factors were: ${mainFactors.join('; ')}.` : '';
  const long =
    `${organisation} made this ${decisionType.replace(/_/g, ' ')} decision automatically, without a person reviewing it.` +
    factorsText +
    ` You can ask for a person to review it, give your point of view, and contest it.` +
    ` Quote code ${shortCode} at ${contestChannel}.`;
  const sms = `${organisation}: an automated decision was made about you. To ask for human review, quote ${shortCode} at ${contestChannel}`;

  return {
    receiptId,
    shortCode,
    record: {
      receiptId,
      shortCode,
      systemId,
      decisionType,
      outcome,
      basis: input.basis,
      subjectRef,
      decidedAt: input.decidedAt,
      mainFactors,
      subjectMayBeChild,
      humanReviewRequired: subjectMayBeChild,
    },
    notice: { long, sms: sms.length <= 160 ? sms : `${sms.slice(0, 157)}...` },
    warnings,
  };
}

/**
 * Seeds an `automated_decision_making` data subject request from a receipt,
 * so a contest lands in the same DSR queue as every other right. The DSR must
 * be resolved by a verified human; never close it automatically.
 */
export function decisionContestRequest(receipt: DecisionReceipt, statement?: string): {
  type: DSRType;
  description: string;
  additionalInfo: Record<string, string>;
} {
  return {
    type: 'automated_decision_making',
    description: statement?.trim() || `Request for human review of automated decision ${receipt.shortCode}.`,
    additionalInfo: {
      receiptId: receipt.receiptId,
      shortCode: receipt.shortCode,
      systemId: receipt.record.systemId,
      decisionType: receipt.record.decisionType,
    },
  };
}
