// Re-export all types from the package
// This ensures consistency between the main app and the package
export * from '@tantainnovative/ndpr-toolkit';

// Additional app-specific types that extend the package types
export interface AppConfig {
  apiUrl?: string;
  environment: 'development' | 'staging' | 'production';
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
export type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
export type RequestType = 
  | 'access' 
  | 'rectification' 
  | 'erasure' 
  | 'restrict-processing' 
  | 'data-portability' 
  | 'object';

// Re-export specific types that might have different names
export type {
  ConsentType,
  ConsentOption,
  ConsentRecord,
  ConsentPreferences,
  BreachSeverity,
  BreachNotification,
  BreachRecord,
  DSRRequest as DataSubjectRequest,
  DSRStatus,
  DSRType,
  PrivacyPolicy,
  PolicySection,
  RiskAssessment,
  RiskLevel,
  DPIAQuestion as RiskAssessmentQuestion,
  DPIAAssessment
} from '@tantainnovative/ndpr-toolkit';
