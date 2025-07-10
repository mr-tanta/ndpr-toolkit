import React from 'react';
import { useConsent } from '@/contexts/ConsentContext';

export interface UnstyledConsentToggleProps {
  category: 'analytics' | 'marketing' | 'functional';
  className?: string;
  label?: string;
}

export const UnstyledConsentToggle: React.FC<UnstyledConsentToggleProps> = ({
  category,
  className,
  label,
}) => {
  const { consentState, updateConsent } = useConsent();

  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={consentState[category]}
        onChange={(e) => updateConsent(category, e.target.checked)}
        aria-label={label || `Toggle ${category} cookies`}
      />
      {label && <span>{label}</span>}
    </label>
  );
};