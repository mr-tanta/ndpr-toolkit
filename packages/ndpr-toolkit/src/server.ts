/**
 * Server entry — RSC-safe pure logic surface.
 *
 * This entry exports ONLY pure types, validators, generators, scoring
 * engines, default data, locales, and storage adapters. It contains no
 * React components, no React hooks, no NDPRProvider, and no transitive
 * dependency on React or react-dom. Importing this entry from a Server
 * Component, Edge Function, Node script, or Cloudflare Worker is safe
 * and does not pull React into the server bundle.
 *
 * Use cases:
 * - Validating DSR / consent / breach payloads in a Next.js Route Handler
 *   or NestJS controller.
 * - Generating localised privacy-policy text server-side and persisting
 *   the rendered output.
 * - Computing a compliance score in a scheduled job.
 * - Running compliance checks in CI pipelines without bundling React.
 *
 * @example
 * ```ts
 * // app/api/dsr/route.ts (Next.js Server Action)
 * import { formatDSRRequest, sanitizeInput } from '@tantainnovative/ndpr-toolkit/server';
 * ```
 *
 * If you need React components or hooks, import from the package root,
 * `/index`, or one of the feature subpaths (`/consent`, `/dsr`, etc.).
 */

// ---------------------------------------------------------------------------
// Types — zero runtime cost
// ---------------------------------------------------------------------------

export type {
  ConsentOption,
  ConsentSettings,
  ConsentStorageOptions,
  LawfulBasisType,
} from './types/consent';

export type {
  DSRRequest,
  RequestType,
  DSRStatus,
  DSRType,
  RequestStatus,
} from './types/dsr';

export type {
  DPIAQuestion,
  DPIASection,
  DPIAResult,
  DPIARisk,
} from './types/dpia';

export type {
  BreachReport,
  BreachCategory,
  RiskAssessment,
  NotificationRequirement,
  RegulatoryNotification,
} from './types/breach';

export type {
  PolicySection,
  PolicyTemplate,
  PolicyVariable,
  OrganizationInfo,
  PrivacyPolicy,
} from './types/privacy';

export type {
  LawfulBasis,
  SensitiveDataCondition,
  ProcessingActivity,
  LegitimateInterestAssessment,
  LawfulBasisSummary,
} from './types/lawful-basis';

export type {
  TransferMechanism,
  AdequacyStatus,
  CrossBorderTransfer,
  TransferImpactAssessment,
  CrossBorderSummary,
} from './types/cross-border';

export type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  ROPASummary,
} from './types/ropa';

export type {
  TemplateContext,
  PolicyDraft,
  ComplianceResult,
  ComplianceGap,
  CustomSection,
  DataCategory,
  ThirdPartyProcessor,
  Industry,
  OrgSize,
  ProcessingPurpose,
  HTMLExportOptions,
  PDFExportOptions,
  DOCXExportOptions,
} from './types/policy-engine';

export type { NDPRLocale } from './types/locale';

export type {
  LawfulBasisComplianceGap,
  LawfulBasisValidationResult,
} from './utils/lawful-basis';

export type {
  TransferValidationResult,
  TransferRiskResult,
} from './utils/cross-border';

export type {
  ROPAComplianceGap,
  ROPAValidationResult,
} from './utils/ropa';

export type { ConsentAuditEntry } from './utils/consent-audit';

export type {
  ComplianceInput,
  ComplianceReport,
  ComplianceRating,
  ModuleScore,
  Recommendation,
  RegulatoryReference,
  RecommendationPriority,
  EffortLevel,
} from './utils/compliance-score';

export type { StorageAdapter } from './adapters/types';

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

export { validateConsent, validateConsentOptions } from './utils/consent';
export {
  validateProcessingActivity,
  getLawfulBasisDescription,
  assessComplianceGaps,
  generateLawfulBasisSummary,
} from './utils/lawful-basis';
export {
  validateTransfer,
  getTransferMechanismDescription,
  assessTransferRisk,
  isNDPCApprovalRequired,
} from './utils/cross-border';
export {
  validateProcessingRecord,
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
} from './utils/ropa';

// ---------------------------------------------------------------------------
// Domain utilities
// ---------------------------------------------------------------------------

export { formatDSRRequest, validateDsrSubmission } from './utils/dsr';
export type {
  DsrSubmissionPayload,
  DsrSubmissionValidationResult,
  ValidateDsrSubmissionOptions,
} from './utils/dsr';
export { assessDPIARisk } from './utils/dpia';
export { calculateBreachSeverity } from './utils/breach';
export {
  createAuditEntry,
  getAuditLog,
  appendAuditEntry,
} from './utils/consent-audit';
export { sanitizeInput } from './utils/sanitize';

// ---------------------------------------------------------------------------
// Privacy-policy generation, compliance, and export
// ---------------------------------------------------------------------------

export { generatePolicyText, findUnfilledTokens } from './utils/privacy';
export {
  DEFAULT_POLICY_SECTIONS,
  DEFAULT_POLICY_VARIABLES,
  createBusinessPolicyTemplate,
} from './utils/policy-templates';
export {
  assemblePolicy,
  UNFILLED_PREFIX,
  UNFILLED_SUFFIX,
} from './utils/policy-sections';
export { evaluatePolicyCompliance } from './utils/policy-compliance';
export { createDefaultContext, DEFAULT_DATA_CATEGORIES } from './types/policy-engine';

// Policy export — produces HTML / Markdown / DOCX / PDF buffers from a typed
// PrivacyPolicy. Pure functions, no DOM or React required.
export {
  exportHTML,
  exportMarkdown,
  exportDOCX,
  exportPDF,
} from './utils/policy-export';

// ---------------------------------------------------------------------------
// Compliance scoring
// ---------------------------------------------------------------------------

export { getComplianceScore } from './utils/compliance-score';

// ---------------------------------------------------------------------------
// i18n locales — pure data, useful for server-rendered emails / PDFs
// ---------------------------------------------------------------------------

export { defaultLocale } from './locales/en';
export { yorubaLocale } from './locales/yo';
export { igboLocale } from './locales/ig';
export { hausaLocale } from './locales/ha';
export { pidginLocale } from './locales/pcm';
export { mergeLocale } from './utils/locale';

// ---------------------------------------------------------------------------
// Storage adapters — useful for custom server-side persistence (e.g. via the
// API adapter). Browser-targeted adapters guard window access at runtime, so
// importing them server-side is safe; only invocation in a non-browser env
// is a no-op.
// ---------------------------------------------------------------------------

export { localStorageAdapter } from './adapters/local-storage';
export { sessionStorageAdapter } from './adapters/session-storage';
export { cookieAdapter } from './adapters/cookie';
export { apiAdapter } from './adapters/api';
export { memoryAdapter } from './adapters/memory';
export { composeAdapters } from './adapters/compose';
