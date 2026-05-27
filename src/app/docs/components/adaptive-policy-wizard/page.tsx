'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function AdaptivePolicyWizardDocs() {
  return (
    <DocLayout
      title="AdaptivePolicyWizard"
      description="Four-step guided privacy-policy generator with live compliance scoring, sector pre-fills, custom sections, draft autosave, and one-click PDF / DOCX / HTML / Markdown export."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">AdaptivePolicyWizard</code> is the high-level UI for the toolkit&apos;s policy
          engine. It walks the user through four steps — About, Data, Processing, Review — and produces a typed
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> PrivacyPolicy</code> object plus PDF, DOCX, HTML, and Markdown exports.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Unlike the lower-level <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PolicyGenerator</code> (which renders a single form against a fixed
          template), the wizard <em>adapts</em>: it pre-fills lawful basis, data categories, sensitive-data flags, and
          cross-border defaults based on the chosen sector template, and re-runs compliance checks every time the user
          edits the context.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          The wizard is exported from the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/policy</code> subpath:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { AdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/policy';`}</code>
        </pre>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { AdaptivePolicyWizard, templateContextFor } from '@tantainnovative/ndpr-toolkit/policy';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type { PolicyDraft } from '@tantainnovative/ndpr-toolkit/policy';

export default function PolicyBuilderPage() {
  return (
    <AdaptivePolicyWizard
      // Seed step 1 with an ecommerce-flavoured pre-fill
      initialContext={templateContextFor('ecommerce')}
      // Auto-save drafts to localStorage every ~2 seconds
      adapter={localStorageAdapter<PolicyDraft>('ndpr_policy_draft')}
      onComplete={(policy) => {
        // policy is a typed PrivacyPolicy object — persist or render it
        console.log('finished policy', policy);
      }}
    />
  );
}`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Prop</th>
                <th className="text-left py-2 pr-4 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">StorageAdapter&lt;PolicyDraft&gt;</code></td>
                <td className="py-2">Optional draft persistence. Pass <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code>, or your own implementation.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`(policy: PrivacyPolicy) => void`}</code></td>
                <td className="py-2">Fired when the user finishes the Review step. Receives the finalised typed policy.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialContext</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">TemplateContext</code></td>
                <td className="py-2">Seed for step 1. Use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">templateContextFor(&apos;saas&apos; | &apos;ecommerce&apos; | &apos;healthcare&apos; | ...)</code> for a sector pre-fill. A saved draft from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code> wins over <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialContext</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Record&lt;string, string&gt;</code></td>
                <td className="py-2">Per-slot class overrides — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">root</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">container</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">topBar</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mainPanel</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">sidebarWrapper</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">backButton</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">nextButton</code>, etc.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Strip every default class for a from-scratch design.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="vs-policy-generator" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Wizard vs PolicyGenerator</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Both ship in the same module — choose based on how much guidance you want:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PolicyGenerator</code></Link> — single-form, fixed template, no compliance checker. Best when you already know what your policy should contain and just need a form to capture variables.</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">AdaptivePolicyWizard</code> — four-step flow, sector-aware pre-fills, live compliance scoring with one-click fixes, custom sections, autosave, multi-format export. Best for end-user-facing policy builders.</li>
        </ul>
      </section>

      <section id="headless" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Headless hook: useAdaptivePolicyWizard</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          If you want the same state machine but a completely custom UI, the wizard is backed by the
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> useAdaptivePolicyWizard</code> hook (also exported from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code>). It returns the same step
          management, context updates, compliance result, and export handlers — render whatever you like on top.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { useAdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/headless';

const {
  currentStep, nextStep, prevStep, canProceed,
  context, updateOrg, toggleDataCategory, togglePurpose,
  sections, complianceResult, applyFix,
  handleExportPDF, handleExportDOCX, handleExportHTML, handleExportMarkdown,
  lastSavedAt, isLoading,
} = useAdaptivePolicyWizard({ adapter, onComplete, initialContext });`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/components/policy-page" className="text-primary hover:underline">PolicyPage</Link> — render the typed <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PrivacyPolicy</code> object that <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete</code> returns.</li>
          <li><Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">PolicyGenerator</Link> — the simpler single-form alternative.</li>
          <li><Link href="/docs/guides/adapters" className="text-primary hover:underline">Storage adapters</Link> — wire draft autosave to localStorage, cookies, or a remote backend.</li>
          <li><Link href="/docs/guides/headless" className="text-primary hover:underline">Headless / hooks-only API</Link> — replace the bundled UI entirely.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
