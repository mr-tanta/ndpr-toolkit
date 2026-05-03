import { useEffect, useRef } from 'react';
import { usePrivacyPolicy, UsePrivacyPolicyReturn } from './usePrivacyPolicy';
import { createBusinessPolicyTemplate } from '../utils/policy-templates';
import { OrganizationInfo, PolicyTemplate, PrivacyPolicy } from '../types/privacy';
import type { StorageAdapter } from '../adapters/types';

interface UseDefaultPrivacyPolicyOptions {
  /**
   * Organisation information to pre-fill into the policy. When provided and
   * `autoGenerate` is true (the default), the hook will auto-select the
   * default template and generate a renderable policy on first commit, so
   * `policy` is non-null on the first useful render.
   */
  orgInfo?: {
    /** Organisation name (maps to `organizationInfo.name` and `orgName` variable) */
    name?: string;
    /** Privacy contact email (maps to `privacyEmail`) */
    email?: string;
    /** Organisation website URL */
    website?: string;
    /** Physical address */
    address?: string;
    /** Industry / sector descriptor */
    industry?: string;
    /** Data Protection Officer name */
    dpoName?: string;
    /** DPO email address */
    dpoEmail?: string;
  };

  /**
   * Whether the hook should auto-select the default template and generate
   * the policy as soon as it's mounted with `orgInfo`. Set to false to
   * retain manual control via `selectTemplate` / `generatePolicy`.
   * @default true
   */
  autoGenerate?: boolean;

  /**
   * Storage key for policy data.
   * @default "ndpr_privacy_policy"
   */
  storageKey?: string;

  /**
   * Whether to persist policy data in storage. When `false`, the hook
   * uses an in-memory no-op adapter and nothing survives a page reload.
   * @default true
   */
  persist?: boolean;

  /**
   * @deprecated Renamed to `persist` in v3.5.0 — `useLocalStorage` is
   * still accepted for backward compatibility and will be removed in
   * v4.0. Use `persist` (or pass an explicit `adapter`) instead.
   * @default true
   */
  useLocalStorage?: boolean;

  /**
   * Pluggable storage adapter. When provided, takes precedence over
   * storageKey/persist/useLocalStorage.
   */
  adapter?: StorageAdapter<PrivacyPolicy>;
}

const DEFAULT_TEMPLATE_ID = 'default-business';

/**
 * Format a Date for the contact-info section's `{{effectiveDate}}` token.
 * Uses the en-NG locale to match the rest of the toolkit's date rendering.
 */
function formatEffectiveDate(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildTemplate(
  orgInfo: UseDefaultPrivacyPolicyOptions['orgInfo'],
): PolicyTemplate {
  const { sections, variables } = createBusinessPolicyTemplate();

  // Pre-fill template variable defaults from orgInfo so the rendered
  // template has values even before the consumer wires up an editor UI.
  const variableOverrides: Record<string, string> = {};
  if (orgInfo) {
    if (orgInfo.name) variableOverrides.orgName = orgInfo.name;
    if (orgInfo.email) variableOverrides.privacyEmail = orgInfo.email;
    if (orgInfo.website) variableOverrides.website = orgInfo.website;
    if (orgInfo.address) variableOverrides.address = orgInfo.address;
    if (orgInfo.industry) variableOverrides.industry = orgInfo.industry;
    if (orgInfo.dpoName) variableOverrides.dpoName = orgInfo.dpoName;
    if (orgInfo.dpoEmail) variableOverrides.dpoEmail = orgInfo.dpoEmail;
  }
  // v3.4.1: auto-default effectiveDate so the contact-info section's
  // `This policy is effective as of {{effectiveDate}}` line renders today's
  // date instead of an empty string. Consumers who want a different date
  // can still override via updateVariableValue('effectiveDate', '...').
  if (!variableOverrides.effectiveDate) {
    variableOverrides.effectiveDate = formatEffectiveDate(new Date());
  }

  return {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Default Business Policy',
    description: 'NDPA-compliant privacy policy template for businesses.',
    organizationType: 'business',
    sections,
    variables: Object.fromEntries(
      variables.map((v) => [
        v.name,
        {
          name: v.name,
          description: v.description,
          required: v.required,
          defaultValue: variableOverrides[v.name] || v.value || undefined,
        },
      ]),
    ),
    version: '1.0',
    lastUpdated: Date.now(),
    ndpaCompliant: true,
  };
}

function orgInfoToOrganizationInfo(
  orgInfo: UseDefaultPrivacyPolicyOptions['orgInfo'],
): Partial<OrganizationInfo> {
  if (!orgInfo) return {};
  const out: Partial<OrganizationInfo> = {};
  if (orgInfo.name) out.name = orgInfo.name;
  if (orgInfo.email) out.privacyEmail = orgInfo.email;
  if (orgInfo.website) out.website = orgInfo.website;
  if (orgInfo.address) out.address = orgInfo.address;
  if (orgInfo.industry) out.industry = orgInfo.industry;
  if (orgInfo.dpoName) out.dpoName = orgInfo.dpoName;
  if (orgInfo.dpoEmail) out.dpoEmail = orgInfo.dpoEmail;
  return out;
}

/**
 * Convenience wrapper around `usePrivacyPolicy`. With `orgInfo` provided
 * and `autoGenerate` enabled (default), `policy` is non-null on the first
 * post-load render — no manual `selectTemplate` / `generatePolicy` chaining
 * required.
 *
 * @example
 * ```tsx
 * const { policy } = useDefaultPrivacyPolicy({
 *   orgInfo: { name: 'Acme Ltd', email: 'privacy@acme.ng' }
 * });
 * return policy ? <PolicyPage policy={policy} /> : <Spinner />;
 * ```
 */
export function useDefaultPrivacyPolicy(
  options: UseDefaultPrivacyPolicyOptions = {},
): UsePrivacyPolicyReturn {
  const { orgInfo, autoGenerate = true, storageKey, persist, useLocalStorage, adapter } = options;
  // v3.5.0: `persist` is the canonical name; `useLocalStorage` is the
  // deprecated alias. Either may be passed; explicit values win, default true.
  const persistResolved = persist ?? useLocalStorage ?? true;

  // Build the template once per mount. Re-running on every render would
  // discard the user's edits to `template.variables` because we'd hand a
  // fresh PolicyTemplate object to usePrivacyPolicy each time.
  const templateRef = useRef<PolicyTemplate | null>(null);
  if (templateRef.current === null) {
    templateRef.current = buildTemplate(orgInfo);
  }

  const result = usePrivacyPolicy({
    templates: [templateRef.current],
    adapter,
    storageKey,
    persist: persistResolved,
  });

  // Auto-init runs in two phases because generatePolicy reads
  // `organizationInfo` from its callback closure, so it must run on a
  // render *after* updateOrganizationInfo / selectTemplate have committed.
  //
  // Phase 1 (after first load): seed organizationInfo + select template.
  // Phase 2 (after seed commits): generate the policy.
  const seededRef = useRef(false);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (!autoGenerate) return;
    if (result.isLoading) return;
    if (seededRef.current) return;

    // Bypass the React state race for rehydration detection by checking
    // the storage source directly. usePrivacyPolicy may have set
    // isLoading=false in the same commit as setPolicy(rehydrated), but
    // depending on the React/jsdom version the two state updates may
    // not arrive in our closure together. Reading localStorage is
    // synchronous and authoritative — if a saved policy exists, the
    // rehydration is either complete or imminent and we must not
    // generate a competing one.
    const usingDefaultLocalStorage =
      !adapter &&
      persistResolved !== false &&
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined';
    if (usingDefaultLocalStorage) {
      try {
        if (window.localStorage.getItem(storageKey ?? 'ndpr_privacy_policy')) {
          seededRef.current = true;
          generatedRef.current = true;
          return;
        }
      } catch {
        /* storage access blocked — fall through to the React-state check */
      }
    }

    // If a policy was rehydrated and already committed, don't clobber it.
    if (result.policy) {
      seededRef.current = true;
      generatedRef.current = true;
      return;
    }
    seededRef.current = true;

    const overrides = orgInfoToOrganizationInfo(orgInfo);
    if (Object.keys(overrides).length > 0) {
      result.updateOrganizationInfo(overrides);
    }
    if (!result.selectedTemplate) {
      result.selectTemplate(DEFAULT_TEMPLATE_ID);
    }
    // Phase 2 runs in the effect below once selectedTemplate + organizationInfo
    // have been committed by React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, result.isLoading]);

  useEffect(() => {
    if (!autoGenerate) return;
    if (generatedRef.current) return;
    if (!seededRef.current) return;
    if (!result.selectedTemplate) return;
    // selectTemplate snapshots organizationInfo into policy at call time
    // (with empty values, before our seed has committed). We must wait for
    // organizationInfo state to match the seeded values, then regenerate so
    // the persisted policy carries the right org info.
    const seededName = orgInfo?.name ?? '';
    if (seededName && result.organizationInfo.name !== seededName) return;
    generatedRef.current = true;
    result.generatePolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, result.selectedTemplate, result.organizationInfo]);

  return result;
}
