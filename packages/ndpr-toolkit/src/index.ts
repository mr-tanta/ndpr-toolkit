// Consent Management Components
export { ConsentBanner } from './components/consent/ConsentBanner';
export { ConsentManager } from './components/consent/ConsentManager';
export { ConsentStorage } from './components/consent/ConsentStorage';
export type { ConsentBannerClassNames, ConsentAnalyticsEvent } from './components/consent/ConsentBanner';
export type { ConsentManagerClassNames } from './components/consent/ConsentManager';
export type { ConsentStorageClassNames } from './components/consent/ConsentStorage';
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';

// Data Subject Rights Components
export { DSRRequestForm } from './components/dsr/DSRRequestForm';
export { DSRDashboard } from './components/dsr/DSRDashboard';
export { DSRTracker } from './components/dsr/DSRTracker';
export type { DSRRequestFormClassNames, DSRFormSubmission } from './components/dsr/DSRRequestForm';
export type { DSRDashboardClassNames } from './components/dsr/DSRDashboard';
export type { DSRTrackerClassNames } from './components/dsr/DSRTracker';
export type { DSRRequest, RequestType, DSRStatus, DSRType, RequestStatus } from './types/dsr';

// DPIA Components
export { DPIAQuestionnaire } from './components/dpia/DPIAQuestionnaire';
export { DPIAReport } from './components/dpia/DPIAReport';
export { StepIndicator } from './components/dpia/StepIndicator';
export type { DPIAQuestionnaireClassNames } from './components/dpia/DPIAQuestionnaire';
export type { DPIAReportClassNames } from './components/dpia/DPIAReport';
export type { StepIndicatorClassNames } from './components/dpia/StepIndicator';
export type { DPIAQuestion, DPIASection, DPIAResult, DPIARisk } from './types/dpia';

// Breach Notification Components
export { BreachReportForm } from './components/breach/BreachReportForm';
export { BreachRiskAssessment } from './components/breach/BreachRiskAssessment';
export { BreachNotificationManager } from './components/breach/BreachNotificationManager';
export { RegulatoryReportGenerator } from './components/breach/RegulatoryReportGenerator';
export type { BreachReportFormClassNames, BreachFormSubmission } from './components/breach/BreachReportForm';
export type { BreachRiskAssessmentClassNames } from './components/breach/BreachRiskAssessment';
export type { BreachNotificationManagerClassNames } from './components/breach/BreachNotificationManager';
export type { RegulatoryReportGeneratorClassNames } from './components/breach/RegulatoryReportGenerator';
export type { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from './types/breach';

// Privacy Policy Generator Components
export { PolicyGenerator } from './components/policy/PolicyGenerator';
export type { PolicyGeneratorClassNames } from './components/policy/PolicyGenerator';
export { PolicyPreview } from './components/policy/PolicyPreview';
export type { PolicyPreviewClassNames } from './components/policy/PolicyPreview';
export { PolicyExporter } from './components/policy/PolicyExporter';
export type { PolicyExporterClassNames } from './components/policy/PolicyExporter';
export type { PolicySection, PolicyTemplate, PolicyVariable, OrganizationInfo, PrivacyPolicy } from './types/privacy';

// NDPRProvider
export { NDPRProvider, useNDPRConfig } from './components/NDPRProvider';
export type { NDPRConfig } from './components/NDPRProvider';

// Theme Provider (ergonomic wrapper over --ndpr-* CSS custom properties)
export { NDPRThemeProvider } from './components/theme/NDPRThemeProvider';
export type { NDPRTheme, NDPRThemeProviderProps } from './components/theme/NDPRThemeProvider';

// Utility Functions
export { resolveClass } from './utils/styling';
export {
  validateConsentStructured,
  validateConsentOptionsStructured,
} from './utils/consent';
export type {
  StructuredValidationError,
  StructuredValidationResult,
} from './utils/consent';
export { createAuditEntry, getAuditLog, appendAuditEntry } from './utils/consent-audit';
export type { ConsentAuditEntry } from './utils/consent-audit';
export { formatDSRRequestStructured } from './utils/dsr';
export type { FormatDSRRequestStructuredResult } from './utils/dsr';
export { assessDPIARisk } from './utils/dpia';
export { calculateBreachSeverity } from './utils/breach';
export { generatePolicyText } from './utils/privacy';
export { DEFAULT_POLICY_SECTIONS, DEFAULT_POLICY_VARIABLES, createBusinessPolicyTemplate } from './utils/policy-templates';
export { sanitizeInput } from './utils/sanitize';

// Hooks
export { useConsent } from './hooks/useConsent';
export { useDSR } from './hooks/useDSR';
export { useDPIA } from './hooks/useDPIA';
export type { DPIAAnswerMap, DPIAAnswerValue } from './hooks/useDPIA';
export { useBreach } from './hooks/useBreach';
export { usePrivacyPolicy } from './hooks/usePrivacyPolicy';
export { useDefaultPrivacyPolicy } from './hooks/useDefaultPrivacyPolicy';
export { useComplianceScore } from './hooks/useComplianceScore';
export { useAdaptivePolicyWizard } from './hooks/useAdaptivePolicyWizard';
export { useFocusTrap } from './hooks/useFocusTrap';
export type { UseFocusTrapOptions } from './hooks/useFocusTrap';
export type {
  UseAdaptivePolicyWizardOptions,
  UseAdaptivePolicyWizardReturn,
} from './hooks/useAdaptivePolicyWizard';

// Lawful Basis Tracking Components
export { LawfulBasisTracker } from './components/lawful-basis/LawfulBasisTracker';
export type { LawfulBasisTrackerClassNames } from './components/lawful-basis/LawfulBasisTracker';
export type { LawfulBasis, SensitiveDataCondition, ProcessingActivity, LegitimateInterestAssessment, LawfulBasisSummary } from './types/lawful-basis';

// Lawful Basis Utilities
export { validateProcessingActivity, getLawfulBasisDescription, assessComplianceGaps, generateLawfulBasisSummary } from './utils/lawful-basis';
export type { LawfulBasisComplianceGap, LawfulBasisValidationResult } from './utils/lawful-basis';

// Lawful Basis Hook
export { useLawfulBasis } from './hooks/useLawfulBasis';

// Cross-Border Transfer Components
export { CrossBorderTransferManager } from './components/cross-border/CrossBorderTransferManager';
export type { CrossBorderTransferManagerClassNames } from './components/cross-border/CrossBorderTransferManager';
export type { TransferMechanism, AdequacyStatus, CrossBorderTransfer, TransferImpactAssessment, CrossBorderSummary } from './types/cross-border';

// Cross-Border Transfer Utilities
export { validateTransfer, getTransferMechanismDescription, assessTransferRisk, isNDPCApprovalRequired } from './utils/cross-border';
export type { TransferValidationResult, TransferRiskResult } from './utils/cross-border';

// Cross-Border Transfer Hook
export { useCrossBorderTransfer } from './hooks/useCrossBorderTransfer';

// Record of Processing Activities (ROPA) Components
export { ROPAManager } from './components/ropa/ROPAManager';
export type { ROPAManagerClassNames } from './components/ropa/ROPAManager';
export type { ProcessingRecord, RecordOfProcessingActivities, ROPASummary } from './types/ropa';

// ROPA Utilities
export { validateProcessingRecord, generateROPASummary, exportROPAToCSV, identifyComplianceGaps } from './utils/ropa';
export type { ROPAComplianceGap, ROPAValidationResult } from './utils/ropa';

// ROPA Hook
export { useROPA } from './hooks/useROPA';
export type { UseROPAOptions, UseROPAReturn } from './hooks/useROPA';

// Compliance Dashboard
export { NDPRDashboard } from './components/dashboard/NDPRDashboard';
export type { NDPRDashboardProps, NDPRDashboardClassNames } from './components/dashboard/NDPRDashboard';

// Compliance Score Utility
export { getComplianceScore } from './utils/compliance-score';
export type {
  ComplianceReport,
  ComplianceInput,
  ComplianceRating,
  ModuleScore,
  Recommendation,
  RecommendationPriority,
  EffortLevel,
  RegulatoryReference,
} from './utils/compliance-score';

// Legal notice
export {
  LEGAL_DISCLAIMER_SHORT,
  LEGAL_DISCLAIMER_LONG,
  legalDisclaimerBlock,
} from './utils/legal-notice';
export { LegalNotice } from './components/common/LegalNotice';
export type { LegalNoticeProps } from './components/common/LegalNotice';

// ---------------------------------------------------------------------------
// Component *Props re-exports (3.11.0) — surface the prop interfaces for each
// public component so consumers can write typed wrappers without reaching
// into deep import paths.
// ---------------------------------------------------------------------------
export type { ConsentBannerProps } from './components/consent/ConsentBanner';
export type { ConsentManagerProps } from './components/consent/ConsentManager';
export type { ConsentStorageProps } from './components/consent/ConsentStorage';
export type { DSRRequestFormProps } from './components/dsr/DSRRequestForm';
export type { DSRDashboardProps } from './components/dsr/DSRDashboard';
export type { DSRTrackerProps } from './components/dsr/DSRTracker';
export type { DPIAQuestionnaireProps } from './components/dpia/DPIAQuestionnaire';
export type { DPIAReportProps } from './components/dpia/DPIAReport';
export type { StepIndicatorProps } from './components/dpia/StepIndicator';
export type { BreachReportFormProps } from './components/breach/BreachReportForm';
export type { BreachRiskAssessmentProps } from './components/breach/BreachRiskAssessment';
export type { BreachNotificationManagerProps } from './components/breach/BreachNotificationManager';
export type { RegulatoryReportGeneratorProps } from './components/breach/RegulatoryReportGenerator';
export type { PolicyGeneratorProps } from './components/policy/PolicyGenerator';
export type { PolicyPreviewProps } from './components/policy/PolicyPreview';
export type { PolicyExporterProps } from './components/policy/PolicyExporter';
export type { LawfulBasisTrackerProps } from './components/lawful-basis/LawfulBasisTracker';
export type { CrossBorderTransferManagerProps } from './components/cross-border/CrossBorderTransferManager';
export type { ROPAManagerProps } from './components/ropa/ROPAManager';

// ---------------------------------------------------------------------------
// Adapter types (3.11.0) — surface from the root entry so consumers building
// custom adapters don't need to import from /adapters.
// ---------------------------------------------------------------------------
export type { StorageAdapter } from './adapters/types';
export type {
  ApiAdapterOptions,
  ApiAdapterErrorContext,
  ApiAdapterSuccessContext,
  ApiAdapterRetryConfig,
  ApiAdapterMethod,
} from './adapters/api';
export type { CookieAdapterOptions } from './adapters/cookie';

// ---------------------------------------------------------------------------
// DSR server-side validation types — also reachable from /server. Re-exported
// here so the validator's types are discoverable from the default entry as well.
// ---------------------------------------------------------------------------
export { validateDsrSubmissionStructured } from './utils/dsr';
export type {
  DsrSubmissionPayload,
  ValidateDsrSubmissionOptions,
} from './utils/dsr';
