// Local types for the demo application
export interface AppConfig {
  apiUrl?: string;
  environment: "development" | "staging" | "production";
  features: {
    consent: boolean;
    dsr: boolean;
    dpia: boolean;
    breach: boolean;
    privacy: boolean;
  };
}

// Define missing types locally for demo
export type DSRStatus = "pending" | "in-progress" | "completed" | "rejected";
export type DSRType =
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "objection"
  | "restriction";

// Legacy type aliases
export type RequestStatus = DSRStatus;
export type RequestType = DSRType;

// DSRRequestType interface for DSR form
export interface DSRRequestType {
  id: string;
  name: string;
  description: string;
  estimatedCompletionTime: number;
  requiresAdditionalInfo: boolean;
}

// Demo-specific types
export interface ConsentOption {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  defaultValue?: boolean;
}

export interface BreachReport {
  id: string;
  title: string;
  description: string;
  category: string;
  discoveredAt: number;
  reportedAt: number;
  reporter: {
    name: string;
    email: string;
    department: string;
  };
  affectedSystems: string[];
  dataTypes: string[];
  estimatedAffectedSubjects: number;
  status: "ongoing" | "resolved" | "contained";
  initialActions: string;
}

export interface DPIAQuestion {
  id: string;
  text: string;
  type:
    | "yes-no"
    | "multiple-choice"
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "scale";
  options?: Array<{
    id?: string;
    label: string;
    value: string;
    riskLevel?: unknown;
  }>;
  required?: boolean;
  category?: string;
  guidance?: string;
  minValue?: number;
  maxValue?: number;
  scaleLabels?: Record<string, string>;
}

// Type aliases
export type RiskAssessmentQuestion = DPIAQuestion;

export interface DataSubjectRequest {
  id: string;
  type: DSRType;
  status: DSRStatus;
  requestedAt: Date;
  email: string;
  description?: string;
  response?: string;
  completedAt?: Date;
}


// Define ConsentType locally since it's not exported from the package
export type ConsentType =
  | "necessary"
  | "functional"
  | "analytics"
  | "marketing"
  | "preferences";

// Define BreachSeverity type
export type BreachSeverity = "low" | "medium" | "high" | "critical";

// Define missing types that are not exported from the package
export interface ConsentRecord {
  id: string;
  userId?: string;
  consents: Record<string, boolean>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

export interface ConsentHistoryEntry {
  timestamp: Date;
  consents: Record<string, boolean>;
  action: "granted" | "revoked" | "updated";
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

export interface ConsentPreferences {
  [key: string]: boolean;
}

// Additional missing types for demo compatibility
export interface DSRRequest {
  id: string;
  type: DSRType;
  status: DSRStatus;
  createdAt: number;
  updatedAt: number;
  dueDate: number;
  completedAt?: number;
  subject: {
    name: string;
    email: string;
    phone?: string;
  };
  description: string;
}

export interface RiskAssessment {
  id: string;
  breachId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  assessment: string;
  mitigationMeasures: string[];
  assessedAt: number;
  assessor: string;
}

export interface DPIAResult {
  id: string;
  title: string;
  processingDescription: string;
  startedAt: number;
  completedAt?: number;
  assessor: {
    name: string;
    role: string;
    email: string;
  };
  answers: Record<string, unknown>;
  risks: Array<{
    id: string;
    description: string;
    likelihood: number;
    impact: number;
    score: number;
    level: string;
    mitigationMeasures: string[];
    mitigated?: boolean;
    residualScore?: number;
    relatedQuestionIds?: string[];
  }>;
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  canProceed: boolean;
  conclusion: string;
  recommendations: string[];
  reviewDate: number;
  version: string;
}

export interface PolicyVariable {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: string[];
  defaultValue?: unknown;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  sections: PolicySection[];
  variables: PolicyVariable[];
  version: string;
}

// Update PolicySection to include template field
export interface PolicySection {
  id: string;
  title: string;
  content: string;
  template?: string;
  required: boolean;
  order: number;
  included?: boolean;
  variables?: string[];
}
