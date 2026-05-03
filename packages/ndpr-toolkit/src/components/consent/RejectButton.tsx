import React from 'react';
import { useConsentCompound } from './context';
import { resolveClass } from '../../utils/styling';

export interface RejectButtonProps {
  children?: React.ReactNode;
  className?: string;
  unstyled?: boolean;
}

export const RejectButton: React.FC<RejectButtonProps> = ({ children, className, unstyled }) => {
  const { rejectAll } = useConsentCompound();
  return (
    <button
      onClick={rejectAll}
      className={resolveClass(
        'ndpr-consent-banner__button ndpr-consent-banner__button--secondary',
        className, unstyled
      )}
      data-ndpr-component="consent-reject-button"
    >
      {children ?? 'Reject All'}
    </button>
  );
};
