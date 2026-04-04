/**
 * Record of Processing Activities (ROPA) types aligned with NDPA 2023
 * Data controllers must maintain comprehensive records of all processing activities
 */

import type { LawfulBasis } from './lawful-basis';

/**
 * Represents a single processing record in the ROPA
 */
export interface ProcessingRecord {
  /** Unique identifier */
  id: string;

  /** Name of the processing activity */
  name: string;

  /** Detailed description of the processing */
  description: string;

  /** Data controller details */
  controllerDetails: {
    name: string;
    contact: string;
    address: string;
    registrationNumber?: string;
    dpoContact?: string;
  };

  /** Joint controller details (if applicable) */
  jointControllerDetails?: {
    name: string;
    contact: string;
    address: string;
    responsibilities: string;
  };

  /** Data processor details (if processing is outsourced) */
  processorDetails?: {
    name: string;
    contact: string;
    address: string;
    contractReference?: string;
  };

  /** Lawful basis for the processing */
  lawfulBasis: LawfulBasis;

  /** Justification for the chosen lawful basis */
  lawfulBasisJustification: string;

  /** Purposes of the processing */
  purposes: string[];

  /** Categories of personal data processed */
  dataCategories: string[];

  /** Categories of sensitive personal data (if any) */
  sensitiveDataCategories?: string[];

  /** Categories of data subjects */
  dataSubjectCategories: string[];

  /** Recipients or categories of recipients */
  recipients: string[];

  /** Cross-border transfer details */
  crossBorderTransfers?: Array<{
    destinationCountry: string;
    countryCode?: string;
    safeguards: string;
    transferMechanism: string;
  }>;

  /** Data retention period */
  retentionPeriod: string;

  /** Justification for the retention period */
  retentionJustification?: string;

  /** Technical and organizational security measures */
  securityMeasures: string[];

  /** Data source (directly from data subject or from third party) */
  dataSource: 'data_subject' | 'third_party' | 'public_source' | 'other';

  /** Third-party source details (if dataSource is 'third_party') */
  thirdPartySourceDetails?: string;

  /** Whether a DPIA is required for this processing */
  dpiaRequired: boolean;

  /** Reference to the DPIA (if conducted) */
  dpiaReference?: string;

  /** Whether automated decision-making is involved */
  automatedDecisionMaking: boolean;

  /** Details of automated decision-making (if applicable) */
  automatedDecisionMakingDetails?: string;

  /** Status of the processing record */
  status: 'active' | 'inactive' | 'archived';

  /** Department or business unit responsible */
  department?: string;

  /** System or application used for processing */
  systemsUsed?: string[];

  /** Timestamp when the record was created */
  createdAt: number;

  /** Timestamp when the record was last updated */
  updatedAt: number;

  /** Timestamp when the record was last reviewed */
  lastReviewedAt?: number;

  /** Next review date */
  nextReviewDate?: number;
}

/**
 * Represents a complete Record of Processing Activities
 */
export interface RecordOfProcessingActivities {
  /** Unique identifier */
  id: string;

  /** Organization name */
  organizationName: string;

  /** Organization contact information */
  organizationContact: string;

  /** Organization address */
  organizationAddress: string;

  /** Data Protection Officer details */
  dpoDetails?: {
    name: string;
    email: string;
    phone?: string;
  };

  /** NDPC registration number */
  ndpcRegistrationNumber?: string;

  /** All processing records */
  records: ProcessingRecord[];

  /** Timestamp when the ROPA was last updated */
  lastUpdated: number;

  /** Version of the ROPA */
  version: string;

  /** Export format options */
  exportFormats?: ('pdf' | 'csv' | 'json' | 'xlsx')[];
}

/**
 * Summary statistics for the ROPA
 */
export interface ROPASummary {
  /** Total number of processing records */
  totalRecords: number;

  /** Active processing records */
  activeRecords: number;

  /** Records by lawful basis */
  byLawfulBasis: Record<LawfulBasis, number>;

  /** Records involving sensitive data */
  sensitiveDataRecords: number;

  /** Records involving cross-border transfers */
  crossBorderRecords: number;

  /** Records requiring DPIA */
  dpiaRequiredRecords: number;

  /** Records involving automated decision-making */
  automatedDecisionRecords: number;

  /** Records due for review */
  recordsDueForReview: ProcessingRecord[];

  /** Departments with most processing activities */
  topDepartments: Array<{ department: string; count: number }>;

  /** Last updated timestamp */
  lastUpdated: number;
}
