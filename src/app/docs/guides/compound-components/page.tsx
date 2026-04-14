'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CompoundComponentsGuide() {
  return (
    <DocLayout
      title="Compound Components"
      description="Compose full UI flows from small, focused sub-components using the v3 compound component pattern"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What Are Compound Components?</h2>
        <p className="mb-4">
          The v3 toolkit exposes every module as a <strong>compound component</strong> — a namespace object whose
          properties are individual, purpose-built sub-components that share state through React context.
          You assemble them like building blocks rather than configuring a single monolithic component via props.
        </p>
        <p className="mb-4">
          This pattern gives you:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Full control over layout — sub-components render wherever you place them in JSX</li>
          <li>Selective rendering — only mount the pieces you actually need</li>
          <li>Easy custom wrappers — wrap any sub-component with your own UI without forking library code</li>
          <li>Predictable state — all sub-components within a <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Provider</code> share a single source of truth</li>
        </ul>
      </section>

      <section id="provider-pattern" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The Provider + Sub-components Pattern</h2>
        <p className="mb-4">
          Every module follows the same structure. The <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Provider</code> establishes context and accepts
          configuration. All other sub-components must be rendered inside a <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Provider</code>.
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`// Pattern:
<Module.Provider config={...}>
  <Module.SubComponentA />
  <Module.SubComponentB />
  <Module.SubComponentC />
</Module.Provider>`}</code></pre>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Sub-components do not need to be direct children — they can be deeply nested inside your own layout
            components as long as the <code className="bg-blue-800 dark:bg-blue-200 px-1 rounded text-xs">Provider</code> is an ancestor in the React tree.
          </p>
        </div>
      </section>

      <section id="consent-example" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Example: Consent Module</h2>
        <p className="mb-4">
          Here is a complete consent banner built from <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Consent.*</code> sub-components.
          Notice how the layout is entirely controlled by your JSX — the library provides the logic and accessible
          markup, you provide the arrangement.
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { Consent } from '@tantainnovative/ndpr-toolkit';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit';

const categories = [
  { id: 'necessary', label: 'Necessary', description: 'Core site functionality', required: true },
  { id: 'analytics', label: 'Analytics', description: 'Understand visitor behaviour' },
  { id: 'marketing', label: 'Marketing', description: 'Personalised advertising' },
];

export function MyConsentBanner() {
  return (
    <Consent.Provider
      categories={categories}
      adapter={localStorageAdapter}
      onSave={(consents) => console.log('Saved:', consents)}
    >
      {/* The banner slides up from the bottom */}
      <Consent.Banner position="bottom">
        {/* Heading + description live here */}
        <Consent.Title>We value your privacy</Consent.Title>
        <Consent.Description>
          We use cookies to improve your experience. You can customise your choices below.
        </Consent.Description>

        {/* Renders a toggle for each category */}
        <Consent.CategoryList />

        {/* Action buttons — layout determined by your CSS */}
        <div className="flex gap-3 mt-4">
          <Consent.AcceptAllButton className="btn btn-primary" />
          <Consent.RejectAllButton className="btn btn-outline" />
          <Consent.SaveButton className="btn btn-secondary" />
        </div>
      </Consent.Banner>

      {/* Floating trigger to re-open preferences */}
      <Consent.PreferencesButton />
    </Consent.Provider>
  );
}`}</code></pre>
          </div>
        </div>
      </section>

      <section id="custom-layouts" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Building Custom Layouts</h2>
        <p className="mb-4">
          Because sub-components are independent, you can build arbitrarily complex layouts. The following example
          puts consent preferences in a modal dialog rather than a bottom banner:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { Consent } from '@tantainnovative/ndpr-toolkit';
import { Dialog } from '@/components/ui/Dialog';
import { useState } from 'react';

export function ConsentModal() {
  const [open, setOpen] = useState(false);

  return (
    <Consent.Provider categories={categories}>
      {/* A plain button that opens the modal */}
      <button onClick={() => setOpen(true)}>Privacy Settings</button>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Consent.Title>Privacy Preferences</Consent.Title>
          <Consent.Description>
            Manage how we use your data.
          </Consent.Description>
          <Consent.CategoryList className="my-6" />
          <div className="flex justify-end gap-2">
            <Consent.RejectAllButton />
            <Consent.SaveButton onSave={() => setOpen(false)} />
          </div>
        </Dialog.Content>
      </Dialog>
    </Consent.Provider>
  );
}`}</code></pre>
          </div>
        </div>

        <p className="mb-4">
          You can also access the shared context directly with module-specific hooks to build fully bespoke UI:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { useConsentContext } from '@tantainnovative/ndpr-toolkit';

// Must be rendered inside <Consent.Provider>
export function CustomConsentToggle({ categoryId }: { categoryId: string }) {
  const { consents, updateConsent } = useConsentContext();
  const enabled = consents[categoryId] ?? false;

  return (
    <label>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => updateConsent(categoryId, e.target.checked)}
      />
      Custom {categoryId} toggle
    </label>
  );
}`}</code></pre>
          </div>
        </div>
      </section>

      <section id="all-modules" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">All 8 Modules and Their Sub-components</h2>
        <p className="mb-4">
          Every module follows the same compound component pattern. The table below lists the available sub-components
          for each module. All are accessible from{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Module</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Import</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Sub-components</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Consent</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">Consent</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, Banner, Title, Description, CategoryList, AcceptAllButton, RejectAllButton, SaveButton, PreferencesButton
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">DSR</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">DSR</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, Form, RequestTypeSelector, IdentityFields, DetailsField, SubmitButton, SuccessMessage, StatusTracker
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">DPIA</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">DPIA</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, Questionnaire, Section, Question, RiskMatrix, Summary, ExportButton
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Breach</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">Breach</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, NotificationForm, SeverityIndicator, TimelineTracker, RegulatoryChecklist, SubmitButton
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Privacy Policy</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">PrivacyPolicy</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, Generator, Section, Preview, ExportButton, LastUpdated
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Lawful Basis</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">LawfulBasis</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, Tracker, BasisSelector, ActivityList, ExpiryAlert, AuditLog
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Cross-Border</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">CrossBorder</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, TransferList, CountrySelector, SafeguardPicker, RiskAssessment, ApprovalStatus
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">ROPA</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">ROPA</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                  Provider, ActivityRegister, ActivityForm, CategoryBadge, RetentionSchedule, ExportButton
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="unstyled" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Unstyled Mode</h2>
        <p className="mb-4">
          Every sub-component accepts an <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">unstyled</code> prop that strips all default Tailwind classes.
          Pass your own via <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">className</code> to integrate with any design system:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`<Consent.Provider categories={categories} unstyled>
  <Consent.Banner className="my-custom-banner">
    <Consent.CategoryList className="my-category-list" />
    <Consent.AcceptAllButton className="my-btn my-btn--primary" />
  </Consent.Banner>
</Consent.Provider>`}</code></pre>
          </div>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/presets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Zero-config Presets &rarr;
          </Link>
          <Link href="/docs/guides/styling-customization" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Styling &amp; Customization &rarr;
          </Link>
          <Link href="/docs/components/consent-management" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Consent Component Docs &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
