import { usePrivacyPolicy } from './usePrivacyPolicy';
import { createBusinessPolicyTemplate } from '../utils/policy-templates';
import { PolicyTemplate } from '../types/privacy';

interface UseDefaultPrivacyPolicyOptions {
  /**
   * Organisation information to pre-fill into the policy variables.
   */
  orgInfo?: {
    /** Organisation name */
    name?: string;
    /** Privacy contact email */
    email?: string;
    /** Data Protection Officer name */
    dpoName?: string;
  };

  /**
   * Storage key for policy data.
   * @default "ndpr_privacy_policy"
   */
  storageKey?: string;

  /**
   * Whether to persist policy data in local storage.
   * @default true
   */
  useLocalStorage?: boolean;
}

/**
 * Convenience wrapper around `usePrivacyPolicy` that automatically
 * loads the default NDPA-compliant business policy template and
 * pre-fills common organisation variables.
 *
 * @example
 * ```tsx
 * const policy = useDefaultPrivacyPolicy({
 *   orgInfo: { name: 'Acme Ltd', email: 'privacy@acme.ng', dpoName: 'Jane Doe' }
 * });
 * ```
 */
export function useDefaultPrivacyPolicy(options: UseDefaultPrivacyPolicyOptions = {}) {
  const { orgInfo, storageKey, useLocalStorage } = options;
  const { sections, variables } = createBusinessPolicyTemplate();

  // Pre-fill org info into variables if provided
  if (orgInfo) {
    for (const variable of variables) {
      if (orgInfo.name && variable.name === 'orgName') {
        variable.value = orgInfo.name;
      }
      if (orgInfo.email && variable.name === 'privacyEmail') {
        variable.value = orgInfo.email;
      }
      if (orgInfo.dpoName && variable.name === 'dpoName') {
        variable.value = orgInfo.dpoName;
      }
    }
  }

  // Build a PolicyTemplate from the defaults so usePrivacyPolicy can consume it
  const template: PolicyTemplate = {
    id: 'default-business',
    name: 'Default Business Policy',
    description: 'NDPA-compliant privacy policy template for businesses.',
    organizationType: 'business',
    sections,
    variables: Object.fromEntries(
      variables.map(v => [
        v.name,
        {
          name: v.name,
          description: v.description,
          required: v.required,
          defaultValue: v.value || undefined,
        },
      ])
    ),
    version: '1.0',
    lastUpdated: Date.now(),
    ndpaCompliant: true,
  };

  return usePrivacyPolicy({
    templates: [template],
    storageKey,
    useLocalStorage,
  });
}
