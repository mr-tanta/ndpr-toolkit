/**
 * Data Subject Rights types aligned with NDPA 2023 Part VI (Sections 34-38)
 * and the related provisions in Part V (Section 27 — information to the data subject)
 * and Part X (Section 46 — complaint to the Commission).
 *
 * Note: These are guidance labels — not legal advice. Verify with your DPO or counsel.
 */

/**
 * Types of data subject requests per NDPA Part VI
 * - 'information': Right to be informed (Section 27 — provision of information; Section 34(1)(a))
 * - 'access': Right of access / confirmation + data copy (Section 34(1)(a)–(b))
 * - 'rectification': Right to rectification (Section 34(1)(c))
 * - 'erasure': Right to erasure (Section 34(1)(d), Section 34(2))
 * - 'restriction': Right to restrict processing (Section 34(1)(e))
 * - 'portability': Right to data portability (Section 38)
 * - 'objection': Right to object (Section 36)
 * - 'automated_decision_making': Rights re. automated decisions / profiling (Section 37)
 * - 'withdraw_consent': Right to withdraw consent (Section 35)
 */
export type DSRType =
  | 'information'
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'portability'
  | 'objection'
  | 'automated_decision_making'
  | 'withdraw_consent';

/**
 * Status of a data subject request
 */
export type DSRStatus = 'pending' | 'awaitingVerification' | 'inProgress' | 'completed' | 'rejected';

/**
 * Represents a type of data subject request (detailed configuration)
 */
export interface RequestType {
  /** Unique identifier for the request type */
  id: string;

  /** Display name for the request type */
  name: string;

  /** Description of what this request type entails */
  description: string;

  /**
   * NDPA 2023 section reference for this right
   * (e.g., "Section 34(1)(a)" for access, "Section 38" for portability).
   * Used for display purposes only — verify the exact subsection with counsel.
   */
  ndpaSection?: string;

  /**
   * Estimated time to fulfill this type of request (in days)
   * NDPA requires response within 30 days
   */
  estimatedCompletionTime: number;

  /** Whether additional information is required for this request type */
  requiresAdditionalInfo: boolean;

  /** Custom fields required for this request type */
  additionalFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
    options?: string[];
    required: boolean;
    placeholder?: string;
  }>;
}

/**
 * Legacy status of a data subject request
 * @deprecated Use DSRStatus instead
 */
export type RequestStatus = 'pending' | 'verifying' | 'processing' | 'completed' | 'rejected';

/**
 * Represents a data subject request
 */
export interface DSRRequest {
  /** Unique identifier for the request */
  id: string;

  /** Type of request */
  type: DSRType;

  /** Current status of the request */
  status: DSRStatus;

  /** Timestamp when the request was submitted */
  createdAt: number;

  /** Timestamp when the request was last updated */
  updatedAt: number;

  /** Timestamp when the request was completed (if applicable) */
  completedAt?: number;

  /** Timestamp when the identity was verified (if applicable) */
  verifiedAt?: number;

  /**
   * Due date for responding to the request (timestamp)
   * NDPA requires response within 30 days of receipt
   */
  dueDate?: number;

  /** Description or details of the request */
  description?: string;

  /**
   * The lawful basis under which the data was originally processed
   * Relevant for evaluating objection and erasure requests
   */
  lawfulBasis?: string;

  /** Data subject information */
  subject: {
    name: string;
    email: string;
    phone?: string;
    identifierValue?: string;
    identifierType?: string;
  };

  /** Additional information provided by the data subject */
  additionalInfo?: Record<string, string | number | boolean | null>;

  /** Notes added by staff processing the request */
  internalNotes?: Array<{
    timestamp: number;
    author: string;
    note: string;
  }>;

  /** Verification status */
  verification?: {
    verified: boolean;
    method?: string;
    verifiedAt?: number;
    verifiedBy?: string;
  };

  /** Reason for rejection (if status is 'rejected') */
  rejectionReason?: string;

  /** Files attached to the request */
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    addedAt: number;
  }>;

  /**
   * Whether an extension was requested for this DSR
   * NDPA allows a one-time extension of 30 days with justification
   */
  extensionRequested?: boolean;

  /** Reason for the extension, if requested */
  extensionReason?: string;
}
