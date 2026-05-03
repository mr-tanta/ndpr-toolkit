'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

export default function ConsentManagementDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Consent Management — NDPA Toolkit Documentation',
    description: 'NDPA 2023-compliant consent management system for handling user consent preferences',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Consent Management"
      description="NDPA 2023-compliant consent management system for handling user consent preferences"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 gap-3">
        <Link href="/ndpr-demos/consent" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
          View Demo →
        </Link>
        <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/src/components/consent" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card transition">
          View Source
        </a>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Consent Management component provides a complete solution for collecting, storing, and managing user consent
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes a customizable consent banner,
          preference management interface, and consent storage system.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-2">NDPA Consent Requirements</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under the NDPA 2023, consent must be freely given, specific, informed, and unambiguous. The data subject must clearly
            indicate acceptance through a statement or clear affirmative action. Pre-ticked boxes or silence do not constitute valid consent.
          </p>
        </div>
      </section>

      <section id="v3-quick-start" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">v3 Quick Start</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          v3 introduces zero-config presets, compound components for custom layouts, and a StorageAdapter pattern
          so you can plug in any persistence backend without touching component internals.
        </p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Zero-config preset</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`// Drop in a fully-working consent banner with NDPA defaults
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRConsent />`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Compound components for custom layouts</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { Consent } from '@tantainnovative/ndpr-toolkit/consent';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<Consent.Provider options={options} adapter={apiAdapter('/api/consent')}>
  <Consent.Banner />
</Consent.Provider>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Hook with adapter</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';
import { memoryAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// The adapter prop accepts any StorageAdapter for custom persistence
// (localStorage, sessionStorage, API, IndexedDB, etc.)
const consent = useConsent({ options, adapter: memoryAdapter() });`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="installation" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Installation</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Install the NDPR Toolkit package which includes the Consent Management components:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">pnpm add @tantainnovative/ndpr-toolkit</code>
        </pre>
      </section>

      <section id="components" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Components</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Consent Management system includes several components that work together:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">ConsentBanner</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A cookie consent banner that appears at the bottom of the page when a user first visits your site. Fully customizable with support for multiple consent options.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

<ConsentBanner
  options={[
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'Essential cookies for the website to function.',
      required: true,
      purpose: 'Core website functionality'
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'Cookies that help us understand how you use our website.',
      required: false,
      purpose: 'Usage analytics'
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'Cookies used for marketing purposes.',
      required: false,
      purpose: 'Marketing and advertising'
    }
  ]}
  onSave={(settings) => console.log(settings)}
  position="bottom"
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">ConsentManager</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A higher-order component that manages the consent state and provides methods for checking and updating consent. Works with the useConsent hook to provide a complete consent management solution.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit';

const options = [
  {
    id: 'necessary',
    label: 'Necessary Cookies',
    description: 'Essential cookies for the website to function.',
    required: true,
    purpose: 'Core website functionality'
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'Cookies that help us understand how you use our website.',
    required: false,
    purpose: 'Usage analytics'
  }
];

function PreferencesPage() {
  const { settings, updateConsent, resetConsent } = useConsent({ options });

  return (
    <ConsentManager
      options={options}
      settings={settings ?? undefined}
      onSave={(newSettings) => {
        // Persist or forward the updated ConsentSettings
        updateConsent(newSettings.consents);
      }}
    />
  );
}

function AnalyticsLoader() {
  const { hasConsent } = useConsent({ options });

  if (hasConsent('analytics')) {
    // Initialize analytics
  }

  return null;
}`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">ConsentStorage</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A component for handling the storage and retrieval of consent settings. Supports both local storage and custom storage mechanisms.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { ConsentStorage } from '@tantainnovative/ndpr-toolkit';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

function ConsentStorageExample() {
  const [settings, setSettings] = useState<ConsentSettings>({
    consents: { necessary: true, analytics: false, marketing: false },
    timestamp: Date.now(),
    version: '1.0',
    method: 'explicit',
    hasInteracted: true,
  });

  const handleLoad = (loadedSettings: ConsentSettings | null) => {
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  };

  return (
    <ConsentStorage
      settings={settings}
      storageOptions={{
        storageKey: 'my-app-consent',
        storageType: 'localStorage'
      }}
      onLoad={handleLoad}
      onSave={(savedSettings) => console.log('Saved:', savedSettings)}
      autoLoad={true}
      autoSave={true}
    >
      {({ saveSettings, clearSettings, loaded }) => (
        <div>
          <p>Consent settings loaded: {loaded ? 'Yes' : 'No'}</p>
          <button onClick={() => saveSettings(settings)}>Save Settings</button>
          <button onClick={() => clearSettings()}>Clear Settings</button>
        </div>
      )}
    </ConsentStorage>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Here&apos;s a complete example of how to implement the consent management system in your application:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useState, useEffect } from 'react';
import {
  ConsentBanner,
  ConsentManager,
  useConsent
} from '@tantainnovative/ndpr-toolkit';

const consentOptions = [
  {
    id: 'necessary',
    label: 'Necessary Cookies',
    description: 'Essential cookies for the website to function.',
    required: true,
    purpose: 'Core website functionality'
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'Cookies that help us understand how you use our website.',
    required: false,
    purpose: 'Usage analytics'
  },
  {
    id: 'marketing',
    label: 'Marketing Cookies',
    description: 'Cookies used for marketing purposes.',
    required: false,
    purpose: 'Marketing and advertising'
  }
];

function App() {
  const [showPreferences, setShowPreferences] = useState(false);
  const consent = useConsent({ options: consentOptions });

  return (
    <div>
      <header>
        <nav>
          <button onClick={() => setShowPreferences(true)}>Cookie Preferences</button>
        </nav>
      </header>
      <main>{/* Your main content */}</main>
      {showPreferences && (
        <PreferencesModal
          consent={consent}
          onClose={() => setShowPreferences(false)}
        />
      )}
      <ConsentBanner
        options={consentOptions}
        onSave={(settings) => consent.updateConsent(settings.consents)}
        position="bottom"
      />
    </div>
  );
}

function PreferencesModal({ consent, onClose }) {
  const { settings, updateConsent, resetConsent } = consent;

  const handleSave = () => {
    // settings are already saved via updateConsent
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Cookie Preferences</h2>
        {consentOptions.map(option => (
          <label key={option.id}>
            <input
              type="checkbox"
              checked={settings?.consents[option.id] || false}
              disabled={option.required}
              onChange={(e) =>
                updateConsent({
                  ...settings?.consents,
                  [option.id]: e.target.checked
                })
              }
            />
            {option.label}
          </label>
        ))}
        <button onClick={handleSave}>Save</button>
        <button onClick={resetConsent}>Reset</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function AnalyticsComponent() {
  const { hasConsent } = useConsent({ options: consentOptions });

  useEffect(() => {
    if (hasConsent('analytics')) {
      console.log('Analytics initialized');
    }
  }, [hasConsent]);

  return null;
}`}</code>
        </pre>
      </section>

      <section id="variants" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Banner variants</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">variant</code> prop (added in v3.4.0) controls visual treatment. Pair it with{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">position</code> for placement.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">variant=&quot;bar&quot;</code> (default)</h3>
        <p className="text-muted-foreground mb-4">Full-width strip pinned to the top or bottom edge.</p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`<ConsentBanner
  options={options}
  onSave={handleSave}
  position="bottom"
/>`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">variant=&quot;card&quot;</code></h3>
        <p className="text-muted-foreground mb-4">
          Bounded floating card with rounded corners and margin from the screen edges. Polished default for
          marketing and product sites.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`<ConsentBanner
  options={options}
  onSave={handleSave}
  variant="card"
  position="bottom"
/>`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">variant=&quot;modal&quot;</code></h3>
        <p className="text-muted-foreground mb-4">
          Centered card with a backdrop overlay. Forces center placement regardless of{' '}
          <code className="bg-muted px-1 rounded">position</code>. Use sparingly — modals interrupt the page and are
          rarely the right choice for compliance widgets.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`<ConsentBanner
  options={options}
  onSave={handleSave}
  variant="modal"
/>`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Targeting variants from your CSS</h3>
        <p className="text-muted-foreground mb-4">
          Each rendered banner exposes <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-component</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-variant</code>, and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-position</code> attributes you can target without depending on internal class names.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`/* Customise the card variant only */
[data-ndpr-component="consent-banner"][data-ndpr-variant="card"] {
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Special-case the modal overlay */
[data-ndpr-component="consent-banner"][data-ndpr-variant="modal"] {
  background: rgba(0, 0, 0, 0.7);
}`}</code>
        </pre>
      </section>

      <section id="api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">API Reference</h2>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentBanner Props</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Prop</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Default</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">options</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentOption[]</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of consent options to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onSave</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(settings: ConsentSettings) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function called when consent is saved</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">position</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;top&apos; | &apos;bottom&apos; | &apos;center&apos; | &apos;inline&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;bottom&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Position of the banner on the page. top/bottom/center render via a portal; inline renders in normal document flow.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">variant</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;bar&apos; | &apos;card&apos; | &apos;modal&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;bar&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  Visual treatment. <code className="bg-muted px-1 rounded">bar</code> is the default full-width strip. <code className="bg-muted px-1 rounded">card</code> renders a bounded floating card with margin from the screen edges (pairs well with <code className="bg-muted px-1 rounded">position=&quot;bottom&quot;</code>). <code className="bg-muted px-1 rounded">modal</code> forces center placement with a backdrop overlay regardless of <code className="bg-muted px-1 rounded">position</code>. <em>Added in v3.4.0.</em>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;We Value Your Privacy&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Title displayed on the banner</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;We use cookies...&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Description text explaining the purpose of cookies</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">acceptAllButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Accept All&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the accept all button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">rejectAllButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Reject All&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the reject all button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">customizeButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Customize&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the customize button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">storageKey</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;ndpr_consent&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">localStorage key used to persist consent</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">show</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Explicitly control banner visibility. When omitted, the banner auto-shows if no saved consent exists.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">version</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;1.0&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Consent form version. Banner re-shows when stored version differs.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">className</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Additional CSS class on the banner root element</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">classNames</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentBannerClassNames</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Per-slot class overrides for granular styling</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">unstyled</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">false</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Remove all default Tailwind classes to style from scratch</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onAnalytics</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(event: ConsentAnalyticsEvent) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Analytics callback fired on each user interaction (shown, accepted_all, rejected_all, customized, dismissed)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentManager Props</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Prop</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Default</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">options</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentOption[]</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of consent options to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onSave</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(settings: ConsentSettings) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback called when the user saves their preferences</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">settings</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentSettings</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Current consent settings to pre-populate the form</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Manage Your Privacy Settings&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Title displayed in the manager</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Update your consent preferences...&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Description text displayed in the manager</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">saveButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Save Preferences&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the save button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">resetButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Reset to Defaults&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the reset button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">version</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;1.0&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Version stamped on saved ConsentSettings</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">className</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Additional CSS class on the root element</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">classNames</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentManagerClassNames</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Per-slot class overrides for granular styling</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">unstyled</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">false</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Remove all default Tailwind classes to style from scratch</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentOption Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface ConsentOption {
  id: string;
  label: string;
  description: string;
  required: boolean;
  /** NDPA Section 25(2): specific purpose for which data will be processed */
  purpose: string;
  defaultValue?: boolean;
  dataCategories?: string[];
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentSettings Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface ConsentSettings {
  /** Map of consent option IDs to boolean consent values */
  consents: Record<string, boolean>;
  /** Unix timestamp of when consent was last updated */
  timestamp: number;
  /** Version of the consent form that was accepted */
  version: string;
  /** Method used to collect consent: 'banner' | 'manager' | 'explicit' | 'customize' */
  method: string;
  /** Whether the user actively made a choice */
  hasInteracted: boolean;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentStorageOptions Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface ConsentStorageOptions {
  /** Storage key — defaults to 'ndpr_consent' */
  storageKey?: string;
  /** Storage backend — defaults to 'localStorage' */
  storageType?: 'localStorage' | 'sessionStorage' | 'cookie';
  cookieOptions?: {
    domain?: string;
    path?: string;
    /** Expiration in days — defaults to 365 */
    expires?: number;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  };
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">useConsent Hook</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useConsent } from '@tantainnovative/ndpr-toolkit';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

const {
  settings,          // ConsentSettings | null — current saved settings
  hasConsent,        // (optionId: string) => boolean — check per-option consent
  updateConsent,     // (consents: Record<string, boolean>) => void
  acceptAll,         // () => void — mark every option as true
  rejectAll,         // () => void — mark non-required options as false
  shouldShowBanner,  // boolean — true when no valid consent is stored
  isValid,           // boolean — current settings pass validation
  validationErrors,  // string[] — validation error messages
  resetConsent,      // () => void — clear stored consent
  isLoading,         // boolean — true while an async adapter is loading
} = useConsent({
  options,

  // v3 approach (recommended): plug in any StorageAdapter
  adapter: localStorageAdapter('my-consent-key'),

  // v2 approach (deprecated, still works):
  // storageOptions: { storageKey: 'my-consent-key' },

  version: '1.0',
  onChange: (settings) => console.log('Consent changed:', settings),
});`}</code>
        </pre>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">Clear Language:</strong> Use clear, plain language to explain what each type of cookie does and why you&apos;re collecting the data.
          </li>
          <li>
            <strong className="text-foreground">No Pre-selected Options:</strong> Don&apos;t pre-select non-essential cookies. The NDPA requires that consent is freely given and pre-selected checkboxes don&apos;t constitute valid consent.
          </li>
          <li>
            <strong className="text-foreground">Easy Access to Preferences:</strong> Make it easy for users to access and update their consent preferences at any time.
          </li>
          <li>
            <strong className="text-foreground">Consent Records:</strong> Keep records of when and how consent was obtained. The ConsentManager component automatically tracks consent history.
          </li>
          <li>
            <strong className="text-foreground">Respect User Choices:</strong> Only activate cookies and tracking technologies when the user has given explicit consent for them.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Accessibility</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Consent Management components are built with accessibility in mind:
        </p>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
          <li>The banner is announced to screen readers when it appears</li>
        </ul>
      </section>

      <section id="help-resources" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          If you have questions about implementing the Consent Management system or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">GitHub Issues</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Report bugs or request features on our GitHub repository.
            </p>
            <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              View Issues
            </a>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">NDPA Resources</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Learn more about NDPA 2023 compliance requirements.
            </p>
            <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              NDPA Framework
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
