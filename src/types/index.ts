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
  severity: "low" | "medium" | "high" | "critical";
  dateDiscovered: Date;
  dateReported?: Date;
  affectedRecords: number;
  status: "draft" | "reported" | "investigating" | "resolved";
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
    id: string;
    label: string;
    value: string;
    riskLevel?: unknown;
  }>;
  required?: boolean;
  category: string;
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

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  order: number;
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
