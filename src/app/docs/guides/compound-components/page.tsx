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
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What Are Compound Components?</h2>
        <p className="mb-4 text-foreground">
          The v3 toolkit exposes every module as a <strong>compound component</strong> — a namespace object whose
          properties are individual, purpose-built sub-components that share state through React context.
          You assemble them like building blocks rather than configuring a single monolithic component via props.
        </p>
        <p className="mb-4 text-foreground">
          This pattern gives you:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1 text-foreground">
          <li>Full control over layout — sub-components render wherever you place them in JSX</li>
          <li>Selective rendering — only mount the pieces you actually need</li>
          <li>Easy custom wrappers — wrap any sub-component with your own UI without forking library code</li>
          <li>Predictable state — all sub-components within a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Provider</code> share a single source of truth</li>
        </ul>
      </section>

      <section id="provider-pattern" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The Provider + Sub-components Pattern</h2>
        <p className="mb-4 text-foreground">
          Every module follows the same structure. The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Provider</code> establishes context and accepts
          configuration. All other sub-components must be rendered inside a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Provider</code>.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Pattern:
<Module.Provider config={...}>
  <Module.SubComponentA />
  <Module.SubComponentB />
  <Module.SubComponentC />
</Module.Provider>`}</code></pre>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Sub-components do not need to be direct children — they can be deeply nested inside your own layout
            components as long as the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">Provider</code> is an ancestor in the React tree.
          </p>
        </div>
      </section>

      <section id="consent-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: Consent Module</h2>
        <p className="mb-4 text-foreground">
          Here is a complete consent banner built from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.*</code> sub-components.
          Notice how the layout is entirely controlled by your JSX — the library provides the logic and accessible
          markup, you provide the arrangement.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { Consent } from '@tantainnovative/ndpr-toolkit';
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
      </section>

      <section id="custom-layouts" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Building Custom Layouts</h2>
        <p className="mb-4 text-foreground">
          Because sub-components are independent, you can build arbitrarily complex layouts. The following example
          puts consent preferences in a modal dialog rather than a bottom banner:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { Consent } from '@tantainnovative/ndpr-toolkit';
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

        <p className="mb-4 text-foreground">
          You can also access the shared context directly with module-specific hooks to build fully bespoke UI:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { useConsentContext } from '@tantainnovative/ndpr-toolkit';

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
      </section>

      <section id="dsr-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: DSR Module</h2>
        <p className="mb-4 text-foreground">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSR</code> compound component handles Data Subject Request submissions and status tracking.
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSR.Form</code> sub-component orchestrates the multi-step request form while
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSR.Tracker</code> lets users follow up on submitted requests.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { DSR } from '@tantainnovative/ndpr-toolkit';

const dsrConfig = {
  organizationName: 'Acme Ltd',
  contactEmail: 'privacy@acme.com',
  requestTypes: ['access', 'deletion', 'rectification', 'portability'],
  onSubmit: async (request) => {
    const res = await fetch('/api/dsr', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.json(); // { requestId: 'DSR-001' }
  },
};

export function DSRPage() {
  return (
    <DSR.Provider config={dsrConfig}>
      {/* Submission form — renders request type selector, identity
          fields, and details textarea automatically */}
      <DSR.Form
        onSuccess={(requestId) =>
          console.log('Request submitted:', requestId)
        }
      />

      {/* Optional: let returning users check request status */}
      <DSR.Dashboard className="mt-8" />
    </DSR.Provider>
  );
}

// --- Or track a single known request ---
export function DSRStatusPage({ requestId }: { requestId: string }) {
  return (
    <DSR.Provider config={dsrConfig}>
      <DSR.Tracker requestId={requestId} />
    </DSR.Provider>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="dpia-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: DPIA Module</h2>
        <p className="mb-4 text-foreground">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIA</code> compound component guides privacy teams through a Data Protection Impact Assessment.
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIA.StepIndicator</code> shows progress, while <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIA.Report</code> renders
          the generated assessment summary.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { DPIA } from '@tantainnovative/ndpr-toolkit';

const dpiaConfig = {
  projectName: 'Customer Analytics Pipeline',
  assessor: 'Data Protection Officer',
  onComplete: (assessment) => {
    console.log('DPIA complete, risk level:', assessment.riskLevel);
  },
};

export function DPIAWorkflow() {
  return (
    <DPIA.Provider config={dpiaConfig}>
      {/* Step progress bar: "Describe Processing → Assess Necessity →
          Identify Risks → Mitigations → Sign-off" */}
      <DPIA.StepIndicator className="mb-6" />

      {/* Renders the active step's questions */}
      <DPIA.Questionnaire />

      {/* Once all steps complete, show the final risk report */}
      <DPIA.Report className="mt-8" />
    </DPIA.Provider>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="breach-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: Breach Module</h2>
        <p className="mb-4 text-foreground">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Breach</code> compound component covers the full data-breach response workflow —
          initial report, risk assessment, and regulatory notification drafting — all wired together through a shared Provider context.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { Breach } from '@tantainnovative/ndpr-toolkit';

const breachConfig = {
  organizationName: 'Acme Ltd',
  dpoEmail: 'dpo@acme.com',
  regulatoryBody: 'NDPC',           // Nigeria Data Protection Commission
  notificationDeadlineHours: 72,    // NDPA 2023 requirement
  onSubmit: async (report) => {
    await fetch('/api/breach-reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },
};

export function BreachResponsePage() {
  return (
    <Breach.Provider config={breachConfig}>
      {/* Step 1: Capture initial breach details */}
      <Breach.ReportForm />

      {/* Step 2: Guided risk assessment (severity, affected subjects) */}
      <Breach.RiskAssessment className="mt-6" />

      {/* Step 3: Manage notifications to affected individuals */}
      <Breach.NotificationManager className="mt-6" />

      {/* Step 4: Generate the formatted regulatory report */}
      <Breach.ReportGenerator className="mt-6" />
    </Breach.Provider>
  );
}`}</code></pre>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA 72-hour Requirement</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The NDPA 2023 requires controllers to notify the Nigeria Data Protection Commission within 72 hours of becoming
            aware of a qualifying breach. The <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">notificationDeadlineHours</code> config value
            drives the countdown timer surfaced by <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">Breach.NotificationManager</code>.
          </p>
        </div>
      </section>

      <section id="all-modules" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">All 8 Modules and Their Sub-components</h2>
        <p className="mb-4 text-foreground">
          Every module follows the same compound component pattern. The table below lists the available sub-components
          for each module. All are accessible from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Import</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Sub-components</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">Consent</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Consent</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Banner, Settings, Storage, OptionList, AcceptButton, RejectButton, SaveButton
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">DSR</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">DSR</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Form, Dashboard, Tracker
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">DPIA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">DPIA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Questionnaire, Report, StepIndicator
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">Breach</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Breach</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, ReportForm, RiskAssessment, NotificationManager, ReportGenerator
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">Policy</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Policy</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Generator, Preview, Exporter
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">LawfulBasis</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">LawfulBasis</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Tracker
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">CrossBorder</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">CrossBorder</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Manager
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-semibold text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Manager
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="unstyled" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Unstyled Mode</h2>
        <p className="mb-4 text-foreground">
          Every sub-component accepts an <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> prop that strips all default Tailwind classes.
          Pass your own via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code> to integrate with any design system:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`<Consent.Provider categories={categories} unstyled>
  <Consent.Banner className="my-custom-banner">
    <Consent.CategoryList className="my-category-list" />
    <Consent.AcceptAllButton className="my-btn my-btn--primary" />
  </Consent.Banner>
</Consent.Provider>`}</code></pre>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
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
