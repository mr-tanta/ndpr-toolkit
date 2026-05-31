/**
 * Data Controller/Processor of Major Importance (DCPMI) classification under the
 * NDPC General Application and Implementation Directive (GAID) 2025.
 *
 * Volume-based tiers — data subjects processed within a six-month window:
 *   - UHL (Ultra High Level):    more than 5,000  → ₦250,000 / year
 *   - EHL (Extra High Level):    1,000 – 5,000    → ₦100,000 / year
 *   - OHL (Ordinary High Level): 200 – 999        → ₦10,000  / year
 *   - below 200:                 not a DCPMI by volume
 *
 * Boundaries: the 1,000 mark resolves to EHL (so OHL is 200–999); UHL is
 * strictly greater than 5,000 (so 5,000 itself is EHL). The NDPC has revised
 * classification metrics before and shifts filing deadlines, so thresholds and
 * fees are configurable — treat the defaults as the September 2025 GAID
 * baseline, not a constant.
 *
 * `isDesignated` marks an organisation the Commission has otherwise listed as a
 * DCPMI; it is then a DCPMI regardless of volume. Below the volume tiers such an
 * organisation is reported as `'listed'` with the fee left at 0 and a note to
 * confirm the applicable tier/fee with the NDPC.
 *
 * @see NDPC General Application and Implementation Directive (GAID) 2025
 * @see NDPC Guidance Notice on the Registration of Data Controllers and Processors of Major Importance
 */

export type DCPMITier = 'UHL' | 'EHL' | 'OHL' | 'listed' | 'none';

export interface DCPMIInput {
  /** Distinct data subjects whose data was processed in the relevant six-month window. */
  dataSubjectsInSixMonths?: number;
  /** True if the Commission has separately designated/listed the organisation as a DCPMI. */
  isDesignated?: boolean;
}

export interface DCPMIThresholds {
  /** Lower bound (inclusive) for OHL. */
  ohl: number;
  /** Lower bound (inclusive) for EHL. */
  ehl: number;
  /** A count strictly greater than this is UHL. */
  uhl: number;
}

export interface DCPMIFees {
  UHL: number;
  EHL: number;
  OHL: number;
}

export interface DCPMIClassificationOptions {
  thresholds?: Partial<DCPMIThresholds>;
  fees?: Partial<DCPMIFees>;
}

export interface DCPMIClassification {
  /** Registration tier (or `'none'` when not a DCPMI). */
  tier: DCPMITier;
  /** Whether the organisation is a Data Controller/Processor of Major Importance. */
  isDCPMI: boolean;
  /** Annual registration fee in Nigerian Naira (0 when not a volume-tiered DCPMI). */
  annualFeeNGN: number;
  registration: {
    /** Whether NDPC registration is required. */
    required: boolean;
    /** OHL renews registration annually; UHL/EHL register once and file CAR annually. */
    renewsAnnually: boolean;
  };
  compliance: {
    /** Whether the organisation must file annual Compliance Audit Returns (CAR). */
    auditReturnsAnnual: boolean;
    /** Initial compliance audit is due within this many months of commencing processing. */
    initialAuditWithinMonths: number;
  };
  /** Human-readable caveats and next steps. */
  notes: string[];
  /** The count actually used for classification, after defensive normalisation. */
  dataSubjectsConsidered: number;
}

/** September 2025 GAID baseline — override via {@link DCPMIClassificationOptions} as the rules evolve. */
export const DEFAULT_DCPMI_THRESHOLDS: DCPMIThresholds = { ohl: 200, ehl: 1000, uhl: 5000 };

/** September 2025 GAID baseline annual fees (NGN). */
export const DEFAULT_DCPMI_FEES_NGN: DCPMIFees = { UHL: 250000, EHL: 100000, OHL: 10000 };

/**
 * Classify an organisation's DCPMI status, registration tier, annual fee, and
 * Compliance Audit Returns obligations under NDPC GAID 2025.
 */
export function classifyDCPMI(
  input: DCPMIInput,
  options: DCPMIClassificationOptions = {},
): DCPMIClassification {
  const thresholds = { ...DEFAULT_DCPMI_THRESHOLDS, ...options.thresholds };
  const fees = { ...DEFAULT_DCPMI_FEES_NGN, ...options.fees };

  const raw = input?.dataSubjectsInSixMonths;
  const count = typeof raw === 'number' && raw > 0 ? Math.floor(raw) : 0;

  let tier: DCPMITier;
  if (count > thresholds.uhl) tier = 'UHL';
  else if (count >= thresholds.ehl) tier = 'EHL';
  else if (count >= thresholds.ohl) tier = 'OHL';
  else if (input?.isDesignated) tier = 'listed';
  else tier = 'none';

  const isDCPMI = tier !== 'none';
  const annualFeeNGN =
    tier === 'UHL' || tier === 'EHL' || tier === 'OHL' ? fees[tier] : 0;

  const notes: string[] = [];
  if (tier === 'listed') {
    notes.push(
      'Designated as a DCPMI below the volume tiers — confirm the applicable registration tier and fee with the NDPC.',
    );
  }
  if (isDCPMI) {
    notes.push(
      tier === 'OHL'
        ? 'OHL organisations renew their NDPC registration annually and are not required to file Compliance Audit Returns (CAR).'
        : tier === 'listed'
          ? 'Confirm with the NDPC whether your designation falls under UHL/EHL (register once, file CAR annually) or OHL (renew registration annually).'
          : 'Register once with the NDPC, then file Compliance Audit Returns (CAR) annually.',
    );
  }
  notes.push(
    'Thresholds, fees, and filing dates follow the NDPC GAID 2025 baseline and can change — verify against current NDPC guidance before relying on them.',
  );

  return {
    tier,
    isDCPMI,
    annualFeeNGN,
    registration: { required: isDCPMI, renewsAnnually: tier === 'OHL' },
    compliance: { auditReturnsAnnual: tier === 'UHL' || tier === 'EHL', initialAuditWithinMonths: 15 },
    notes,
    dataSubjectsConsidered: count,
  };
}
