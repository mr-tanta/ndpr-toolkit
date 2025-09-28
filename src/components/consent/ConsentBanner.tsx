"use client";
import React, { ReactNode } from 'react';
import { useConsent } from '@/contexts/ConsentContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { BannerProps } from './ConsentManager';

export interface ConsentBannerProps {
  renderBanner?: (props: BannerProps) => ReactNode;
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  position?: 'top' | 'bottom' | 'center';
  animation?: 'slide' | 'fade' | 'none';
  fullWidth?: boolean;
  maxWidth?: string;
  unstyled?: boolean;
  className?: string;
  children?: ReactNode;
}
interface ConsentBannerComponent extends React.FC<ConsentBannerProps> {
  Message: React.FC<{ children: ReactNode; className?: string }>;
  Actions: React.FC<{ children: ReactNode; className?: string }>;
}

const ConsentBanner: ConsentBannerComponent = ({
  renderBanner,
  theme,
  position = 'bottom',
  animation = 'slide',
  fullWidth = true,
  maxWidth = '1200px',
  unstyled = false,
  className,
  children,
}) => {
  const { showBanner, acceptAll, rejectAll, openSettings } = useConsent();

  if (!showBanner) return null;

  // Custom render function
  if (renderBanner) {
    return <>{renderBanner({ onAcceptAll: acceptAll, onRejectAll: rejectAll, onOpenSettings: openSettings })}</>;
  }

  // Children-based composition
  if (children) {
    return (
      <div
        className={cn(
          !unstyled && [
            'fixed z-50 p-4',
            position === 'bottom' && 'bottom-0 left-0 right-0',
            position === 'top' && 'top-0 left-0 right-0',
            position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            animation === 'slide' && 'animate-slide-in',
            animation === 'fade' && 'animate-fade-in',
          ],
          className
        )}
        style={{
          backgroundColor: unstyled ? undefined : theme?.backgroundColor || 'white',
          color: unstyled ? undefined : theme?.textColor,
          maxWidth: fullWidth ? undefined : maxWidth,
          margin: fullWidth ? undefined : '0 auto',
        }}
      >
        {children}
      </div>
    );
  }

  // Default implementation
  return (
    <div
      className={cn(
        'fixed z-50 p-4',
        position === 'bottom' && 'bottom-0 left-0 right-0',
        position === 'top' && 'top-0 left-0 right-0',
        position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        animation === 'slide' && 'animate-slide-in',
        animation === 'fade' && 'animate-fade-in',
        className
      )}
      style={{
        backgroundColor: theme?.backgroundColor || 'white',
        color: theme?.textColor,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: fullWidth ? undefined : maxWidth,
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
          <p className="text-gray-600 mb-4">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={acceptAll}
              style={{ backgroundColor: theme?.primaryColor }}
            >
              Accept All
            </Button>
            <Button
              onClick={rejectAll}
              variant="outline"
            >
              Reject All
            </Button>
            <Button
              onClick={openSettings}
              variant="ghost"
            >
              Manage Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for composition
ConsentBanner.Message = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

ConsentBanner.Actions = ({ children, className }) => (
  <div className={cn('flex gap-3 flex-wrap', className)}>{children}</div>
);

export { ConsentBanner };