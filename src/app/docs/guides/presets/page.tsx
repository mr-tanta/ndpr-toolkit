'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function PresetsGuide() {
  return (
    <DocLayout
      title="Zero-config Presets"
      description="Get a fully compliant NDPA 2023 implementation running in three files with presets"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What Are Presets?</h2>
        <p className="mb-4">
          Presets are pre-assembled configurations that wire together the most common compliance scenarios with sensible
          defaults. Instead of manually choosing categories, writing copy, picking an adapter, and configuring callbacks,
          you import a preset and it handles all of that for you.
        </p>
        <p className="mb-4">
          Every preset is fully overridable — treat it as a starting point, not a constraint. You can pass any prop
          supported by the underlying compound components to override individual defaults.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
          <h4 className="text-green-800 dark:text-green-200 font-medium mb-2">When to Use Presets vs. Compound Components</h4>
          <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 list-disc pl-4">
            <li><strong>Presets</strong> — you want a working implementation today with minimal code</li>
            <li><strong>Compound components</strong> — you need a bespoke layout or highly custom UI</li>
            <li>You can mix them: start with a preset, then swap individual sub-components as needed</li>
          </ul>
        </div>
      </section>

      <section id="quickstart" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3-File Quickstart</h2>
        <p className="mb-4">
          The fastest way to achieve NDPA 2023 compliance is to add three files to your Next.js project.
          The example below uses the <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">ndprPreset</code> for a minimal setup — consent banner, a privacy
          policy page, and a data subject request (DSR) form.
        </p>

        <h3 className="text-xl font-bold mb-3">File 1: Root layout — add NDPRProvider</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`// src/app/layout.tsx
import { NDPRProvider, ndprPreset } from '@tantainnovative/ndpr-toolkit';
import '@tantainnovative/ndpr-toolkit/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NDPRProvider preset={ndprPreset}>
          {children}
        </NDPRProvider>
      </body>
    </html>
  );
}`}</code></pre>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3">File 2: Privacy policy page</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`// src/app/privacy-policy/page.tsx
import { PrivacyPolicyPreset } from '@tantainnovative/ndpr-toolkit';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <PrivacyPolicyPreset
        organization="Acme Ltd"
        email="privacy@acme.ng"
        website="https://acme.ng"
      />
    </main>
  );
}`}</code></pre>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3">File 3: DSR (data subject request) page</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`// src/app/data-rights/page.tsx
import { DSRPreset } from '@tantainnovative/ndpr-toolkit';

export default function DataRightsPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <DSRPreset
        organizationName="Acme Ltd"
        onSubmit={async (submission) => {
          await fetch('/api/dsr', {
            method: 'POST',
            body: JSON.stringify(submission),
          });
        }}
      />
    </main>
  );
}`}</code></pre>
          </div>
        </div>

        <p className="mb-4">
          That is a fully functional, NDPA 2023-compliant implementation. The consent banner, privacy policy, and DSR
          form are live with no additional configuration.
        </p>
      </section>

      <section id="all-presets" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">All 8 Presets</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Preset</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Default Behaviour</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Required Props</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">ndprPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Consent banner (bottom), localStorage adapter, 3 default categories
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">—</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">ConsentPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Standalone consent banner, cookie-based storage, NDPA-compliant category labels
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">—</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">DSRPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Full DSR form with all 6 NDPA request types, success confirmation, email notification hook
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">organizationName, onSubmit</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">DPIAPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Multi-section DPIA questionnaire with risk matrix, PDF export
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">projectName</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">BreachPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Breach notification form, 72-hour timer, NDPC reporting checklist
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">onSubmit</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">PrivacyPolicyPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Full NDPA-compliant privacy policy with all required clauses, auto-date
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">organization, email</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">LawfulBasisPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Activity tracker with all 6 NDPA lawful bases, expiry alerts, audit log
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">—</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">ROPAPreset</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                  Record of Processing Activities register, CSV/PDF export, Article 44 references
                </td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">organizationName</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="overriding" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overriding Preset Defaults</h2>
        <p className="mb-4">
          Preset components accept the same props as the underlying compound components. Any prop you supply takes
          precedence over the preset default. Here are common overrides:
        </p>

        <h3 className="text-xl font-bold mb-3">Custom categories</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { ConsentPreset } from '@tantainnovative/ndpr-toolkit';

const myCategories = [
  { id: 'necessary', label: 'Essential', description: '...', required: true },
  { id: 'performance', label: 'Performance', description: '...' },
  { id: 'social', label: 'Social Media', description: '...' },
];

// Overrides the preset's default categories
<ConsentPreset categories={myCategories} />`}</code></pre>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3">Custom position and styling</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`<ConsentPreset
  position="top"           // 'top' | 'bottom' | 'center'
  theme="dark"             // 'light' | 'dark' | 'system'
  classNames={{
    banner: 'border-t-2 border-green-500',
    acceptButton: 'bg-green-600 hover:bg-green-700',
  }}
/>`}</code></pre>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3">Custom copy</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`<ConsentPreset
  title="Your privacy, your choice"
  description="We collect data only with your permission and in line with the NDPA 2023."
  acceptAllLabel="Yes, I agree"
  rejectAllLabel="No thanks"
  privacyPolicyUrl="/legal/privacy"
/>`}</code></pre>
          </div>
        </div>
      </section>

      <section id="with-provider" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using Presets with NDPRProvider</h2>
        <p className="mb-4">
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> is an optional root provider that forwards a preset — and optionally an adapter — to all
          toolkit components in your React tree. This is the recommended approach for Next.js app router projects because
          it avoids prop-drilling the preset configuration.
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`// src/app/layout.tsx
import {
  NDPRProvider,
  ndprPreset,
  apiAdapter,
} from '@tantainnovative/ndpr-toolkit';

const consentAdapter = apiAdapter({ baseUrl: '/api/consent' });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NDPRProvider
          preset={{
            ...ndprPreset,
            // Override specific preset fields at the provider level
            consentPosition: 'bottom',
            privacyPolicyUrl: '/privacy',
          }}
          adapter={consentAdapter}
        >
          {children}
        </NDPRProvider>
      </body>
    </html>
  );
}`}</code></pre>
          </div>
        </div>
      </section>

      <section id="with-adapters" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using Presets with Custom Adapters</h2>
        <p className="mb-4">
          All presets default to <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>. Pass a different adapter via the
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">adapter</code> prop (or via <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">NDPRProvider</code>) to switch to API-backed storage:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import {
  ConsentPreset,
  composeAdapters,
  localStorageAdapter,
  apiAdapter,
} from '@tantainnovative/ndpr-toolkit';

const adapter = composeAdapters([
  localStorageAdapter,
  apiAdapter({ baseUrl: '/api/consent' }),
]);

export function App() {
  return <ConsentPreset adapter={adapter} />;
}`}</code></pre>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          See the <Link href="/docs/guides/adapters" className="text-blue-600 dark:text-blue-400 hover:underline">Storage Adapters guide</Link> for the full adapter API and the <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">composeAdapters</code> pattern.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/adapters" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Storage Adapters &rarr;
          </Link>
          <Link href="/docs/guides/compound-components" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Compound Components &rarr;
          </Link>
          <Link href="/docs/guides/backend-integration" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Backend Integration &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
