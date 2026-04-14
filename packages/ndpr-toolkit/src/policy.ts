/**
 * Privacy Policy Generator module
 * NDPA-compliant privacy policy templates and generation
 */
export { PolicyGenerator } from './components/policy/PolicyGenerator';
export { PolicyPreview } from './components/policy/PolicyPreview';
export { PolicyExporter } from './components/policy/PolicyExporter';
export { usePrivacyPolicy } from './hooks/usePrivacyPolicy';
export { useDefaultPrivacyPolicy } from './hooks/useDefaultPrivacyPolicy';
export { generatePolicyText } from './utils/privacy';
export { DEFAULT_POLICY_SECTIONS, DEFAULT_POLICY_VARIABLES, createBusinessPolicyTemplate } from './utils/policy-templates';
export type { PolicySection, PolicyTemplate, PolicyVariable, OrganizationInfo, PrivacyPolicy } from './types/privacy';
export { Policy } from './components/policy/compound';
export { PolicyProvider } from './components/policy/Provider';
export type { PolicyProviderProps } from './components/policy/Provider';
export { usePolicyCompound } from './components/policy/context';
export type { StorageAdapter } from './adapters/types';

// Adaptive Policy Wizard (v3.1)
export { AdaptivePolicyWizard } from './components/policy/AdaptivePolicyWizard';
export { PolicyPage } from './components/policy/PolicyPage';
export { useAdaptivePolicyWizard } from './hooks/useAdaptivePolicyWizard';
export type { UseAdaptivePolicyWizardOptions, UseAdaptivePolicyWizardReturn } from './hooks/useAdaptivePolicyWizard';
export { evaluatePolicyCompliance } from './utils/policy-compliance';
export { assemblePolicy } from './utils/policy-sections';
export { exportPDF, exportDOCX, exportHTML, exportMarkdown } from './utils/policy-export';
export type { TemplateContext, PolicyDraft, ComplianceResult, ComplianceGap, CustomSection, DataCategory, ThirdPartyProcessor, Industry, OrgSize, ProcessingPurpose } from './types/policy-engine';
export { createDefaultContext, DEFAULT_DATA_CATEGORIES } from './types/policy-engine';
