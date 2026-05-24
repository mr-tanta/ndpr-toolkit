/**
 * Breach notification types aligned with NDPA 2023 Section 40
 * Data controllers must notify the NDPC within 72 hours of becoming aware of a breach
 * Data subjects must be notified without undue delay when breach is likely to result in high risk
 */

/**
 * Represents a data breach category
 */
export interface BreachCategory {
  /** Unique identifier for the category */
  id: string;

  /** Display name for the category */
  name: string;

  /** Description of this breach category */
  description: string;

  /** Default severity level for this category */
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Represents a data breach report
 */
export interface BreachReport {
  /** Unique identifier for the breach report */
  id: string;

  /** Title/summary of the breach */
  title: string;

  /** Detailed description of the breach */
  description: string;

  /** Category of the breach */
  category: string;

  /** Timestamp when the breach was discovered */
  discoveredAt: number;

  /** Timestamp when the breach occurred (if known) */
  occurredAt?: number;

  /** Timestamp when the breach was reported internally */
  reportedAt: number;

  /** Person who reported the breach */
  reporter: {
    name: string;
    email: string;
    department: string;
    phone?: string;
  };

  /** Systems or data affected by the breach */
  affectedSystems: string[];

  /** Types of data involved in the breach */
  dataTypes: string[];

  /** Whether sensitive personal data is involved (NDPA Section 30) */
  involvesSensitiveData?: boolean;

  /** Estimated number of data subjects affected */
  estimatedAffectedSubjects?: number;

  /**
   * Approximate number of personal data RECORDS concerned (distinct from subject count).
   * Required content under NDPA Section 40(1)(a) and Section 40(2).
   */
  approximateRecordCount?: number;

  /**
   * Categories of data subjects affected (e.g. customers, employees, minors, patients).
   * Required content under NDPA Section 40(1)(a) and Section 40(2).
   */
  dataSubjectCategories?: string[];

  /**
   * Likely consequences of the breach for affected data subjects (e.g. identity theft,
   * financial loss, reputational damage). Reported to the NDPC and, where applicable,
   * communicated to data subjects under Section 40(3).
   */
  likelyConsequences?: string;

  /**
   * Measures taken or proposed to mitigate adverse effects of the breach.
   * Required content for Section 40(3) communications to data subjects.
   */
  mitigationMeasures?: string;

  /**
   * Whether this is a phased / interim report submitted before full investigation
   * is complete. The NDPC permits phased reporting where complete information is
   * not available within 72 hours.
   */
  isPhasedReport?: boolean;

  /**
   * ID of the prior phased report this report supplements, if any.
   */
  supplementsReportId?: string;

  /**
   * Data Protection Officer contact details. The DPO is the named contact point
   * for the NDPC per NDPA Section 32(3)(c). Required content in the regulatory
   * report (Section 40(2)).
   */
  dpoContact?: {
    name: string;
    email: string;
    phone?: string;
  };

  /** Whether the breach is ongoing or contained */
  status: 'ongoing' | 'contained' | 'resolved';

  /** Initial actions taken to address the breach */
  initialActions?: string;

  /** Attachments related to the breach */
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    addedAt: number;
  }>;
}

/**
 * Represents a risk assessment for a data breach
 */
export interface RiskAssessment {
  /** Unique identifier for the risk assessment */
  id: string;

  /** ID of the breach this assessment is for */
  breachId: string;

  /** Timestamp when the assessment was conducted */
  assessedAt: number;

  /** Person who conducted the assessment */
  assessor: {
    name: string;
    role: string;
    email: string;
  };

  /** Confidentiality impact (1-5) */
  confidentialityImpact: number;

  /** Integrity impact (1-5) */
  integrityImpact: number;

  /** Availability impact (1-5) */
  availabilityImpact: number;

  /** Likelihood of harm to data subjects (1-5) */
  harmLikelihood: number;

  /** Severity of potential harm to data subjects (1-5) */
  harmSeverity: number;

  /** Overall risk score */
  overallRiskScore: number;

  /** Risk level based on the overall score */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  /** Whether the breach is likely to result in a risk to rights and freedoms */
  risksToRightsAndFreedoms: boolean;

  /** Whether the breach is likely to result in a high risk to rights and freedoms */
  highRisksToRightsAndFreedoms: boolean;

  /** Justification for the risk assessment */
  justification: string;
}

/**
 * Represents notification requirements for a data breach per NDPA Section 40
 */
export interface NotificationRequirement {
  /**
   * Whether NDPC notification is required
   * Per NDPA Section 40, notification to NDPC is required for all breaches
   * that pose a risk to data subjects' rights and freedoms
   */
  ndpcNotificationRequired: boolean;

  /**
   * Deadline for NDPC notification (72 hours from discovery)
   * NDPA Section 40(1)
   */
  ndpcNotificationDeadline: number;

  /**
   * Whether data subject notification is required
   * Per NDPA Section 40(4), required when breach is likely to result in
   * high risk to rights and freedoms of data subjects
   */
  dataSubjectNotificationRequired: boolean;

  /** Justification for the notification decision */
  justification: string;

  /**
   * @deprecated Use ndpcNotificationRequired instead. Kept for backward compatibility.
   */
  nitdaNotificationRequired?: boolean;

  /**
   * @deprecated Use ndpcNotificationDeadline instead. Kept for backward compatibility.
   */
  nitdaNotificationDeadline?: number;
}

/**
 * Represents a notification sent to the NDPC (Nigeria Data Protection Commission)
 */
export interface RegulatoryNotification {
  /** Unique identifier for the notification */
  id: string;

  /** ID of the breach this notification is for */
  breachId: string;

  /** Timestamp when the notification was sent */
  sentAt: number;

  /** Method used to send the notification */
  method: 'email' | 'portal' | 'letter' | 'other';

  /** Reference number assigned by the NDPC (if available) */
  referenceNumber?: string;

  /** Contact person at the NDPC */
  ndpcContact?: {
    name: string;
    email: string;
    phone?: string;
  };

  /** Content of the notification */
  content: string;

  /** Attachments included with the notification */
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;

  /** Follow-up communications with the NDPC */
  followUps?: Array<{
    timestamp: number;
    direction: 'sent' | 'received';
    content: string;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
  }>;

  /**
   * @deprecated Use ndpcContact instead. Kept for backward compatibility.
   */
  nitdaContact?: {
    name: string;
    email: string;
    phone?: string;
  };
}
