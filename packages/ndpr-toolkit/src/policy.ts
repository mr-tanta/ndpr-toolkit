/**
 * Privacy Policy Generator module
 * NDPA-compliant privacy policy templates and generation
 */
export { PolicyGenerator } from './components/policy/PolicyGenerator';
export { PolicyPreview } from './components/policy/PolicyPreview';
export { PolicyExporter } from './components/policy/PolicyExporter';
export { usePrivacyPolicy } from './hooks/usePrivacyPolicy';
export { generatePolicyText } from './utils/privacy';
export { DEFAULT_POLICY_SECTIONS, DEFAULT_POLICY_VARIABLES, createBusinessPolicyTemplate } from './utils/policy-templates';
export type { PolicySection, PolicyTemplate, PolicyVariable, OrganizationInfo, PrivacyPolicy } from './types/privacy';
