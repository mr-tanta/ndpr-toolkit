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
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'Cookies that help us understand how you use our website.',
      required: false
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'Cookies used for marketing purposes.',
      required: false
    }
  ]}
  onSave={(consents) => console.log(consents)}
  position="bottom"
  showPreferences={true}
  privacyPolicyUrl="/privacy-policy"
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

function App() {
  return (
    <ConsentManager
      options={[
        {
          id: 'necessary',
          label: 'Necessary Cookies',
          description: 'Essential cookies for the website to function.',
          required: true
        },
        {
          id: 'analytics',
          label: 'Analytics Cookies',
          description: 'Cookies that help us understand how you use our website.',
          required: false
        }
      ]}
      storageKey="my-app-consent"
      autoLoad={true}
      autoSave={true}
    >
      <MyApp />
    </ConsentManager>
  );
}

function MyApp() {
  const {
    consents,
    hasConsented,
    updateConsent,
    saveConsents,
    resetConsents
  } = useConsent();

  if (hasConsented('analytics')) {
    // Initialize analytics
  }

  return (
    <div>
      <button onClick={() => updateConsent('analytics', true)}>Enable Analytics</button>
    </div>
  );
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
    necessary: true,
    analytics: false,
    marketing: false,
    lastUpdated: Date.now()
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
        key: 'my-app-consent',
        storage: 'localStorage'
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
  ConsentStorage,
  useConsent
} from '@tantainnovative/ndpr-toolkit';

const consentOptions = [
  {
    id: 'necessary',
    label: 'Necessary Cookies',
    description: 'Essential cookies for the website to function.',
    required: true
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'Cookies that help us understand how you use our website.',
    required: false
  },
  {
    id: 'marketing',
    label: 'Marketing Cookies',
    description: 'Cookies used for marketing purposes.',
    required: false
  }
];

function App() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <ConsentManager options={consentOptions} storageKey="my-app-consent">
      <div>
        <header>
          <nav>
            <button onClick={() => setShowPreferences(true)}>Cookie Preferences</button>
          </nav>
        </header>
        <main>{/* Your main content */}</main>
        {showPreferences && (
          <PreferencesModal onClose={() => setShowPreferences(false)} />
        )}
        <ConsentBanner options={consentOptions} position="bottom" privacyPolicyUrl="/privacy-policy" />
      </div>
    </ConsentManager>
  );
}

function PreferencesModal({ onClose }) {
  const { consents, updateConsent, saveConsents, resetConsents } = useConsent();

  const handleSave = () => {
    saveConsents();
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
              checked={consents[option.id] || false}
              disabled={option.required}
              onChange={(e) => updateConsent(option.id, e.target.checked)}
            />
            {option.label}
          </label>
        ))}
        <button onClick={handleSave}>Save</button>
        <button onClick={resetConsents}>Reset</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function AnalyticsComponent() {
  const { hasConsented } = useConsent();

  useEffect(() => {
    if (hasConsented('analytics')) {
      console.log('Analytics initialized');
    }
  }, [hasConsented]);

  return null;
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
                <td className="py-3 px-4 text-sm text-muted-foreground">{`({ consents: Record<string, boolean> }) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function called when consent is saved</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">position</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;top&apos; | &apos;bottom&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;bottom&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Position of the banner on the page</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Cookie Consent&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Title displayed on the banner</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;We use cookies...&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Description text explaining the purpose of cookies</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">showPreferences</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">true</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to show the &quot;Preferences&quot; button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">privacyPolicyUrl</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">URL to the privacy policy page</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentStorage Props</h3>
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
                <td className="py-3 px-4 text-sm font-medium text-foreground">settings</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentSettings</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Current consent settings to store</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">storageOptions</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ConsentStorageOptions</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`{ storageKey: 'ndpr_consent', storageType: 'localStorage' }`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Options for storage mechanism</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onLoad</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(settings: ConsentSettings | null) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback when settings are loaded</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onSave</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(settings: ConsentSettings) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback when settings are saved</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">autoLoad</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">true</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to load settings on mount</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">autoSave</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">true</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to save settings automatically</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">children</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">ReactNode | Function</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">undefined</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">React nodes or render prop function</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentOption Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`type ConsentOption = {
  id: string;
  label: string;
  description: string;
  required?: boolean;
};`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentSettings Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`type ConsentSettings = {
  [key: string]: boolean;
  lastUpdated: number;
};`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ConsentStorageOptions Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`type ConsentStorageOptions = {
  key: string;
  storage: 'localStorage' | 'sessionStorage' | 'cookie';
  cookieOptions?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
};`}</code>
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
