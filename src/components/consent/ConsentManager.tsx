import React, { ReactNode } from 'react';
import { ConsentProvider, ConsentProviderProps, ConsentCategories, ConsentActions, useConsent } from '@/contexts/ConsentContext';
import { ConsentBanner } from './ConsentBanner';
import { ConsentSettings } from './ConsentSettings';

export interface BannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onOpenSettings: () => void;
}

export interface SettingsProps {
  consentState: ConsentCategories;
  onUpdateConsent: (category: keyof ConsentCategories, value: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}

export interface RenderProps {
  consents: ConsentCategories;
  actions: ConsentActions;
  ui: {
    showBanner: boolean;
    showSettings: boolean;
    openSettings: () => void;
    closeSettings: () => void;
  };
}

export interface ConsentManagerProps extends Omit<ConsentProviderProps, 'children'> {
  children?: ReactNode | ((props: RenderProps) => ReactNode);
  headless?: boolean;
  renderBanner?: (props: BannerProps) => ReactNode;
  renderSettings?: (props: SettingsProps) => ReactNode;
  components?: {
    Banner?: React.ComponentType<any>;
    Settings?: React.ComponentType<any>;
  };
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  position?: 'top' | 'bottom' | 'center';
  animation?: 'slide' | 'fade' | 'none';
  fullWidth?: boolean;
  maxWidth?: string;
}

interface ConsentManagerComponent extends React.FC<ConsentManagerProps> {
  Banner: typeof ConsentBanner;
  Settings: typeof ConsentSettings;
}

// Internal component that has access to consent context
const ConsentManagerInner: React.FC<Omit<ConsentManagerProps, keyof Omit<ConsentProviderProps, 'children'>>> = ({
  children,
  headless = false,
  renderBanner,
  renderSettings,
  components,
  theme,
  position = 'bottom',
  animation = 'slide',
  fullWidth = true,
  maxWidth = '1200px',
}) => {
  const consent = useConsent();

  // If using render props pattern
  if (typeof children === 'function') {
    const renderProps: RenderProps = {
      consents: consent.consentState,
      actions: {
        acceptAll: consent.acceptAll,
        rejectAll: consent.rejectAll,
        savePreferences: consent.savePreferences,
        updateConsent: consent.updateConsent,
        openSettings: consent.openSettings,
        closeSettings: consent.closeSettings,
      },
      ui: {
        showBanner: consent.showBanner,
        showSettings: consent.showSettings,
        openSettings: consent.openSettings,
        closeSettings: consent.closeSettings,
      },
    };
    return <>{children(renderProps)}</>;
  }

  return (
    <>
      {children}
      {!headless && (
        <>
          {components?.Banner ? (
            <components.Banner />
          ) : (
            <ConsentBanner
              renderBanner={renderBanner}
              theme={theme}
              position={position}
              animation={animation}
              fullWidth={fullWidth}
              maxWidth={maxWidth}
            />
          )}
          {components?.Settings ? (
            <components.Settings />
          ) : (
            <ConsentSettings
              renderSettings={renderSettings}
              theme={theme}
            />
          )}
        </>
      )}
    </>
  );
};

const ConsentManager: ConsentManagerComponent = ({
  children,
  initialConsent,
  onConsentChange,
  storageKey,
  ...innerProps
}) => {
  return (
    <ConsentProvider
      initialConsent={initialConsent}
      onConsentChange={onConsentChange}
      storageKey={storageKey}
    >
      <ConsentManagerInner {...innerProps}>
        {children}
      </ConsentManagerInner>
    </ConsentProvider>
  );
};

// Attach sub-components for composition
ConsentManager.Banner = ConsentBanner;
ConsentManager.Settings = ConsentSettings;

export { ConsentManager };