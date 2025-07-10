import React, { ReactNode } from 'react';
import { useConsent } from '@/contexts/ConsentContext';

export interface UnstyledConsentBannerProps {
  className?: string;
  children?: ReactNode;
}

export const UnstyledConsentBanner: React.FC<UnstyledConsentBannerProps> = ({
  className,
  children,
}) => {
  const { showBanner, acceptAll, rejectAll, openSettings } = useConsent();

  if (!showBanner) return null;

  return (
    <div className={className} role="region" aria-label="Cookie consent">
      {children || (
        <>
          <div>
            <h3>Cookie Consent</h3>
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
          </div>
          <div>
            <button onClick={acceptAll} aria-label="Accept all cookies">
              Accept All
            </button>
            <button onClick={rejectAll} aria-label="Reject non-essential cookies">
              Reject All
            </button>
            <button onClick={openSettings} aria-label="Manage cookie preferences">
              Manage Preferences
            </button>
          </div>
        </>
      )}
    </div>
  );
};