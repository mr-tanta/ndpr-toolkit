import React from 'react';
import { useConsentCompound } from './context';
import { resolveClass } from '../../utils/styling';

export interface SaveButtonProps {
  children?: React.ReactNode;
  className?: string;
  unstyled?: boolean;
  consents?: Record<string, boolean>;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ children, className, unstyled, consents }) => {
  const { updateConsent, options } = useConsentCompound();
  const handleClick = () => {
    if (consents) {
      updateConsent(consents);
    } else {
      const defaults: Record<string, boolean> = {};
      options.forEach(opt => { defaults[opt.id] = opt.required || false; });
      updateConsent(defaults);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={resolveClass(
        'ndpr-consent-banner__button ndpr-consent-banner__button--primary',
        className, unstyled
      )}
      data-ndpr-component="consent-save-button"
    >
      {children ?? 'Save Preferences'}
    </button>
  );
};
