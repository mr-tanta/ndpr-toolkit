/**
 * Data Subject Rights types aligned with NDPA 2023 Part IV (Sections 29-36)
 */
/**
 * Types of data subject requests per NDPA Part IV
 * - 'information': Right to be informed (Section 29)
 * - 'access': Right of access (Section 30)
 * - 'rectification': Right to rectification (Section 31)
 * - 'erasure': Right to erasure (Section 32)
 * - 'restriction': Right to restrict processing (Section 33)
 * - 'portability': Right to data portability (Section 34)
 * - 'objection': Right to object (Section 35)
 * - 'automated_decision_making': Rights related to automated decision-making (Section 36)
 */
export type DSRType = 'information' | 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'automated_decision_making';
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
     * NDPA section reference (e.g., "Section 30" for access requests)
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
    additionalInfo?: Record<string, any>;
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
