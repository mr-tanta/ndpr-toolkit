import React from 'react';
import { useConsentCompound } from './context';
import { resolveClass } from '../../utils/styling';

export interface AcceptButtonProps {
  children?: React.ReactNode;
  className?: string;
  unstyled?: boolean;
}

export const AcceptButton: React.FC<AcceptButtonProps> = ({ children, className, unstyled }) => {
  const { acceptAll } = useConsentCompound();
  return (
    <button
      onClick={acceptAll}
      className={resolveClass(
        'px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded hover:bg-[rgb(var(--ndpr-primary-hover))]',
        className, unstyled
      )}
      data-ndpr-component="consent-accept-button"
    >
      {children ?? 'Accept All'}
    </button>
  );
};
