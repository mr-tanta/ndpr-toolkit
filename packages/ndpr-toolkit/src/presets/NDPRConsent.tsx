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

export interface NDPRConsentProps {
  extraOptions?: ConsentOption[];
  options?: ConsentOption[];
  adapter?: StorageAdapter<ConsentSettings>;
  position?: 'top' | 'bottom' | 'center' | 'inline';
  classNames?: ConsentBannerClassNames;
  unstyled?: boolean;
  onSave?: (settings: ConsentSettings) => void;
}

export const NDPRConsent: React.FC<NDPRConsentProps> = ({
  extraOptions = [], options, adapter, position = 'bottom',
  classNames, unstyled, onSave,
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
    />
  );
};
