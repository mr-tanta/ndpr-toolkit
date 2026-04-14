/**
 * Hooks module — React hooks only.
 * Requires React as a peer dependency. No UI component dependencies.
 *
 * Usage: import { useConsent, useLawfulBasis } from '@tantainnovative/ndpr-toolkit/hooks'
 */

// Re-export all types needed by hooks
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';
export type { DSRRequest, DSRType, DSRStatus } from './types/dsr';
export type { DPIAResult, DPIARisk } from './types/dpia';
export type { BreachReport, RiskAssessment, NotificationRequirement } from './types/breach';
export type { PrivacyPolicy, PolicySection, OrganizationInfo } from './types/privacy';
export type { LawfulBasis, ProcessingActivity, LawfulBasisSummary } from './types/lawful-basis';
export type { CrossBorderTransfer, CrossBorderSummary } from './types/cross-border';
export type { ProcessingRecord, RecordOfProcessingActivities, ROPASummary } from './types/ropa';

// All hooks
export { useConsent } from './hooks/useConsent';
export { useDSR } from './hooks/useDSR';
export { useDPIA } from './hooks/useDPIA';
export { useBreach } from './hooks/useBreach';
export { usePrivacyPolicy } from './hooks/usePrivacyPolicy';
export { useDefaultPrivacyPolicy } from './hooks/useDefaultPrivacyPolicy';
export { useLawfulBasis } from './hooks/useLawfulBasis';
export { useCrossBorderTransfer } from './hooks/useCrossBorderTransfer';
export { useROPA } from './hooks/useROPA';
export type { UseROPAOptions, UseROPAReturn } from './hooks/useROPA';

// Compliance score
export { useComplianceScore } from './hooks/useComplianceScore';
export type { ComplianceInput, ComplianceReport } from './utils/compliance-score';
