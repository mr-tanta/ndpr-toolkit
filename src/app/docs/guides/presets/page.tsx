'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function PresetsGuide() {
  return (
    <DocLayout
      title="Zero-config Presets"
      description="Drop-in components with NDPA-compliant defaults. One import, one prop, one working flow."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Presets are thin wrappers around the toolkit&apos;s building-block components, pre-loaded with
          sensible defaults — default consent categories, default DSR request types, default DPIA sections,
          default breach categories. You drop them in and they work. When you outgrow the defaults, you swap
          one prop (an adapter, a category list, a piece of copy) instead of re-assembling the entire flow.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>Presets</strong> — fastest path. Defaults are NDPA-aware (Section 25, 34, 38…) out of the box.</li>
          <li><Link href="/docs/guides/compound-components" className="text-primary hover:underline">Compound components</Link> — keep the toolkit&apos;s state machine; control the markup.</li>
          <li><Link href="/docs/guides/headless" className="text-primary hover:underline">Headless hooks</Link> — pure state, no UI.</li>
        </ul>
      </section>

      <section id="all-presets" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The nine presets</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          All presets live under <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/presets</code>.
          Each one ships its prop interface alongside the component (e.g.{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRConsentProps</code>).
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRConsent</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Consent banner with four default categories (essential, analytics, marketing, preferences). Position
          top, bottom, centre, or inline. Accepts a typed <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">copy</code>{' '}
          override so you can brand the banner without dropping to the lower-level{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;ConsentBanner&gt;</code>.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<NDPRConsent
  adapter={localStorageAdapter('ndpr_consent')}
  position="bottom"
  copy={{
    title: 'Cookie preferences',
    description: 'Acme uses cookies to keep you signed in and improve our store.',
    acceptAll: 'Allow all',
    rejectAll: 'Only essentials',
  }}
  onSave={(settings) => console.log(settings)}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          DSR submission form with the seven NDPA request types (access, rectification, erasure, portability,
          restrict, object, withdraw_consent) pre-loaded, each annotated with its NDPA section reference. See
          the <em>Submission patterns</em> section below for the full{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code> workflow.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRSubjectRights
  submitTo="/api/dsr"
  onSubmitSuccess={({ body }) => {
    const ref = (body as { referenceId?: string })?.referenceId;
    if (ref) router.push(\`/dsr/confirmation?ref=\${ref}\`);
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRBreachReport</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Breach reporting form with five default categories (unauthorized access, data loss, data theft,
          system breach, accidental disclosure), each with a default severity. Wire{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmit</code> to your incident-response
          backend.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRBreachReport } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRBreachReport
  onSubmit={async (report) => {
    await fetch('/api/breach', { method: 'POST', body: JSON.stringify(report) });
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRPrivacyPolicy</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Adaptive policy wizard. Pass a sector <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">template</code>{' '}
          (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;saas&apos;</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;ecommerce&apos;</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;school&apos;</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;healthcare&apos;</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;procurement&apos;</code>) and the wizard
          opens pre-populated with the right data categories, lawful-basis defaults, and cross-border /
          sensitive-data flags. Users can still override every field.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRPrivacyPolicy } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRPrivacyPolicy
  template="healthcare"
  templateOverrides={{ orgName: 'Lagos Heart Centre' }}
  onComplete={(policy) => savePolicyDraft(policy)}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDPIA</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          DPIA questionnaire pre-loaded with four NDPA-aligned sections: project overview, necessity &amp;
          proportionality, risk identification, and risk mitigation. Each question carries a risk weight that
          feeds the overall assessment.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRDPIA } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRDPIA onResult={(result) => saveDPIA(result)} />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRLawfulBasis</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Processing-activity tracker. Persists the activity list through your adapter; the underlying tracker
          renders the table, add/edit forms, and per-activity lawful basis selector.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRLawfulBasis } from '@tantainnovative/ndpr-toolkit/presets';
import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<NDPRLawfulBasis adapter={localStorageAdapter('ndpr_lawful_basis')} />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRCrossBorder</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Cross-border transfer manager. Tracks each transfer destination, lawful basis, and safeguard. Async
          adapters (cookie, api) are rehydrated on mount.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRCrossBorder } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRCrossBorder adapter={localStorageAdapter('ndpr_cross_border')} />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRROPA</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Records of Processing Activities register. Manages the full{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RecordOfProcessingActivities</code> document —
          organisation metadata plus the per-activity record list.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRROPA } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRROPA adapter={localStorageAdapter('ndpr_ropa')} />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRComplianceDashboard</code></h3>
        <p className="mb-3 text-foreground leading-relaxed text-sm">
          Compliance score dashboard. Pass raw{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceInput</code> (counts and signals
          from your stack); the preset calls{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> internally and
          renders the score, breakdown, and recommendations. <strong>No adapter</strong> — this preset is
          purely presentational over a computed score.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRComplianceDashboard } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRComplianceDashboard
  input={{
    consent: { hasBanner: true, totalUsers: 1200, consentedUsers: 1050 },
    dsr: { totalRequests: 14, completedOnTime: 13 },
    // …see ComplianceInput in /core for the full shape
  }}
  maxRecommendations={5}
/>`}</code>
        </pre>
      </section>

      <section id="common-props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Common props</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Most presets share the same three props:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter?: StorageAdapter&lt;T&gt;</code> — persists
            the preset&apos;s state.{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code>, and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">memoryAdapter</code> all ship under{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/adapters</code>. See the{' '}
            <Link href="/docs/guides/adapters" className="text-primary hover:underline">adapters guide</Link> for the full surface.
          </li>
          <li>
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames?: {`{ … }`}</code> — per-slot class
            overrides. Each preset forwards its own{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ClassNames</code> type from the underlying
            component (e.g. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentBannerClassNames</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRRequestFormClassNames</code>).
          </li>
          <li>
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled?: boolean</code> — strips every
            default class. Pair with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> to
            plug the preset into your own design system.
          </li>
        </ul>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl mb-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            A typed <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">copy</code> prop currently ships on{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">NDPRConsent</code> only (see{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">NDPRConsentCopy</code>). For other presets, copy is
            controlled through the underlying component&apos;s props (e.g.{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">requestTypes</code> on{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">NDPRSubjectRights</code>,{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">sections</code> on{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">NDPRDPIA</code>).
          </p>
        </div>
      </section>

      <section id="dsr-submit" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
          Submission patterns for <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code>
        </h2>
        <p className="mb-4 text-foreground leading-relaxed">
          DSR is the one preset where most consumers reach for a public-form POST instead of a state-managed
          adapter. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code> ships four extra
          props for this:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo: string</code> — URL the form POSTs the JSON-serialised submission to.</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitOptions</code> — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ headers?, credentials? }`}</code>. Headers may be an object or a getter. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">credentials: &apos;same-origin&apos;</code>.</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitSuccess</code> — fires on 2xx. Receives <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ response, data, body }`}</code>, where <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">body</code> is the parsed JSON (or <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">undefined</code> for empty / non-JSON responses).</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitError</code> — fires on network error or non-2xx. Receives <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ error?, response? }`}</code>.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed text-sm">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">body</code> field is intentionally typed{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unknown</code> — narrow it yourself before
          reading server-issued reference numbers.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets';
import { useRouter } from 'next/navigation';

export function PublicDSRForm() {
  const router = useRouter();

  return (
    <NDPRSubjectRights
      submitTo="/api/dsr"
      submitOptions={{
        headers: () => ({ 'X-CSRF-Token': readCsrfCookie() }),
        credentials: 'same-origin',
      }}
      onSubmitSuccess={({ response, data, body }) => {
        const ref = (body as { referenceId?: string } | undefined)?.referenceId;
        if (ref) router.push(\`/dsr/confirmation?ref=\${ref}\`);
        else console.warn('DSR POST returned no referenceId', response, data);
      }}
      onSubmitError={({ error, response }) => {
        console.error('DSR submission failed', error ?? response);
      }}
    />
  );
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed text-sm">
          For complete control over headers, retries, or auth, build an{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> (which supports CSRF,
          retry, and error hooks) and pass it as <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code>{' '}
          instead. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code> is the fire-and-forget
          shortcut for public forms.
        </p>
      </section>

      <section id="subpaths" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Narrower subpath imports</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The three most common presets each ship under a dedicated subpath. They&apos;re identical to the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets</code> barrel re-exports — use them when
          you want a tighter dependency graph for that page&apos;s bundle.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Same export, narrower entry — bundler doesn't have to crawl the full barrel.
import { NDPRConsent }        from '@tantainnovative/ndpr-toolkit/presets/consent';
import { NDPRSubjectRights }  from '@tantainnovative/ndpr-toolkit/presets/dsr';
import { NDPRPrivacyPolicy }  from '@tantainnovative/ndpr-toolkit/presets/policy';`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed text-sm">
          The remaining six presets (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRBreachReport</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDPIA</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRLawfulBasis</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRCrossBorder</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRROPA</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRComplianceDashboard</code>) are reachable
          only via the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets</code> barrel for now.
        </p>
      </section>

      <section id="beyond" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Going beyond presets</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <Link href="/docs/guides/compound-components" className="text-primary hover:underline">Compound components</Link>{' '}
            — when you need to control the layout slot-by-slot but keep the toolkit&apos;s state machine.
          </li>
          <li>
            <Link href="/docs/guides/headless" className="text-primary hover:underline">Headless / hooks-only API</Link>{' '}
            — when you need the consent / DSR / DPIA state but want zero UI from the toolkit.
          </li>
          <li>
            <Link href="/docs/guides/styling-customization" className="text-primary hover:underline">Styling &amp; customization</Link>{' '}
            — the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot API and the{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> escape hatch in detail.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
