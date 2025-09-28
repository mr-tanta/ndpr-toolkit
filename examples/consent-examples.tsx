/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  ConsentManager,
  ConsentProvider,
  useConsent,
  useConsentManager,
  ConsentBanner as UnstyledBanner,
  ConsentSettings as UnstyledSettings,
  cookieUtils,
  createConsentContext,
} from "@tantainnovative/ndpr-toolkit";

// Example 1: Headless mode with custom UI
function HeadlessExample() {
  return (
    <ConsentManager headless>
      <CustomCookieBanner />
      <CustomSettingsModal />
      {/* Your app content */}
    </ConsentManager>
  );
}

function CustomCookieBanner() {
  const { hasUserConsented, acceptAll, rejectAll, openSettings } = useConsent();

  if (hasUserConsented) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
      <p>We use cookies to improve your experience.</p>
      <div className="mt-4 space-x-2">
        <button
          onClick={acceptAll}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Accept All
        </button>
        <button onClick={rejectAll} className="border px-4 py-2 rounded">
          Reject All
        </button>
        <button onClick={openSettings} className="text-blue-500">
          Customize
        </button>
      </div>
    </div>
  );
}

function CustomSettingsModal() {
  const {
    showSettings,
    consentState,
    updateConsent,
    savePreferences,
    closeSettings,
  } = useConsent();

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Cookie Settings</h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Analytics</span>
            <input
              type="checkbox"
              checked={consentState.analytics}
              onChange={(e) => updateConsent("analytics", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Marketing</span>
            <input
              type="checkbox"
              checked={consentState.marketing}
              onChange={(e) => updateConsent("marketing", e.target.checked)}
            />
          </label>
        </div>

        <div className="mt-6 space-x-2">
          <button
            onClick={() => savePreferences(consentState)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button onClick={closeSettings} className="border px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Example 2: Using render props
function RenderPropsExample() {
  return (
    <ConsentManager>
      {({ consents, actions, ui }) => (
        <>
          {!consents.hasUserConsented && (
            <div className="cookie-banner">
              <p>This site uses cookies</p>
              <button onClick={actions.acceptAll}>Accept</button>
              <button onClick={actions.rejectAll}>Reject</button>
              <button onClick={ui.openSettings}>Settings</button>
            </div>
          )}

          {ui.showSettings && (
            <div className="settings-modal">{/* Custom settings UI */}</div>
          )}
        </>
      )}
    </ConsentManager>
  );
}

// Example 3: Using unstyled components
function UnstyledExample() {
  return (
    <ConsentManager headless>
      <UnstyledBanner className="my-custom-banner">
        <UnstyledBanner.Message>
          We use cookies to enhance your experience.
        </UnstyledBanner.Message>
        <UnstyledBanner.Actions>
          <button className="accept-btn">Accept All</button>
          <button className="reject-btn">Reject All</button>
          <button className="settings-btn">Manage</button>
        </UnstyledBanner.Actions>
      </UnstyledBanner>

      <UnstyledSettings className="my-custom-settings">
        {/* Custom settings content */}
      </UnstyledSettings>
    </ConsentManager>
  );
}

// Example 4: Component composition
function CompositionExample() {
  return (
    <ConsentManager>
      <ConsentManager.Banner position="top" animation="fade">
        {/* Default banner with custom position */}
      </ConsentManager.Banner>

      <ConsentManager.Settings>
        {/* Default settings */}
      </ConsentManager.Settings>

      {/* Your app */}
    </ConsentManager>
  );
}

// Example 5: Event-driven approach
function EventDrivenExample() {
  const manager = useConsentManager();

  React.useEffect(() => {
    const unsubscribe = manager.on("consent:accepted", (consents) => {
      console.log("User accepted cookies:", consents);
      // Initialize analytics, marketing tools, etc.
    });

    manager.on("consent:updated", (consents) => {
      console.log("Consent updated:", consents);
      // Update services based on new preferences
    });

    return unsubscribe;
  }, [manager]);

  return <div>Your app content</div>;
}

// Example 6: Custom consent categories
interface CustomCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  advertising: boolean;
  social: boolean;
  [key: string]: boolean;
}

const { ConsentProvider: CustomProvider, useConsent: useCustomConsent } =
  createConsentContext<CustomCategories>();

function CustomCategoriesExample() {
  return (
    <CustomProvider
      categories={[
        {
          id: "necessary",
          name: "Essential",
          description: "Required for site operation",
          required: true,
        },
        {
          id: "analytics",
          name: "Analytics",
          description: "Help us understand usage",
        },
        { id: "marketing", name: "Marketing", description: "Personalized ads" },
        {
          id: "functional",
          name: "Functional",
          description: "Enhanced features",
        },
        {
          id: "advertising",
          name: "Advertising",
          description: "Third-party ads",
        },
        {
          id: "social",
          name: "Social Media",
          description: "Social media integration",
        },
      ]}
    >
      {/* Custom consent UI would go here */}
      <div>Custom consent interface</div>
    </CustomProvider>
  );
}

// Example 7: Override specific components
function OverrideComponentsExample() {
  return (
    <ConsentManager
    // components={{
    //   Banner: MyCustomBanner,
    //   Settings: MyCustomSettings,
    // }}
    >
      {/* Your app */}
    </ConsentManager>
  );
}

// Example 8: Using custom render functions
function CustomRenderExample() {
  return (
    <ConsentManager
      renderBanner={({ onAcceptAll, onRejectAll, onOpenSettings }) => (
        <div className="my-banner">
          <p>Cookie notice</p>
          <button onClick={onAcceptAll}>OK</button>
          <button onClick={onOpenSettings}>Options</button>
        </div>
      )}
      renderSettings={({ consentState, onUpdateConsent, onSave }) => (
        <div className="my-settings">{/* Custom settings UI */}</div>
      )}
    >
      {/* Your app */}
    </ConsentManager>
  );
}

// Example 9: Programmatic control
function ProgrammaticExample() {
  const { openSettings, hasUserConsented, consentState } = useConsent();

  return (
    <div>
      <button onClick={openSettings}>Manage Cookie Preferences</button>

      {hasUserConsented && (
        <div>Analytics enabled: {consentState.analytics ? "Yes" : "No"}</div>
      )}
    </div>
  );
}

// Example 10: Integration with analytics
function AnalyticsIntegrationExample() {
  const { consentState, hasUserConsented } = useConsent();

  React.useEffect(() => {
    if (hasUserConsented && consentState.analytics) {
      // Initialize Google Analytics
      // Initialize Google Analytics
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
        "consent",
        "update",
        {
          analytics_storage: "granted",
        },
      );
    } else {
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
        "consent",
        "update",
        {
          analytics_storage: "denied",
        },
      );
    }
  }, [hasUserConsented, consentState.analytics]);

  return <div>Your app with analytics</div>;
}
