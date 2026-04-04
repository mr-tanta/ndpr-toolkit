/**
 * Data Protection Impact Assessment types aligned with NDPA 2023 Sections 38-39
 * A DPIA is required when processing is likely to result in high risk to data subjects
 */

/**
 * Represents a question in the DPIA questionnaire
 */
export interface DPIAQuestion {
  /** Unique identifier for the question */
  id: string;

  /** The text of the question */
  text: string;

  /** Additional guidance for answering the question */
  guidance?: string;

  /** Type of input required for the answer */
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'scale';

  /** Options for select, radio, or checkbox questions */
  options?: Array<{
    value: string;
    label: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>;

  /** For scale questions, the minimum value */
  minValue?: number;

  /** For scale questions, the maximum value */
  maxValue?: number;

  /** For scale questions, labels for the scale points */
  scaleLabels?: Record<number, string>;

  /** Whether the question is required */
  required: boolean;

  /** Risk level associated with this question */
  riskLevel?: 'low' | 'medium' | 'high';

  /** Whether this question triggers additional questions based on the answer */
  hasDependentQuestions?: boolean;

  /** Conditions that determine when this question should be shown */
  showWhen?: Array<{
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
}

/**
 * Represents a section in the DPIA questionnaire
 */
export interface DPIASection {
  /** Unique identifier for the section */
  id: string;

  /** Title of the section */
  title: string;

  /** Description of the section */
  description?: string;

  /** Questions in this section */
  questions: DPIAQuestion[];

  /** Order of the section in the questionnaire */
  order: number;
}

/**
 * Represents a risk identified in the DPIA
 */
export interface DPIARisk {
  /** Unique identifier for the risk */
  id: string;

  /** Description of the risk */
  description: string;

  /** Likelihood of the risk occurring (1-5) */
  likelihood: number;

  /** Impact if the risk occurs (1-5) */
  impact: number;

  /** Overall risk score (likelihood * impact) */
  score: number;

  /** Risk level based on the score */
  level: 'low' | 'medium' | 'high' | 'critical';

  /** Measures to mitigate the risk */
  mitigationMeasures?: string[];

  /** Whether the risk has been mitigated */
  mitigated: boolean;

  /** Residual risk score after mitigation */
  residualScore?: number;

  /** Questions that identified this risk */
  relatedQuestionIds: string[];
}

/**
 * Represents the result of a completed DPIA
 */
export interface DPIAResult {
  /** Unique identifier for the DPIA */
  id: string;

  /** Title of the DPIA */
  title: string;

  /** Description of the processing activity being assessed */
  processingDescription: string;

  /** Timestamp when the DPIA was started */
  startedAt: number;

  /** Timestamp when the DPIA was completed */
  completedAt?: number;

  /** Person responsible for conducting the DPIA */
  assessor: {
    name: string;
    role: string;
    email: string;
  };

  /** Answers to all questions in the DPIA */
  answers: Record<string, any>;

  /** Risks identified in the DPIA */
  risks: DPIARisk[];

  /** Overall risk level of the processing activity */
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';

  /** Whether the DPIA concluded that the processing can proceed */
  canProceed: boolean;

  /** Reasons why the processing can or cannot proceed */
  conclusion: string;

  /** Recommendations for the processing activity */
  recommendations?: string[];

  /** Next review date for the DPIA */
  reviewDate?: number;

  /** Version of the DPIA questionnaire used */
  version: string;

  /**
   * Whether prior consultation with NDPC is required
   * Per NDPA Section 39, consultation is required when DPIA indicates high residual risk
   */
  ndpcConsultationRequired?: boolean;

  /** Date when NDPC consultation was initiated */
  ndpcConsultationDate?: number;

  /** Reference number from NDPC consultation */
  ndpcConsultationReference?: string;

  /**
   * The lawful basis for the processing activity being assessed
   */
  lawfulBasis?: string;

  /**
   * Whether this DPIA involves cross-border data transfers
   */
  involvesCrossBorderTransfer?: boolean;
}
