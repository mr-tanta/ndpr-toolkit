/**
 * Core module — cross-cutting types, utilities, locales, and the NDPRProvider.
 *
 * What this entry contains:
 * - All NDPA-related TypeScript types (no runtime cost in JS).
 * - Pure validators / generators (validateConsent, generatePolicyText, etc.).
 * - Locale data (defaultLocale, yorubaLocale, ...) and the mergeLocale helper.
 * - NDPRProvider plus its `useNDPRConfig` / `useNDPRLocale` hooks. These
 *   pull in React Context — they are *client-only* and bring React into the
 *   import graph wherever this entry is consumed.
 *
 * RSC guidance:
 * Importing `validateConsent` (or any pure utility above) from a Server
 * Component file is fine — bundlers tree-shake the Provider out of the
 * server bundle as long as you do not also call the hooks. For a strictly
 * zero-React surface (no Provider, no hooks, no transitive React import),
 * use `@tantainnovative/ndpr-toolkit/server`.
 *
 * @example
 *   import { validateConsent } from '@tantainnovative/ndpr-toolkit/core';
 *   import { NDPRProvider } from '@tantainnovative/ndpr-toolkit'; // root entry
 */

// All types
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';
export type { DSRRequest, RequestType, DSRStatus, DSRType, RequestStatus } from './types/dsr';
export type { DPIAQuestion, DPIASection, DPIAResult, DPIARisk } from './types/dpia';
export type { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from './types/breach';
export type { PolicySection, PolicyTemplate, PolicyVariable, OrganizationInfo, PrivacyPolicy } from './types/privacy';
export type { LawfulBasis, SensitiveDataCondition, ProcessingActivity, LegitimateInterestAssessment, LawfulBasisSummary } from './types/lawful-basis';
export type { TransferMechanism, AdequacyStatus, CrossBorderTransfer, TransferImpactAssessment, CrossBorderSummary } from './types/cross-border';
export type { ProcessingRecord, RecordOfProcessingActivities, ROPASummary } from './types/ropa';
export type { LawfulBasisComplianceGap, LawfulBasisValidationResult } from './utils/lawful-basis';
export type { TransferValidationResult, TransferRiskResult } from './utils/cross-border';
export type { ROPAComplianceGap, ROPAValidationResult } from './utils/ropa';

// NDPRProvider
export { NDPRProvider, useNDPRConfig, useNDPRLocale } from './components/NDPRProvider';
export type { NDPRConfig } from './components/NDPRProvider';

// i18n locale support
export type { NDPRLocale } from './types/locale';
export { defaultLocale } from './locales/en';
export { yorubaLocale } from './locales/yo';
export { igboLocale } from './locales/ig';
export { hausaLocale } from './locales/ha';
export { pidginLocale } from './locales/pcm';
export { mergeLocale } from './utils/locale';

// All utility functions
export { validateConsent, validateConsentOptions } from './utils/consent';
export { createAuditEntry, getAuditLog, appendAuditEntry } from './utils/consent-audit';
export type { ConsentAuditEntry } from './utils/consent-audit';
export { formatDSRRequest, validateDsrSubmission } from './utils/dsr';
export type {
  DsrSubmissionPayload,
  DsrSubmissionValidationResult,
  ValidateDsrSubmissionOptions,
} from './utils/dsr';
export { assessDPIARisk } from './utils/dpia';
export { calculateBreachSeverity } from './utils/breach';
export { generatePolicyText, findUnfilledTokens } from './utils/privacy';
export { DEFAULT_POLICY_SECTIONS, DEFAULT_POLICY_VARIABLES, createBusinessPolicyTemplate } from './utils/policy-templates';
export { validateProcessingActivity, getLawfulBasisDescription, assessComplianceGaps, generateLawfulBasisSummary } from './utils/lawful-basis';
export { validateTransfer, getTransferMechanismDescription, assessTransferRisk, isNDPCApprovalRequired } from './utils/cross-border';
export { validateProcessingRecord, generateROPASummary, exportROPAToCSV, identifyComplianceGaps } from './utils/ropa';
export { sanitizeInput } from './utils/sanitize';

// Policy engine types
export type { TemplateContext, PolicyDraft, ComplianceResult, ComplianceGap, CustomSection, DataCategory, ThirdPartyProcessor } from './types/policy-engine';
export { createDefaultContext } from './types/policy-engine';
export { evaluatePolicyCompliance } from './utils/policy-compliance';
export { assemblePolicy } from './utils/policy-sections';

// Compliance score engine
export { getComplianceScore } from './utils/compliance-score';
export type {
  ComplianceInput, ComplianceReport, ComplianceRating,
  ModuleScore, Recommendation, RegulatoryReference,
  RecommendationPriority, EffortLevel,
} from './utils/compliance-score';
