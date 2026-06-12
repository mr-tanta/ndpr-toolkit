import {
  CrossBorderTransfer,
  TransferMechanism,
  AdequacyStatus,
} from '../types/cross-border';

/**
 * Validation result for a cross-border transfer
 */
export interface TransferValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Risk assessment result for a cross-border transfer
 */
export interface TransferRiskResult {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  factors: string[];
  recommendations: string[];
}

/**
 * Returns whether NDPC approval is required for a given transfer mechanism.
 *
 * Standard contractual clauses do NOT require NDPC pre-approval. NDPA Section
 * 41(1)(a) permits transfer where the recipient is subject to contractual clauses
 * affording an adequate level of protection, with only a duty to record the basis
 * and adequacy of protection (Section 41(2)). The Commission "may" determine the
 * adequacy of standard contractual clauses (Section 42(4)) and "may" approve
 * instruments proposed to it (Section 42(5)) — permissive avenues, not
 * preconditions. Per Section 42(6), the absence of a Commission determination
 * does not imply adequacy, so unapproved clauses must be self-assessed against
 * Section 42(1)–(2); validateTransfer surfaces this as a warning.
 *
 * Binding corporate rules are group instruments typically submitted for approval
 * under Section 42(5), and an 'ndpc_authorization' is by definition a Section
 * 42(5)-approved instrument.
 *
 * @param mechanism The transfer mechanism
 * @returns Whether NDPC approval is typically required
 */
export function isNDPCApprovalRequired(mechanism: TransferMechanism): boolean {
  return mechanism === 'binding_corporate_rules' || mechanism === 'ndpc_authorization';
}

/**
 * Returns a human-readable description of a transfer mechanism with its NDPA section reference.
 *
 * @param mechanism The transfer mechanism
 * @returns Description including the relevant NDPA section
 */
export function getTransferMechanismDescription(mechanism: TransferMechanism): string {
  const descriptions: Record<TransferMechanism, string> = {
    adequacy_decision:
      'Adequacy Decision (NDPA Section 42) — Transfer to a country, region, or specified sector that the NDPC has determined provides an adequate level of data protection.',
    standard_clauses:
      'Standard Contractual Clauses (NDPA Section 41(1)(a)) — Transfer based on contractual clauses that afford adequate protection. The NDPC may approve such clauses under Section 42(4)–(5).',
    binding_corporate_rules:
      'Binding Corporate Rules (NDPA Section 41(1)(a)) — Transfer within a group of undertakings based on binding corporate rules that afford adequate protection. The NDPC may approve BCRs under Section 42(5).',
    ndpc_authorization:
      'NDPC-Approved Instrument (NDPA Section 42(5)) — Transfer authorized by an NDPC-approved code of conduct, certification mechanism, or similar instrument that meets the protection standards of the Act.',
    explicit_consent:
      'Explicit Consent (NDPA Section 43(1)(a)) — Transfer based on the consent of the data subject after being informed of the possible risks due to the absence of adequate protections.',
    contract_performance:
      'Contract Performance (NDPA Section 43(1)(b)) — Transfer necessary for the performance of a contract to which the data subject is a party, or for pre-contractual steps at the data subject\'s request.',
    public_interest:
      'Public Interest (NDPA Section 43(1)(d)) — Transfer necessary for important reasons of public interest.',
    legal_claims:
      'Legal Claims (NDPA Section 43(1)(e)) — Transfer necessary for the establishment, exercise, or defense of legal claims.',
    vital_interests:
      'Vital Interests (NDPA Section 43(1)(f)) — Transfer necessary to protect the vital interests of a data subject or of other persons where the data subject is physically or legally incapable of giving consent.',
  };

  return descriptions[mechanism];
}

/**
 * Validates a cross-border transfer record for completeness and compliance.
 * Checks required fields, verifies that NDPC approval is documented when required,
 * and ensures safeguards are in place.
 *
 * @param transfer The cross-border transfer to validate
 * @returns Validation result with errors and warnings
 */
export function validateTransfer(transfer: CrossBorderTransfer): TransferValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!transfer.id) {
    errors.push('Transfer ID is required.');
  }

  if (!transfer.destinationCountry || transfer.destinationCountry.trim() === '') {
    errors.push('Destination country is required.');
  }

  if (!transfer.recipientOrganization || transfer.recipientOrganization.trim() === '') {
    errors.push('Recipient organization is required.');
  }

  if (!transfer.recipientContact?.name || transfer.recipientContact.name.trim() === '') {
    errors.push('Recipient contact name is required.');
  }

  if (!transfer.recipientContact?.email || transfer.recipientContact.email.trim() === '') {
    errors.push('Recipient contact email is required.');
  }

  if (!transfer.purpose || transfer.purpose.trim() === '') {
    errors.push('Purpose of the transfer is required.');
  }

  if (!transfer.transferMechanism) {
    errors.push('Transfer mechanism is required.');
  }

  if (!transfer.dataCategories || transfer.dataCategories.length === 0) {
    errors.push('At least one data category must be specified.');
  }

  if (!transfer.riskAssessment || transfer.riskAssessment.trim() === '') {
    errors.push('Risk assessment summary is required.');
  }

  // Validate safeguards
  if (!transfer.safeguards || transfer.safeguards.length === 0) {
    errors.push('At least one safeguard must be documented for the transfer.');
  }

  // Validate NDPC approval. Only an 'ndpc_authorization' (a Section 42(5)
  // approved instrument by definition) requires approval documentation as a hard
  // error. SCCs and BCRs may be relied on without Commission approval under
  // Section 41(1)(a), subject to the Section 41(2) recording duty — but per
  // Section 42(6) unapproved instruments are not presumed adequate, so missing
  // approval is surfaced as a warning.
  if (transfer.transferMechanism === 'ndpc_authorization') {
    if (!transfer.ndpcApproval) {
      errors.push(
        `NDPC approval documentation is required for transfers using ${getTransferMechanismLabel(transfer.transferMechanism)}.`
      );
    } else {
      if (!transfer.ndpcApproval.required) {
        warnings.push(
          'NDPC approval is marked as not required, but the selected transfer mechanism requires NDPC approval.'
        );
      }
      if (transfer.ndpcApproval.required && !transfer.ndpcApproval.applied) {
        errors.push('NDPC approval is required but an application has not been submitted.');
      }
      if (transfer.ndpcApproval.applied && !transfer.ndpcApproval.approved && transfer.status === 'active') {
        errors.push(
          'Transfer is marked as active but NDPC approval has not been granted. Status should be "pending_approval".'
        );
      }
    }
  } else if (
    transfer.transferMechanism === 'standard_clauses' ||
    transfer.transferMechanism === 'binding_corporate_rules'
  ) {
    if (!transfer.ndpcApproval?.approved) {
      warnings.push(
        `${getTransferMechanismLabel(transfer.transferMechanism)} have not been approved by the NDPC. Approval is not a precondition under Section 41(1)(a), but unapproved instruments are not presumed adequate (Section 42(6)) — record the basis and adequacy of protection per Section 41(2).`
      );
    }
  }

  // Validate TIA
  if (!transfer.tiaCompleted) {
    warnings.push('A Transfer Impact Assessment (TIA) has not been completed for this transfer.');
  }

  // Validate adequacy status alignment
  if (transfer.adequacyStatus === 'inadequate' && transfer.transferMechanism === 'adequacy_decision') {
    errors.push(
      'Cannot rely on adequacy decision (Section 42) when the destination country is marked as inadequate.'
    );
  }

  // Validate dates
  if (transfer.endDate && transfer.startDate > transfer.endDate) {
    errors.push('Start date must be before end date.');
  }

  // Sensitive data warnings
  if (transfer.includesSensitiveData && transfer.riskLevel !== 'high') {
    warnings.push(
      'Transfer includes sensitive personal data but the risk level is not set to high. Consider reviewing the risk assessment.'
    );
  }

  // Review date warning
  if (!transfer.reviewDate) {
    warnings.push('No review date has been set for this transfer. Periodic reviews are recommended.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Performs a basic risk assessment of a cross-border transfer based on adequacy status,
 * transfer mechanism, and data sensitivity.
 *
 * @param transfer The cross-border transfer to assess
 * @returns Risk assessment result with score, factors, and recommendations
 */
export function assessTransferRisk(transfer: CrossBorderTransfer): TransferRiskResult {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Factor 1: Adequacy status
  const adequacyScores: Record<AdequacyStatus, number> = {
    adequate: 0,
    pending_review: 2,
    unknown: 3,
    inadequate: 4,
  };
  const adequacyScore = adequacyScores[transfer.adequacyStatus];
  riskScore += adequacyScore;

  if (transfer.adequacyStatus === 'inadequate') {
    factors.push('Destination country does not have an adequate level of data protection.');
    recommendations.push('Implement supplementary technical and organizational measures.');
  } else if (transfer.adequacyStatus === 'unknown') {
    factors.push('Data protection adequacy of the destination country has not been assessed.');
    recommendations.push('Conduct an adequacy assessment of the destination country.');
  } else if (transfer.adequacyStatus === 'pending_review') {
    factors.push('Destination country adequacy is currently under review.');
    recommendations.push('Monitor the adequacy review outcome and plan for contingencies.');
  }

  // Factor 2: Transfer mechanism strength
  const mechanismScores: Record<TransferMechanism, number> = {
    adequacy_decision: 0,
    standard_clauses: 1,
    binding_corporate_rules: 1,
    ndpc_authorization: 1,
    contract_performance: 2,
    explicit_consent: 2,
    legal_claims: 2,
    public_interest: 2,
    vital_interests: 3,
  };
  const mechanismScore = mechanismScores[transfer.transferMechanism];
  riskScore += mechanismScore;

  if (mechanismScore >= 2) {
    factors.push(
      `Transfer relies on a derogation mechanism (${getTransferMechanismLabel(transfer.transferMechanism)}), which provides fewer structural safeguards.`
    );
    recommendations.push(
      'Consider whether a stronger transfer mechanism (adequacy decision, standard clauses, or BCRs) could be used instead.'
    );
  }

  // Factor 3: Sensitive data
  if (transfer.includesSensitiveData) {
    riskScore += 3;
    factors.push('Transfer includes sensitive personal data, increasing the potential impact of unauthorized access.');
    recommendations.push('Ensure encryption in transit and at rest, and apply strict access controls.');
  }

  // Factor 4: Scale of transfer
  if (transfer.estimatedDataSubjects && transfer.estimatedDataSubjects > 10000) {
    riskScore += 2;
    factors.push('Large number of data subjects involved increases the scope of potential harm.');
    recommendations.push('Consider data minimization strategies and ensure robust incident response procedures.');
  } else if (transfer.estimatedDataSubjects && transfer.estimatedDataSubjects > 1000) {
    riskScore += 1;
    factors.push('Moderate number of data subjects involved.');
  }

  // Factor 5: Missing TIA
  if (!transfer.tiaCompleted) {
    riskScore += 2;
    factors.push('Transfer Impact Assessment has not been completed.');
    recommendations.push('Complete a Transfer Impact Assessment before proceeding with the transfer.');
  }

  // Factor 6: NDPC approval status. A missing approval is a hard requirement
  // only for ndpc_authorization; for SCCs and BCRs it remains a risk factor
  // because unapproved instruments are not presumed adequate (Section 42(6)).
  if (!transfer.ndpcApproval?.approved) {
    if (transfer.transferMechanism === 'ndpc_authorization') {
      riskScore += 2;
      factors.push('NDPC approval is required but has not been granted.');
      recommendations.push('Obtain NDPC approval before activating the transfer.');
    } else if (
      transfer.transferMechanism === 'standard_clauses' ||
      transfer.transferMechanism === 'binding_corporate_rules'
    ) {
      riskScore += 2;
      factors.push(
        'Transfer instrument has not been approved by the NDPC; absence of a Commission determination does not imply adequacy (Section 42(6)).'
      );
      recommendations.push(
        'Self-assess the instrument against Section 42(1)–(2), record the basis and adequacy per Section 41(2), and consider seeking NDPC approval under Section 42(4)–(5).'
      );
    }
  }

  // Factor 7: Safeguards count
  if ((transfer.safeguards?.length || 0) < 3) {
    riskScore += 1;
    factors.push('Limited number of safeguards documented.');
    recommendations.push('Document additional technical, organizational, and contractual safeguards.');
  }

  // Factor 8: Continuous transfers
  if (transfer.frequency === 'continuous') {
    riskScore += 1;
    factors.push('Continuous data transfer increases exposure window.');
    recommendations.push('Implement real-time monitoring and anomaly detection for the transfer.');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore <= 4) {
    riskLevel = 'low';
  } else if (riskScore <= 9) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  return {
    riskLevel,
    riskScore,
    factors,
    recommendations,
  };
}

/**
 * Returns a short label for a transfer mechanism (without the full description).
 *
 * @param mechanism The transfer mechanism
 * @returns Short label
 */
function getTransferMechanismLabel(mechanism: TransferMechanism): string {
  const labels: Record<TransferMechanism, string> = {
    adequacy_decision: 'Adequacy Decision',
    standard_clauses: 'Standard Contractual Clauses',
    binding_corporate_rules: 'Binding Corporate Rules',
    ndpc_authorization: 'NDPC Authorization',
    explicit_consent: 'Explicit Consent',
    contract_performance: 'Contract Performance',
    public_interest: 'Public Interest',
    legal_claims: 'Legal Claims',
    vital_interests: 'Vital Interests',
  };

  return labels[mechanism];
}

// Re-export country adequacy utilities
export {
  getCountryAdequacy,
  getAdequateCountries,
  requiresNDPCApproval,
  toAdequacyStatus,
  COUNTRY_ADEQUACY_MAP,
} from './country-adequacy';
export type { CountryAdequacy, CountryAdequacyStatus } from './country-adequacy';
