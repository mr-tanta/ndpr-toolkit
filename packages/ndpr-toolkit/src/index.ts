// Consent Management Components
export { ConsentBanner } from './components/consent/ConsentBanner';
export { ConsentManager } from './components/consent/ConsentManager';
export { ConsentStorage } from './components/consent/ConsentStorage';
export type { ConsentBannerClassNames } from './components/consent/ConsentBanner';
export type { ConsentManagerClassNames } from './components/consent/ConsentManager';
export type { ConsentStorageClassNames } from './components/consent/ConsentStorage';
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';

// Data Subject Rights Components
export { DSRRequestForm } from './components/dsr/DSRRequestForm';
export { DSRDashboard } from './components/dsr/DSRDashboard';
export { DSRTracker } from './components/dsr/DSRTracker';
export type { DSRRequestFormClassNames } from './components/dsr/DSRRequestForm';
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
export type { BreachReportFormClassNames } from './components/breach/BreachReportForm';
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

// Utility Functions
export { resolveClass } from './utils/styling';
export { validateConsent, validateConsentOptions } from './utils/consent';
export { formatDSRRequest } from './utils/dsr';
export { assessDPIARisk } from './utils/dpia';
export { calculateBreachSeverity } from './utils/breach';
export { generatePolicyText } from './utils/privacy';

// Hooks
export { useConsent } from './hooks/useConsent';
export { useDSR } from './hooks/useDSR';
export { useDPIA } from './hooks/useDPIA';
export { useBreach } from './hooks/useBreach';
export { usePrivacyPolicy } from './hooks/usePrivacyPolicy';

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
