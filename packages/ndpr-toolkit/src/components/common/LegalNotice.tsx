import React from 'react';
import { LEGAL_DISCLAIMER_SHORT, LEGAL_DISCLAIMER_LONG } from '../../utils/legal-notice';

export interface LegalNoticeProps {
  /**
   * Disclaimer length. `short` is a one-liner appropriate for captions and
   * footers; `long` is the full notice for export documents and dialogs.
   * @default 'short'
   */
  variant?: 'short' | 'long';
  /** Custom className for the wrapping element */
  className?: string;
  /** When true, renders nothing (escape hatch for unstyled mode) */
  hidden?: boolean;
}

/**
 * Renders the standard "not legal advice" notice produced by this toolkit.
 * Use under any component that surfaces an NDPA section citation or generates
 * an artifact (privacy policy, breach report, DPIA result, etc.).
 */
export const LegalNotice: React.FC<LegalNoticeProps> = ({
  variant = 'short',
  className,
  hidden,
}) => {
  if (hidden) return null;
  const text = variant === 'long' ? LEGAL_DISCLAIMER_LONG : LEGAL_DISCLAIMER_SHORT;
  return (
    <p
      role="note"
      className={className ?? 'ndpr-legal-notice'}
      data-ndpr-legal-notice={variant}
    >
      {text}
    </p>
  );
};
