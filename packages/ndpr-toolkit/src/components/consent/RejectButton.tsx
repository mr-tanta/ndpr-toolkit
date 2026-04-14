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
        'px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600',
        className, unstyled
      )}
      data-ndpr-component="consent-reject-button"
    >
      {children ?? 'Reject All'}
    </button>
  );
};
