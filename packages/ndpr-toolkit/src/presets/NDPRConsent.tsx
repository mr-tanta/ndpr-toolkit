import React from 'react';
import { ConsentBanner } from '../components/consent/ConsentBanner';
import type { ConsentBannerClassNames } from '../components/consent/ConsentBanner';
import type { ConsentOption, ConsentSettings } from '../types/consent';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_OPTIONS: ConsentOption[] = [
  { id: 'essential', label: 'Essential Cookies', description: 'Required for basic site functionality. Cannot be disabled.', required: true, purpose: 'Site operation' },
  { id: 'analytics', label: 'Analytics', description: 'Help us understand how visitors use our site to improve the experience.', required: false, purpose: 'Usage analytics' },
  { id: 'marketing', label: 'Marketing', description: 'Used to deliver relevant advertisements and track campaign effectiveness.', required: false, purpose: 'Targeted advertising' },
  { id: 'preferences', label: 'Preferences', description: 'Remember your settings and preferences for a personalised experience.', required: false, purpose: 'Personalisation' },
];

/**
 * UX copy overrides for the NDPRConsent preset. Pass any subset to
 * replace the default text without dropping to the lower-level
 * `<ConsentBanner>` API. Strings you omit fall back to the toolkit
 * defaults (which already cite NDPA Section 26).
 *
 * @example
 *   <NDPRConsent copy={{
 *     title: 'Cookie preferences',
 *     description: 'Acme uses cookies to keep you signed in and improve our store.',
 *     acceptAll: 'Allow all',
 *     rejectAll: 'Only essentials',
 *   }} />
 */
export interface NDPRConsentCopy {
  /** Banner heading. Default: "We Value Your Privacy" */
  title?: string;
  /** Body paragraph under the heading. Default cites NDPA Section 26. */
  description?: string;
  /** Primary CTA — accepts all categories. Default: "Accept All" */
  acceptAll?: string;
  /** Secondary CTA — rejects all non-essential categories. Default: "Reject All" */
  rejectAll?: string;
  /** Tertiary CTA — opens the per-category controls. Default: "Customize" */
  customize?: string;
  /** Submit button on the per-category panel. Default: "Save Preferences" */
  save?: string;
}

export interface NDPRConsentProps {
  extraOptions?: ConsentOption[];
  options?: ConsentOption[];
  adapter?: StorageAdapter<ConsentSettings>;
  position?: 'top' | 'bottom' | 'center' | 'inline';
  classNames?: ConsentBannerClassNames;
  unstyled?: boolean;
  onSave?: (settings: ConsentSettings) => void;
  /**
   * UX copy overrides — see {@link NDPRConsentCopy}. Lets you brand the
   * banner without dropping to the lower-level `<ConsentBanner>` API.
   */
  copy?: NDPRConsentCopy;
}

export const NDPRConsent: React.FC<NDPRConsentProps> = ({
  extraOptions = [], options, adapter, position = 'bottom',
  classNames, unstyled, onSave, copy,
}) => {
  const resolvedOptions = options ?? [...DEFAULT_OPTIONS, ...extraOptions];
  const handleSave = (settings: ConsentSettings) => {
    if (adapter) adapter.save(settings);
    onSave?.(settings);
  };
  return (
    <ConsentBanner
      options={resolvedOptions}
      onSave={handleSave}
      position={position}
      classNames={classNames}
      unstyled={unstyled}
      manageStorage={!adapter}
      title={copy?.title}
      description={copy?.description}
      acceptAllButtonText={copy?.acceptAll}
      rejectAllButtonText={copy?.rejectAll}
      customizeButtonText={copy?.customize}
      saveButtonText={copy?.save}
    />
  );
};
