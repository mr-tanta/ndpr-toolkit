/**
 * Lawful Basis types aligned with NDPA 2023 Part III (Sections 24-28)
 * Every processing activity must have a documented lawful basis
 */

/**
 * The six lawful bases for processing personal data per NDPA Section 25(1)
 */
export type LawfulBasis =
  | 'consent'              // Section 25(1)(a) - Data subject has given consent
  | 'contract'             // Section 25(1)(b) - Necessary for contract performance
  | 'legal_obligation'     // Section 25(1)(c) - Necessary for legal obligation compliance
  | 'vital_interests'      // Section 25(1)(d) - Necessary to protect vital interests
  | 'public_interest'      // Section 25(1)(e) - Necessary for public interest or official authority
  | 'legitimate_interests'; // Section 25(1)(f) - Necessary for legitimate interests

/**
 * Additional conditions required for processing sensitive personal data
 * per NDPA Section 27
 */
export type SensitiveDataCondition =
  | 'explicit_consent'
  | 'employment_law'
  | 'vital_interests_incapable'
  | 'nonprofit_legitimate'
  | 'publicly_available'
  | 'legal_claims'
  | 'substantial_public_interest'
  | 'health_purposes'
  | 'public_health'
  | 'archiving_research';

/**
 * Represents a processing activity and its lawful basis
 */
export interface ProcessingActivity {
  /** Unique identifier */
  id: string;

  /** Name of the processing activity */
  name: string;

  /** Description of what processing is performed */
  description: string;

  /** The lawful basis for this processing activity */
  lawfulBasis: LawfulBasis;

  /** Justification for why this lawful basis applies */
  lawfulBasisJustification: string;

  /** Categories of personal data being processed */
  dataCategories: string[];

  /** Whether sensitive personal data is involved */
  involvesSensitiveData: boolean;

  /** Condition for processing sensitive data (required if involvesSensitiveData is true) */
  sensitiveDataCondition?: SensitiveDataCondition;

  /** Categories of data subjects */
  dataSubjectCategories: string[];

  /** Purposes of the processing */
  purposes: string[];

  /** Data retention period */
  retentionPeriod: string;

  /** Justification for the retention period */
  retentionJustification?: string;

  /** Recipients or categories of recipients */
  recipients?: string[];

  /** Whether data is transferred outside Nigeria */
  crossBorderTransfer: boolean;

  /** Timestamp when the record was created */
  createdAt: number;

  /** Timestamp when the record was last updated */
  updatedAt: number;

  /** Next review date */
  reviewDate?: number;

  /** Status of the processing activity */
  status: 'active' | 'inactive' | 'under_review' | 'archived';

  /** DPO approval details */
  dpoApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: number;
    notes?: string;
  };
}

/**
 * Represents a Legitimate Interest Assessment (LIA)
 * Required when the lawful basis is 'legitimate_interests'
 */
export interface LegitimateInterestAssessment {
  /** Unique identifier */
  id: string;

  /** ID of the associated processing activity */
  processingActivityId: string;

  /** Date the assessment was conducted */
  assessmentDate: number;

  /** Person who conducted the assessment */
  assessor: {
    name: string;
    role: string;
    email: string;
  };

  /** Description of the legitimate interest being pursued */
  purposeTest: string;

  /** Why the processing is necessary for this purpose */
  necessityTest: string;

  /** Balancing test: rights of data subject vs. legitimate interest */
  balancingTest: string;

  /** Safeguards applied to protect data subject rights */
  safeguards: string[];

  /** Overall conclusion */
  conclusion: string;

  /** Whether the assessment concluded the processing is justified */
  approved: boolean;
}

/**
 * Summary of all lawful basis documentation for compliance reporting
 */
export interface LawfulBasisSummary {
  /** Total number of processing activities */
  totalActivities: number;

  /** Breakdown by lawful basis */
  byBasis: Record<LawfulBasis, number>;

  /** Number of activities involving sensitive data */
  sensitiveDataActivities: number;

  /** Number of activities involving cross-border transfers */
  crossBorderActivities: number;

  /** Activities due for review */
  activitiesDueForReview: ProcessingActivity[];

  /** Activities without DPO approval */
  activitiesWithoutApproval: ProcessingActivity[];

  /** Last updated timestamp */
  lastUpdated: number;
}
