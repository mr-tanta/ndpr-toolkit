/**
 * Data Controller/Processor of Major Importance (DCPMI) classification under
 * the NDPC General Application and Implementation Directive (GAID) 2025.
 *
 * Defaults are a versioned implementation baseline, not immutable law. Callers
 * can override them, and every result includes the effective thresholds/fees
 * so a historical classification can be reproduced.
 */

export type DCPMITier = 'UHL' | 'EHL' | 'OHL' | 'listed' | 'none';

export interface DCPMIInput {
  dataSubjectsInSixMonths?: number;
  isDesignated?: boolean;
}

export interface DCPMIThresholds {
  ohl: number;
  ehl: number;
  /** A count strictly greater than this threshold is UHL. */
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
  rulesetId?: string;
  rulesetVersion?: string;
  rulesetEffectiveDate?: string;
}

export interface DCPMIClassification {
  tier: DCPMITier;
  isDCPMI: boolean;
  annualFeeNGN: number;
  registration: {
    required: boolean;
    renewsAnnually: boolean;
  };
  compliance: {
    auditReturnsAnnual: boolean;
    initialAuditWithinMonths: number;
  };
  notes: string[];
  dataSubjectsConsidered: number;
  provenance: {
    rulesetId: string;
    rulesetVersion: string;
    rulesetEffectiveDate: string;
    thresholds: DCPMIThresholds;
    feesNGN: DCPMIFees;
  };
}

/** September 2025 GAID implementation baseline. */
export const DEFAULT_DCPMI_THRESHOLDS: DCPMIThresholds = { ohl: 200, ehl: 1000, uhl: 5000 };
export const DEFAULT_DCPMI_FEES_NGN: DCPMIFees = { UHL: 250000, EHL: 100000, OHL: 10000 };
export const DEFAULT_DCPMI_RULESET = {
  id: 'ndpc-gaid-2025-dcpmi',
  version: '2025.09',
  effectiveDate: '2025-09-01',
} as const;

function validateConfiguration(thresholds: DCPMIThresholds, fees: DCPMIFees): void {
  for (const [name, value] of Object.entries(thresholds)) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError(`DCPMI threshold ${name} must be a non-negative safe integer.`);
    }
  }
  if (!(thresholds.ohl < thresholds.ehl && thresholds.ehl <= thresholds.uhl)) {
    throw new RangeError('DCPMI thresholds must satisfy ohl < ehl <= uhl.');
  }
  for (const [name, value] of Object.entries(fees)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`DCPMI fee ${name} must be a non-negative finite number.`);
    }
  }
}

export function classifyDCPMI(
  input: DCPMIInput,
  options: DCPMIClassificationOptions = {},
): DCPMIClassification {
  const thresholds: DCPMIThresholds = { ...DEFAULT_DCPMI_THRESHOLDS, ...options.thresholds };
  const fees: DCPMIFees = { ...DEFAULT_DCPMI_FEES_NGN, ...options.fees };
  validateConfiguration(thresholds, fees);

  const raw = input?.dataSubjectsInSixMonths;
  const count = typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;

  let tier: DCPMITier;
  if (count > thresholds.uhl) tier = 'UHL';
  else if (count >= thresholds.ehl) tier = 'EHL';
  else if (count >= thresholds.ohl) tier = 'OHL';
  else if (input?.isDesignated) tier = 'listed';
  else tier = 'none';

  const isDCPMI = tier !== 'none';
  const annualFeeNGN = tier === 'UHL' || tier === 'EHL' || tier === 'OHL' ? fees[tier] : 0;
  const notes: string[] = [];

  if (tier === 'listed') {
    notes.push('Designated as a DCPMI below the configured volume tiers — confirm the applicable tier and fee with the NDPC.');
  }
  if (isDCPMI) {
    notes.push(
      tier === 'OHL'
        ? 'Under this ruleset, OHL organisations renew registration annually and do not file Compliance Audit Returns.'
        : tier === 'listed'
          ? 'Confirm whether the designation follows UHL/EHL filing or OHL renewal obligations.'
          : 'Under this ruleset, register once and file Compliance Audit Returns annually.',
    );
  }
  notes.push('This GAID classification uses the recorded ruleset snapshot below; verify current NDPC guidance before relying on it.');

  return {
    tier,
    isDCPMI,
    annualFeeNGN,
    registration: { required: isDCPMI, renewsAnnually: tier === 'OHL' },
    compliance: {
      auditReturnsAnnual: tier === 'UHL' || tier === 'EHL',
      initialAuditWithinMonths: 15,
    },
    notes,
    dataSubjectsConsidered: count,
    provenance: {
      rulesetId: options.rulesetId ?? DEFAULT_DCPMI_RULESET.id,
      rulesetVersion: options.rulesetVersion ?? DEFAULT_DCPMI_RULESET.version,
      rulesetEffectiveDate: options.rulesetEffectiveDate ?? DEFAULT_DCPMI_RULESET.effectiveDate,
      thresholds: { ...thresholds },
      feesNGN: { ...fees },
    },
  };
}
