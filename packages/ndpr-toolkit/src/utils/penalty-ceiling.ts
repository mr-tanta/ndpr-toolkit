/**
 * Statutory penalty ceiling under NDPA 2023 Section 48(4).
 *
 * Returns the MAXIMUM the Commission may impose, not a forecast. Section 48(4)
 * sets the ceiling as the higher of a fixed naira amount and a percentage of
 * annual gross revenue in the preceding financial year, with a higher fixed
 * amount for data controllers and processors of major importance.
 *
 * The figures are a ruleset so they can be pinned or overridden if the Act is
 * amended. Verify the current text with counsel before quoting a figure.
 * Pure utility, zero React. Not legal advice.
 */

export interface PenaltyCeilingRuleset {
  id: string;
  version: string;
  citation: string;
  majorImportance: { fixedNGN: number; revenueShare: number };
  other: { fixedNGN: number; revenueShare: number };
}

export const DEFAULT_PENALTY_CEILING_RULESET: PenaltyCeilingRuleset = {
  id: 'ndpa-2023-s48-4',
  version: '2023.06',
  citation: 'NDPA 2023 Section 48(4)',
  majorImportance: { fixedNGN: 10_000_000, revenueShare: 0.02 },
  other: { fixedNGN: 2_000_000, revenueShare: 0.02 },
};

export interface PenaltyCeilingInput {
  /** Annual gross revenue in the preceding financial year, in naira. */
  annualGrossRevenueNGN: number;
  /** Whether the organisation is a data controller or processor of major importance. */
  majorImportance: boolean;
}

export interface PenaltyCeiling {
  ceilingNGN: number;
  basis: 'fixed' | 'revenue';
  fixedNGN: number;
  revenueBasedNGN: number;
  citation: string;
  rulesetId: string;
  rulesetVersion: string;
  /** Always present: the ceiling is a maximum, not an expected fine. */
  notice: string;
}

export const PENALTY_CEILING_NOTICE =
  'This is the statutory maximum, not a prediction. The Commission considers the nature, gravity and ' +
  'duration of an infringement and any mitigation. Not legal advice.';

/**
 * @example
 * ```ts
 * estimateStatutoryCeiling({ annualGrossRevenueNGN: 2_000_000_000, majorImportance: true });
 * // { ceilingNGN: 40_000_000, basis: 'revenue', ... }
 * ```
 */
export function estimateStatutoryCeiling(
  input: PenaltyCeilingInput,
  ruleset: PenaltyCeilingRuleset = DEFAULT_PENALTY_CEILING_RULESET,
): PenaltyCeiling {
  const revenue = input?.annualGrossRevenueNGN;
  if (typeof revenue !== 'number' || !Number.isFinite(revenue) || revenue < 0) {
    throw new RangeError('annualGrossRevenueNGN must be a non-negative finite number.');
  }
  const band = input.majorImportance ? ruleset.majorImportance : ruleset.other;
  const revenueBasedNGN = Math.round(revenue * band.revenueShare);
  const basis = revenueBasedNGN > band.fixedNGN ? 'revenue' : 'fixed';
  return {
    ceilingNGN: Math.max(band.fixedNGN, revenueBasedNGN),
    basis,
    fixedNGN: band.fixedNGN,
    revenueBasedNGN,
    citation: ruleset.citation,
    rulesetId: ruleset.id,
    rulesetVersion: ruleset.version,
    notice: PENALTY_CEILING_NOTICE,
  };
}
