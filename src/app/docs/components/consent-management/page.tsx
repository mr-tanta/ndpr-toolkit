'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ConsentManagementDocs() {
  return (
    <DocLayout
      title="Consent Management"
      description="NDPA 2023-compliant consent management system for handling user consent preferences"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/consent">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/src/components/consent" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Consent Management component provides a complete solution for collecting, storing, and managing user consent
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes a customizable consent banner,
          preference management interface, and consent storage system.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Consent Requirements</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, consent must be freely given, specific, informed, and unambiguous. The data subject must clearly
            indicate acceptance through a statement or clear affirmative action. Pre-ticked boxes or silence do not constitute valid consent.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Consent Management components:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Consent Management system includes several components that work together:
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">ConsentBanner</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A cookie consent banner that appears at the bottom of the page when a user first visits your site. Fully customizable with support for multiple consent options.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

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
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">ConsentManager</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A higher-order component that manages the consent state and provides methods for checking and updating consent. Works with the useConsent hook to provide a complete consent management solution.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit';

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
  
  // Check if user has given consent for analytics
  if (hasConsented('analytics')) {
    // Initialize analytics
  }
  
  return (
    <div>
      {/* Your app content */}
      <button onClick={() => updateConsent('analytics', true)}>Enable Analytics</button>
    </div>
  );
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">ConsentStorage</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A component for handling the storage and retrieval of consent settings. Supports both local storage and custom storage mechanisms.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { ConsentStorage } from '@tantainnovative/ndpr-toolkit';
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
        storage: 'localStorage' // or 'sessionStorage' or 'cookie'
      }}
      onLoad={handleLoad}
      onSave={(savedSettings) => console.log('Saved:', savedSettings)}
      autoLoad={true}
      autoSave={true}
    >
      {/* Render prop pattern */}
      {({ loadSettings, saveSettings, clearSettings, loaded }) => (
        <div>
          <p>Consent settings loaded: {loaded ? 'Yes' : 'No'}</p>
          <button onClick={() => saveSettings(settings)}>Save Settings</button>
          <button onClick={() => clearSettings()}>Clear Settings</button>
        </div>
      )}
    </ConsentStorage>
  );
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement the consent management system in your application:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState, useEffect } from 'react';
import {
  ConsentBanner,
  ConsentManager,
  ConsentStorage,
  useConsent
} from '@tantainnovative/ndpr-toolkit';

// Define your consent options
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
    <ConsentManager
      options={consentOptions}
      storageKey="my-app-consent"
    >
      <div>
        {/* Your app content */}
        <header>
          <nav>
            {/* ... */}
            <button onClick={() => setShowPreferences(true)}>
              Cookie Preferences
            </button>
          </nav>
        </header>
        
        <main>
          {/* Your main content */}
        </main>
        
        {/* Cookie preferences modal */}
        {showPreferences && (
          <PreferencesModal 
            onClose={() => setShowPreferences(false)} 
          />
        )}
        
        {/* Consent banner */}
        <ConsentBanner 
          options={consentOptions}
          position="bottom"
          privacyPolicyUrl="/privacy-policy"
        />
      </div>
    </ConsentManager>
  );
}

function PreferencesModal({ onClose }) {
  const {
    consents,
    updateConsent,
    saveConsents,
    resetConsents
  } = useConsent();

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

// Example of using the useConsent hook to check consent
function AnalyticsComponent() {
  const { hasConsented } = useConsent();
  
  useEffect(() => {
    if (hasConsented('analytics')) {
      // Initialize analytics
      console.log('Analytics initialized');
    }
  }, [hasConsented]);
  
  return null;
}`}</code></pre>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        
        <h3 className="text-xl font-bold mt-8 mb-4">ConsentBanner Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">ConsentOption[]</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of consent options to display</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onSave</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`({ consents: Record<string, boolean> }) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback function called when consent is saved</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">position</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;top&apos; | &apos;bottom&apos;</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;bottom&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Position of the banner on the page</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">title</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;Cookie Consent&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Title displayed on the banner</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">description</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;We use cookies...&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Description text explaining the purpose of cookies</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">showPreferences</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether to show the &quot;Preferences&quot; button</td>
              </tr>
              <tr>  
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">privacyPolicyUrl</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">URL to the privacy policy page</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">ConsentStorage Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">settings</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">ConsentSettings</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Current consent settings to store</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">storageOptions</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">ConsentStorageOptions</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`{ storageKey: 'ndpr_consent', storageType: 'localStorage' }`}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Options for storage mechanism</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onLoad</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(settings: ConsentSettings | null) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback when settings are loaded</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onSave</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(settings: ConsentSettings) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback when settings are saved</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">autoLoad</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether to load settings on mount</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">autoSave</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether to save settings automatically</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">children</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">ReactNode | Function</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">React nodes or render prop function</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">ConsentOption Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type ConsentOption = {
  id: string;
  label: string;
  description: string;
  required?: boolean;
};`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">ConsentSettings Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type ConsentSettings = {
  [key: string]: boolean;
  lastUpdated: number;
};`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">ConsentStorageOptions Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type ConsentStorageOptions = {
  key: string;
  storage: 'localStorage' | 'sessionStorage' | 'cookie';
  cookieOptions?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
};`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Clear Language:</strong> Use clear, plain language to explain what each type of cookie does and why you&apos;re collecting the data.
          </li>
          <li>
            <strong>No Pre-selected Options:</strong> Don&apos;t pre-select non-essential cookies. The NDPA requires that consent is freely given and pre-selected checkboxes don&apos;t constitute valid consent.
          </li>
          <li>
            <strong>Easy Access to Preferences:</strong> Make it easy for users to access and update their consent preferences at any time.
          </li>
          <li>
            <strong>Consent Records:</strong> Keep records of when and how consent was obtained. The ConsentManager component automatically tracks consent history.
          </li>
          <li>
            <strong>Respect User Choices:</strong> Only activate cookies and tracking technologies when the user has given explicit consent for them.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
        <p className="mb-4">
          The Consent Management components are built with accessibility in mind:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
          <li>The banner is announced to screen readers when it appears</li>
        </ul>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          If you have questions about implementing the Consent Management system or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">GitHub Issues</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Report bugs or request features on our GitHub repository.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer">
                  View Issues
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA Resources</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Learn more about NDPA 2023 compliance requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  NDPA Framework
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
