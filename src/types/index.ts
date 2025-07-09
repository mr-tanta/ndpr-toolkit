// Re-export all types from the package
// This ensures consistency between the main app and the package
export * from "@tantainnovative/ndpr-toolkit";
import type { DSRStatus, DSRType } from "@tantainnovative/ndpr-toolkit";

// Additional app-specific types that extend the package types
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

// Legacy type aliases for backward compatibility
// These map old type names to new ones from the package
export type RequestStatus = DSRStatus;
export type RequestType = DSRType;

// Re-export specific types that might have different names
export type {
  ConsentOption,
  BreachReport,
  RiskAssessment,
  NotificationRequirement,
  RegulatoryNotification,
  DSRRequest as DataSubjectRequest,
  DSRStatus,
  DSRType,
  PrivacyPolicy,
  PolicySection,
  PolicyTemplate,
  PolicyVariable,
  OrganizationInfo,
  DPIAQuestion as RiskAssessmentQuestion,
  DPIASection,
  DPIAResult,
} from "@tantainnovative/ndpr-toolkit";

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
