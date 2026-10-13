/**
 * Derived data-subject estimator for DCPMI self-classification.
 *
 * Organisations usually count only their customers when they estimate the
 * number of data subjects for NDPC GAID 2025 DCPMI classification. Many also
 * hold personal data about people who never signed up: next of kin,
 * guarantors, referees, dependants, emergency contacts, and phone contacts
 * uploaded by users. This module estimates that second population and shows
 * the declared tier beside the derived tier.
 *
 * It never blends the two counts into one answer. Whether derived subjects
 * count toward a DCPMI threshold is a question for the NDPC and counsel; this
 * module surfaces the exposure so that conversation happens with numbers.
 *
 * Pure utility, zero React. Not legal advice.
 */

import { classifyDCPMI } from './dcpmi';
import type { DCPMIClassification, DCPMIClassificationOptions } from './dcpmi';

export type DerivedRelationshipKind =
  | 'next_of_kin'
  | 'guarantor'
  | 'referee'
  | 'dependant'
  | 'beneficiary'
  | 'emergency_contact'
  | 'uploaded_contact'
  | 'other';

export interface DerivedRelationshipInput {
  kind: DerivedRelationshipKind;
  /** Human label, e.g. "Loan guarantors". Defaults to the kind. */
  label?: string;
  /**
   * Average number of people of this kind recorded per direct subject who
   * provides them. Required: there is no defensible default, so the caller
   * must supply the figure from their own data.
   */
  perDirectSubject: number;
  /** Optional low and high bounds for perDirectSubject, for a range estimate. */
  range?: { low: number; high: number };
  /**
   * Share of direct subjects (0 to 1) for whom this relationship is collected.
   * Defaults to 1 (collected for every direct subject).
   */
  coverage?: number;
  /** Set when this relationship can include children (NDPA Section 31). */
  mayIncludeChildren?: boolean;
}

export interface DerivedDataSubjectsInput {
  /** Direct data subjects in the six-month GAID window (customers, users, staff). */
  directSubjects: number;
  relationships: DerivedRelationshipInput[];
  /**
   * Share (0 to 1) of derived records estimated to duplicate someone already
   * counted (two borrowers naming the same guarantor, a contact who is also a
   * customer). Defaults to 0, which overstates rather than understates.
   */
  overlapShare?: number;
}

export interface DerivedRelationshipEstimate {
  kind: DerivedRelationshipKind;
  label: string;
  estimated: number;
  low: number;
  high: number;
  mayIncludeChildren: boolean;
}

export interface DerivedDataSubjectsEstimate {
  direct: number;
  relationships: DerivedRelationshipEstimate[];
  /** Third-party subjects after the overlap share is removed. */
  derived: { estimated: number; low: number; high: number };
  /** Direct plus derived. Shown separately; never substituted for `direct`. */
  directPlusDerived: { estimated: number; low: number; high: number };
  tiers: {
    declared: DCPMIClassification;
    withDerived: DCPMIClassification;
    withDerivedHigh: DCPMIClassification;
    /** True when counting derived subjects would move the organisation to a different tier. */
    changes: boolean;
  };
  /**
   * People whose data you hold but who never dealt with you directly. Each is
   * someone your privacy information and data subject request process must
   * still reach.
   */
  thirdPartySubjectsToReach: number;
  childrenMayBeInvolved: boolean;
  notes: string[];
  advisoryNotice: string;
}

const KIND_LABELS: Record<DerivedRelationshipKind, string> = {
  next_of_kin: 'Next of kin',
  guarantor: 'Guarantors',
  referee: 'Referees',
  dependant: 'Dependants',
  beneficiary: 'Beneficiaries',
  emergency_contact: 'Emergency contacts',
  uploaded_contact: 'Uploaded phone contacts',
  other: 'Other third parties',
};

export const DERIVED_SUBJECTS_ADVISORY =
  'Derived subjects are an exposure estimate, not a classification. Whether they count toward a DCPMI ' +
  'threshold is for the NDPC and your counsel to determine. Report direct and derived counts separately.';

function assertCount(name: string, value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number.`);
  }
  return value;
}

function assertShare(name: string, value: unknown): number {
  const n = assertCount(name, value);
  if (n > 1) throw new RangeError(`${name} must be between 0 and 1.`);
  return n;
}

/**
 * Estimates third-party data subjects and compares the declared DCPMI tier
 * with the tier the organisation would reach if they were counted.
 *
 * @example
 * ```ts
 * const r = estimateDerivedDataSubjects({
 *   directSubjects: 900,
 *   relationships: [
 *     { kind: 'guarantor', perDirectSubject: 2, coverage: 0.6 },
 *     { kind: 'uploaded_contact', perDirectSubject: 150, range: { low: 50, high: 400 }, coverage: 0.3 },
 *   ],
 *   overlapShare: 0.1,
 * });
 * r.tiers.declared.tier;    // 'OHL'
 * r.tiers.withDerived.tier; // 'UHL'
 * ```
 */
export function estimateDerivedDataSubjects(
  input: DerivedDataSubjectsInput,
  options: DCPMIClassificationOptions = {},
): DerivedDataSubjectsEstimate {
  const direct = Math.floor(assertCount('directSubjects', input?.directSubjects));
  if (!Array.isArray(input.relationships)) {
    throw new TypeError('relationships must be an array.');
  }
  const overlap = input.overlapShare === undefined ? 0 : assertShare('overlapShare', input.overlapShare);

  const relationships: DerivedRelationshipEstimate[] = input.relationships.map((rel, index) => {
    const path = `relationships[${index}]`;
    if (!rel || !(rel.kind in KIND_LABELS)) {
      throw new TypeError(`${path}.kind must be one of ${Object.keys(KIND_LABELS).join(', ')}.`);
    }
    const per = assertCount(`${path}.perDirectSubject`, rel.perDirectSubject);
    const coverage = rel.coverage === undefined ? 1 : assertShare(`${path}.coverage`, rel.coverage);
    const lowPer = rel.range ? assertCount(`${path}.range.low`, rel.range.low) : per;
    const highPer = rel.range ? assertCount(`${path}.range.high`, rel.range.high) : per;
    if (lowPer > per || per > highPer) {
      throw new RangeError(`${path}.range must satisfy low <= perDirectSubject <= high.`);
    }
    const base = direct * coverage;
    return {
      kind: rel.kind,
      label: rel.label?.trim() || KIND_LABELS[rel.kind],
      estimated: Math.round(base * per),
      low: Math.round(base * lowPer),
      high: Math.round(base * highPer),
      mayIncludeChildren: rel.mayIncludeChildren === true,
    };
  });

  const sum = (key: 'estimated' | 'low' | 'high') =>
    Math.round(relationships.reduce((total, r) => total + r[key], 0) * (1 - overlap));
  const derived = { estimated: sum('estimated'), low: sum('low'), high: sum('high') };
  const directPlusDerived = {
    estimated: direct + derived.estimated,
    low: direct + derived.low,
    high: direct + derived.high,
  };

  const declared = classifyDCPMI({ dataSubjectsInSixMonths: direct }, options);
  const withDerived = classifyDCPMI({ dataSubjectsInSixMonths: directPlusDerived.estimated }, options);
  const withDerivedHigh = classifyDCPMI({ dataSubjectsInSixMonths: directPlusDerived.high }, options);
  const changes = declared.tier !== withDerived.tier;
  const childrenMayBeInvolved = relationships.some((r) => r.mayIncludeChildren);

  const notes: string[] = [];
  if (changes) {
    notes.push(
      `Counting third-party subjects moves the estimate from ${declared.tier} to ${withDerived.tier}. ` +
        'Raise this with your DPO and counsel before filing; do not change your declared tier on this estimate alone.',
    );
  }
  if (derived.estimated > 0) {
    notes.push(
      `About ${derived.estimated.toLocaleString('en-NG')} people have data in your systems without dealing with you directly. ` +
        'Check how your Section 27 privacy information reaches them and how they can make a data subject request.',
    );
  }
  if (childrenMayBeInvolved) {
    notes.push('Some relationships may include children. NDPA Section 31 applies; review consent and safeguards for those records.');
  }
  if (relationships.some((r) => r.kind === 'uploaded_contact')) {
    notes.push(
      'Uploaded phone contacts are data about people who never agreed to share it with you. Confirm you have a lawful basis under Section 25 before keeping them.',
    );
  }

  return {
    direct,
    relationships,
    derived,
    directPlusDerived,
    tiers: { declared, withDerived, withDerivedHigh, changes },
    thirdPartySubjectsToReach: derived.estimated,
    childrenMayBeInvolved,
    notes,
    advisoryNotice: DERIVED_SUBJECTS_ADVISORY,
  };
}
