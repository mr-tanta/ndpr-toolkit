'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CompoundComponentsGuide() {
  return (
    <DocLayout
      title="Compound Components"
      description="The toolkit's lowest-level UI primitives. The state machine ships with the library; the layout is yours."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Compound components are namespace objects (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSR</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Breach</code>, etc.) whose properties are small, focused
          sub-components that share state through React context. You assemble them like building blocks rather
          than configuring a single monolithic component via props.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          They sit between the two ends of the toolkit&apos;s API spectrum:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/presets" className="text-primary hover:underline">Presets</Link> — drop in a single component, get a working flow.</li>
          <li><strong>Compound components</strong> — keep the toolkit&apos;s state machine, control every DOM node.</li>
          <li><Link href="/docs/guides/headless" className="text-primary hover:underline">Headless hooks</Link> — pure state, no markup at all.</li>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Use a compound component when you want the toolkit to own the consent / DSR / DPIA lifecycle
            (persistence, validation, &quot;Accept All&quot; semantics, NDPA invariants) but you want to write the layout
            yourself — different copy, different ordering, different wrapping elements, your own design system.
          </p>
        </div>
      </section>

      <section id="consent-quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart — the Consent compound</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The Consent compound is the most complete of the bunch. It exposes a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Provider</code>, individual
          buttons (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">AcceptButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RejectButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">SaveButton</code>), an{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">OptionList</code> with per-option
          checkboxes, and the pre-assembled <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Banner</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Settings</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Storage</code> primitives.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { Consent } from '@tantainnovative/ndpr-toolkit/consent';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type { ConsentOption, ConsentSettings } from '@tantainnovative/ndpr-toolkit/consent';

const options: ConsentOption[] = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Required for the site to work. Cannot be disabled.',
    required: true,
    purpose: 'Site operation',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Helps us understand how visitors use the site.',
    required: false,
    purpose: 'Usage analytics',
  },
];

export function MyConsentBanner() {
  return (
    <Consent.Provider
      options={options}
      adapter={localStorageAdapter<ConsentSettings>('ndpr_consent')}
      version="1.0"
    >
      <aside role="dialog" aria-labelledby="consent-title" className="my-banner">
        <h2 id="consent-title">We value your privacy</h2>
        <p>You can change your choices at any time.</p>

        <Consent.OptionList />

        <div className="my-banner__actions">
          <Consent.AcceptButton>Accept all</Consent.AcceptButton>
          <Consent.RejectButton>Reject all</Consent.RejectButton>
          <Consent.SaveButton>Save preferences</Consent.SaveButton>
        </div>
      </aside>
    </Consent.Provider>
  );
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Provider</code> calls{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useConsent</code> under the hood, wires the
          adapter, and publishes the consent state to every descendant. The sub-components below it render the
          parts you ask for — no more, no less.
        </p>
      </section>

      <section id="consent-pieces" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The Consent sub-components</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Provider</code></h3>
        <p className="mb-3 text-foreground leading-relaxed">
          Establishes the consent context. Required ancestor for every other piece.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`interface ConsentProviderProps {
  options: ConsentOption[];
  adapter?: StorageAdapter<ConsentSettings>;
  version?: string;
  onChange?: (settings: ConsentSettings) => void;
  children: React.ReactNode;
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed text-sm">
          Each <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentOption</code> has{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">id</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">label</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">required</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">purpose</code>. The{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">purpose</code> field is required by
          NDPA Section 25(2) — consent must be specific to each purpose.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.OptionList</code></h3>
        <p className="mb-3 text-foreground leading-relaxed">
          Renders an accessible checkbox per option, with labels and descriptions. Honours the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">required</code> flag (those checkboxes
          render disabled and pre-checked).
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<Consent.OptionList
  classNames={{
    root: 'space-y-3',
    optionItem: 'flex items-start gap-3',
    optionCheckbox: 'mt-1',
    optionLabel: 'font-medium',
    optionDescription: 'text-sm text-muted-foreground',
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.AcceptButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.RejectButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.SaveButton</code>
        </h3>
        <p className="mb-3 text-foreground leading-relaxed">
          Each renders a single <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;button&gt;</code> wired to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">acceptAll</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rejectAll</code>, or{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">updateConsent</code> respectively. They all
          accept <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">children</code> (label override),{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code>.{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">SaveButton</code> additionally accepts a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">consents</code> map if you want to drive
          its payload from your own checkbox state.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Banner</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Settings</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Storage</code>
        </h3>
        <p className="mb-3 text-foreground leading-relaxed">
          These are re-exports of the higher-level <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentBanner</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentManager</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentStorage</code> components — useful when
          you want most of the toolkit&apos;s default UI but still wrap it in a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Provider</code> to share state with custom
          children. They don&apos;t consume the compound context; they manage their own state from the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options</code> you hand them.
        </p>
      </section>

      <section id="useConsentCompound" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
          Custom sub-components with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useConsentCompound</code>
        </h2>
        <p className="mb-4 text-foreground leading-relaxed">
          To write your own buttons or read-only views, call <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useConsentCompound</code>{' '}
          inside any descendant of <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Provider</code>:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { useConsentCompound } from '@tantainnovative/ndpr-toolkit/consent';

function AnalyticsToggle() {
  const { hasConsent, updateConsent } = useConsentCompound();
  const enabled = hasConsent('analytics');

  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={enabled}
        onChange={e => updateConsent({ analytics: e.target.checked })}
      />
      Enable analytics
    </label>
  );
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          The hook returns the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentContextValue</code>:{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">settings</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">hasConsent</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">updateConsent</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">acceptAll</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rejectAll</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">resetConsent</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">shouldShowBanner</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">isValid</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validationErrors</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">isLoading</code>.
        </p>
        <p className="mb-4 text-foreground leading-relaxed text-sm">
          Calling it outside a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Consent.Provider</code> throws — keep
          custom components inside the same subtree.
        </p>
      </section>

      <section id="other-modules" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Compound namespaces for the other modules</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The other modules ship a Provider plus a slot for each existing high-level component. They are thinner
          than the Consent compound — useful when you want a Provider/context wrapper for state sharing and a stable
          naming convention, but not a per-button breakdown.
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Namespace</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Import</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Sub-components</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">Consent</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/consent</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, OptionList, AcceptButton, RejectButton, SaveButton, Banner, Settings, Storage
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">DSR</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/dsr</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Form, Dashboard, Tracker
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">DPIA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/dpia</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Questionnaire, Report, StepIndicator
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">Breach</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/breach</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, ReportForm, RiskAssessment, NotificationManager, ReportGenerator
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">Policy</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/policy</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">
                  Provider, Generator, Preview, Exporter
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">LawfulBasis</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/lawful-basis</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Provider, Tracker</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">CrossBorder</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/cross-border</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Provider, Manager</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">/ropa</td>
                <td className="border border-border px-4 py-2 font-mono text-xs text-foreground">Provider, Manager</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-foreground leading-relaxed text-sm">
          Only the Consent compound exposes a granular button/option breakdown today. For the other modules, use
          the compound when you want a Provider with state context, and reach for{' '}
          <Link href="/docs/guides/headless" className="text-primary hover:underline">headless hooks</Link>{' '}
          (e.g. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useBreach</code>) when you need to swap the
          whole UI.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">DSR example</h3>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { DSR } from '@tantainnovative/ndpr-toolkit/dsr';
import type { RequestType } from '@tantainnovative/ndpr-toolkit/dsr';

const requestTypes: RequestType[] = [
  {
    id: 'access',
    name: 'Access my data',
    description: 'Request a copy of your personal data.',
    ndpaSection: 'Section 34(1)(a)–(b)',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

export function DSRPage() {
  return (
    <DSR.Provider
      requestTypes={requestTypes}
      onSubmit={(req) => console.log('submitted', req.id)}
    >
      <DSR.Form />
      <DSR.Dashboard />
    </DSR.Provider>
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Breach example</h3>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { Breach } from '@tantainnovative/ndpr-toolkit/breach';
import type { BreachCategory } from '@tantainnovative/ndpr-toolkit/breach';

const categories: BreachCategory[] = [
  { id: 'unauthorized_access', name: 'Unauthorized access', description: '…', defaultSeverity: 'high' },
];

export function BreachResponse() {
  return (
    <Breach.Provider categories={categories}>
      <Breach.ReportForm />
      <Breach.RiskAssessment />
      <Breach.NotificationManager />
      <Breach.ReportGenerator />
    </Breach.Provider>
  );
}`}</code>
        </pre>
      </section>

      <section id="unstyled" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Unstyled mode</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every Consent sub-component (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">OptionList</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">AcceptButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RejectButton</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">SaveButton</code>) accepts an{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> prop that strips the toolkit&apos;s
          default BEM classes. Pair it with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code>{' '}
          or <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> to plug in your own design system.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<Consent.Provider options={options}>
  <Consent.OptionList unstyled classNames={{ root: 'space-y-2' }} />
  <Consent.AcceptButton unstyled className="btn-primary">Accept all</Consent.AcceptButton>
  <Consent.RejectButton unstyled className="btn-ghost">Reject all</Consent.RejectButton>
</Consent.Provider>`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/presets" className="text-primary hover:underline">Zero-config presets</Link> — one component, sensible defaults.</li>
          <li><Link href="/docs/guides/headless" className="text-primary hover:underline">Headless / hooks-only API</Link> — drop UI entirely; keep state.</li>
          <li><Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">Styling architecture</Link> — BEM classes,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> CSS variables, and the{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> entry.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
