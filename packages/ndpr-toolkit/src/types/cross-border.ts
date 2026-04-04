/**
 * Cross-Border Data Transfer types aligned with NDPA 2023 Part VI (Sections 41-45)
 * Personal data may only be transferred outside Nigeria under specific conditions
 */

/**
 * Transfer mechanisms recognized under the NDPA
 */
export type TransferMechanism =
  | 'adequacy_decision'       // Section 41 - Country has adequate protection
  | 'standard_clauses'        // Section 42 - Standard contractual clauses approved by NDPC
  | 'binding_corporate_rules' // Section 43 - BCRs approved by NDPC
  | 'ndpc_authorization'      // Section 44 - Specific authorization from NDPC
  | 'explicit_consent'        // Section 45(a) - Explicit informed consent
  | 'contract_performance'    // Section 45(b) - Necessary for contract performance
  | 'public_interest'         // Section 45(c) - Important reasons of public interest
  | 'legal_claims'            // Section 45(d) - Establishment or defense of legal claims
  | 'vital_interests';        // Section 45(e) - Protect vital interests

/**
 * Adequacy status of a destination country
 */
export type AdequacyStatus = 'adequate' | 'inadequate' | 'pending_review' | 'unknown';

/**
 * Represents a cross-border data transfer record
 */
export interface CrossBorderTransfer {
  /** Unique identifier */
  id: string;

  /** Destination country or territory */
  destinationCountry: string;

  /** ISO country code */
  destinationCountryCode?: string;

  /** Adequacy status of the destination */
  adequacyStatus: AdequacyStatus;

  /** The transfer mechanism being relied upon */
  transferMechanism: TransferMechanism;

  /** Categories of personal data being transferred */
  dataCategories: string[];

  /** Whether sensitive personal data is included */
  includesSensitiveData: boolean;

  /** Estimated number of data subjects whose data is transferred */
  estimatedDataSubjects?: number;

  /** Name of the recipient organization */
  recipientOrganization: string;

  /** Contact details of the recipient */
  recipientContact: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  /** Purpose of the data transfer */
  purpose: string;

  /** Safeguards in place to protect the data */
  safeguards: string[];

  /** Risk assessment summary */
  riskAssessment: string;

  /** Risk level of the transfer */
  riskLevel: 'low' | 'medium' | 'high';

  /** NDPC approval details (required for some transfer mechanisms) */
  ndpcApproval?: {
    required: boolean;
    applied: boolean;
    approved?: boolean;
    referenceNumber?: string;
    appliedAt?: number;
    approvedAt?: number;
  };

  /** Whether a Transfer Impact Assessment has been conducted */
  tiaCompleted: boolean;

  /** Reference to the TIA document */
  tiaReference?: string;

  /** Frequency of the transfer */
  frequency: 'one_time' | 'periodic' | 'continuous';

  /** Start date of the transfer */
  startDate: number;

  /** End date of the transfer (if applicable) */
  endDate?: number;

  /** Status of the transfer */
  status: 'active' | 'suspended' | 'terminated' | 'pending_approval';

  /** Timestamp when the record was created */
  createdAt: number;

  /** Timestamp when the record was last updated */
  updatedAt: number;

  /** Next review date */
  reviewDate?: number;
}

/**
 * Transfer Impact Assessment (TIA) for cross-border transfers
 */
export interface TransferImpactAssessment {
  /** Unique identifier */
  id: string;

  /** ID of the associated cross-border transfer */
  transferId: string;

  /** Date the assessment was conducted */
  assessmentDate: number;

  /** Person who conducted the assessment */
  assessor: {
    name: string;
    role: string;
    email: string;
  };

  /** Analysis of the destination country's legal framework */
  destinationLegalFramework: string;

  /** Whether the destination has data protection legislation */
  hasDataProtectionLaw: boolean;

  /** Whether the destination has an independent supervisory authority */
  hasIndependentAuthority: boolean;

  /** Risk of government access to the data */
  governmentAccessRisk: 'low' | 'medium' | 'high';

  /** Overall assessment of data protection level */
  dataProtectionLevel: 'adequate' | 'partially_adequate' | 'inadequate';

  /** Supplementary measures to address gaps */
  supplementaryMeasures: string[];

  /** Technical measures (encryption, pseudonymization, etc.) */
  technicalMeasures: string[];

  /** Contractual measures */
  contractualMeasures: string[];

  /** Organizational measures */
  organizationalMeasures: string[];

  /** Overall conclusion */
  conclusion: string;

  /** Whether the transfer can proceed based on the assessment */
  approved: boolean;

  /** Conditions for the transfer (if approved with conditions) */
  conditions?: string[];
}

/**
 * Summary of cross-border transfer compliance
 */
export interface CrossBorderSummary {
  /** Total number of active transfers */
  totalActiveTransfers: number;

  /** Breakdown by transfer mechanism */
  byMechanism: Record<TransferMechanism, number>;

  /** Breakdown by adequacy status */
  byAdequacy: Record<AdequacyStatus, number>;

  /** Transfers pending NDPC approval */
  pendingApproval: CrossBorderTransfer[];

  /** Transfers due for review */
  dueForReview: CrossBorderTransfer[];

  /** Transfers missing TIA */
  missingTIA: CrossBorderTransfer[];

  /** High-risk transfers */
  highRiskTransfers: CrossBorderTransfer[];

  /** Last updated timestamp */
  lastUpdated: number;
}
