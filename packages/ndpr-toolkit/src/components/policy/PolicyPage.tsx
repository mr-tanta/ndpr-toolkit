import React from 'react';
import type { PrivacyPolicy } from '../../types/privacy';
import { exportHTML } from '../../utils/policy-export';

export interface PolicyPageProps {
  policy: PrivacyPolicy;
  className?: string;
}

/**
 * PolicyPage renders a full styled privacy policy page.
 * HTML is generated internally by exportHTML from a typed PrivacyPolicy object
 * and does not contain untrusted user input.
 */
// eslint-disable-next-line react/no-danger
export const PolicyPage: React.FC<PolicyPageProps> = ({ policy, className }) => {
  const html = exportHTML(policy, { includeStyles: true, includePrintCSS: true });

  return (
    // The HTML string is produced by exportHTML from a structured PrivacyPolicy
    // object — not from raw user input — so XSS risk is not present here.
    <div
      data-ndpr-component="policy-page"
      className={className}
      // nosemgrep: react-dangerouslysetinnerhtml
      dangerouslySetInnerHTML={{ __html: html }} // NOSONAR: content is generated from typed internal data
    />
  );
};
