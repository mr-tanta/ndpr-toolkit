import React, { useMemo } from 'react';
import { AdaptivePolicyWizard } from '../components/policy/AdaptivePolicyWizard';
import type { PrivacyPolicy } from '../types/privacy';
import type { StorageAdapter } from '../adapters/types';
import type { PolicyDraft, TemplateContext } from '../types/policy-engine';
import {
  templateContextFor,
  type OrgPolicyTemplateId,
  type OrgPolicyTemplateOverrides,
} from '../utils/policy-templates-orgs';

export interface NDPRPrivacyPolicyProps {
  adapter?: StorageAdapter<PolicyDraft>;
  onComplete?: (policy: PrivacyPolicy) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;

  /**
   * Pre-fill the policy wizard with a sector-specific starter template.
   *
   * Pass one of `'saas' | 'ecommerce' | 'school' | 'healthcare' |
   * 'procurement'` and the wizard opens already populated with the data
   * categories, lawful-basis defaults, sensitive-data / children /
   * cross-border / automated-decisions flags that org type usually needs.
   * The user can still flip every flag and rewrite every section.
   *
   * @example
   *   <NDPRPrivacyPolicy
   *     template="healthcare"
   *     templateOverrides={{ orgName: 'Lagos Heart Centre' }}
   *   />
   *
   * @see templateContextFor in `/server` or `/core` for the underlying
   *   factory if you'd rather build the context yourself.
   */
  template?: OrgPolicyTemplateId;

  /**
   * Organisation-level overrides applied on top of the chosen template.
   * Ignored when `template` is unset.
   */
  templateOverrides?: OrgPolicyTemplateOverrides;

  /**
   * Pass a fully-constructed `TemplateContext` to skip the template
   * lookup entirely. Takes precedence over `template` if both are set.
   */
  initialContext?: TemplateContext;
}

export const NDPRPrivacyPolicy: React.FC<NDPRPrivacyPolicyProps> = ({
  template,
  templateOverrides,
  initialContext,
  ...rest
}) => {
  // Compute the seed context once. If `initialContext` is supplied we
  // use it directly; otherwise we resolve from `template` + overrides.
  // Memoised so resizing the parent doesn't re-seed and clobber the
  // user's in-progress wizard state.
  const seedContext = useMemo<TemplateContext | undefined>(() => {
    if (initialContext) return initialContext;
    if (template) return templateContextFor(template, templateOverrides);
    return undefined;
  }, [initialContext, template, templateOverrides]);

  return <AdaptivePolicyWizard {...rest} initialContext={seedContext} />;
};
