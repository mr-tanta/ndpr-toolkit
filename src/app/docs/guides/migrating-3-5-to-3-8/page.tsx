'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function MigratingFrom35To38Guide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Migrating from 3.5.x to 3.8.x — NDPA Toolkit',
    description:
      'A version-by-version migration guide for consumers of @tantainnovative/ndpr-toolkit upgrading from 3.5.x to 3.8.x. Covers accessibility, type fixes, the production-ready apiAdapter, per-preset subpaths, org templates, recipes, and the new Lite manager variants.',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
    keywords: [
      'NDPA Toolkit migration',
      'ndpr-toolkit upgrade',
      'Nigeria Data Protection Act',
      'React',
      'Next.js',
    ],
  };

  return (
    <DocLayout
      title="Migrating from 3.5.x to 3.8.x"
      description="Six releases landed between 3.5.x and 3.8.x. Every change is backward-compatible — this guide tells you what's new, what's worth adopting, and the one consolidated upgrade path most consumers actually need."
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex mb-6 space-x-2 flex-wrap gap-y-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          New in v3.8.1
        </span>
        <Link
          href="/docs/guides/upgrading-from-3-3"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          Upgrading from 3.3.x
        </Link>
        <Link
          href="/docs/guides/lite-vs-full"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          Lite vs Full managers
        </Link>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Who this is for</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          If you&apos;re on any 3.5.x release of <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code> and want
          to adopt 3.8.x, this is your single source. Six releases (3.5.4, 3.5.5, 3.5.6, 3.6.0,
          3.6.1, 3.6.2, 3.7.0, 3.8.0, 3.8.1) landed between them, all of them additive — no
          breaking API changes, no required code edits. Upgrading is{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">pnpm add @tantainnovative/ndpr-toolkit@latest</code>{' '}
          and then optionally adopting the new surface area.
        </p>
        <p className="mb-4 text-foreground">
          If you&apos;re still on 3.3.x or 3.4.x, read{' '}
          <Link href="/docs/guides/upgrading-from-3-3" className="text-primary hover:underline">
            Upgrading from 3.3.x
          </Link>{' '}
          first — that guide covers the BEM stylesheet import, the only required change in the
          3.3 → 3.5 jump.
        </p>
      </section>

      <section id="at-a-glance" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">At a glance</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Bucket</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Landed in</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Action required</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Accessibility</td>
                <td className="border border-border px-4 py-2 text-foreground">3.5.4</td>
                <td className="border border-border px-4 py-2 text-foreground">None — automatic</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Type fixes</td>
                <td className="border border-border px-4 py-2 text-foreground">3.5.5</td>
                <td className="border border-border px-4 py-2 text-foreground">None — corrects existing contracts</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">SEO / landing pages</td>
                <td className="border border-border px-4 py-2 text-foreground">3.5.6</td>
                <td className="border border-border px-4 py-2 text-foreground">None — site-only</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Developer-experience features</td>
                <td className="border border-border px-4 py-2 text-foreground">3.6.0</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>Optional</strong> — adopt to simplify integration</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Tooling / CLI</td>
                <td className="border border-border px-4 py-2 text-foreground">3.6.1, 3.6.2</td>
                <td className="border border-border px-4 py-2 text-foreground">None — companion packages</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Content (templates + recipes)</td>
                <td className="border border-border px-4 py-2 text-foreground">3.7.0</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>Optional</strong> — opt in via <code className="bg-muted px-1 py-0.5 rounded">template</code> prop</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Bundle size (Lite variants)</td>
                <td className="border border-border px-4 py-2 text-foreground">3.8.0</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>Optional</strong> — switch read-only views to <code className="bg-muted px-1 py-0.5 rounded">/lite</code></td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">DSR submission contract</td>
                <td className="border border-border px-4 py-2 text-foreground">3.8.1</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>Optional</strong> — adopt typed <code className="bg-muted px-1 py-0.5 rounded">onSubmitSuccess</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          <strong>Net: nothing breaks.</strong> Pin the new version, your app continues to
          compile and run. The rest of this guide tells you what you can opt into and how.
        </p>
      </section>

      <section id="v3-5-4" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.5.4 — Accessibility</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Two WCAG-related additions. The stylesheet now neutralises every toolkit animation
          and transition under <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@media (prefers-reduced-motion: reduce)</code>{' '}
          (WCAG 2.3.3). A new shared <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useFocusTrap</code>{' '}
          hook is exported from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/hooks</code>; it captures{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">document.activeElement</code> on activation,
          traps Tab cycling, optionally handles Escape, and restores focus on deactivation
          (WCAG 2.4.3). <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<ConsentBanner>`}</code>{' '}
          now uses it internally — closing the banner returns focus to the trigger element
          instead of resting on <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<body>`}</code>.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required</h3>
        <p className="mb-4 text-foreground">
          <strong>None.</strong> Both improvements are automatic. If you have your own modal
          surfaces that need the same behaviour, you can now reuse the hook:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { useFocusTrap } from '@tantainnovative/ndpr-toolkit/hooks';

function PreferencesModal({ open, onClose }: Props) {
  const ref = useFocusTrap<HTMLDivElement>({ active: open, onEscape: onClose });
  return open ? <div ref={ref} role="dialog" aria-modal="true">{/* ... */}</div> : null;
}`}</code></pre>
        </div>
      </section>

      <section id="v3-5-5" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.5.5 — Type fixes</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Three corrections to type surface area that previously misrepresented runtime
          behaviour:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR.submitRequest</code></strong>{' '}
            — its <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Omit&lt;...&gt;</code> argument
            previously referenced <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submittedAt</code> and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">estimatedCompletionDate</code>, which don&apos;t exist on{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRRequest</code>. Corrected to{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Omit&lt;DSRRequest, &apos;id&apos; | &apos;status&apos; | &apos;createdAt&apos; | &apos;updatedAt&apos; | &apos;dueDate&apos;&gt;</code>.
          </li>
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR.getRequestsByStatus</code></strong>{' '}
            now accepts <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRStatus | RequestStatus</code>{' '}
            — modern callers using literals like <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;awaitingVerification&apos;</code>{' '}
            no longer get a type error.
          </li>
          <li>
            <strong>DPIA type leak</strong> — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIAProvider</code> and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRDPIA>`}</code> props now use the
            newly exported <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIAAnswerMap</code> and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIAAnswerValue</code> instead of{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Record&lt;string, any&gt;</code>, restoring callsite type-safety on{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialAnswers</code>, and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code>.
          </li>
        </ul>
        <p className="mb-4 text-foreground">
          Also: 8 new tests on the 72-hour NDPC breach-notification deadline path
          (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useBreach.getBreachesRequiringNotification</code>) covering
          the 1h / 24h / 48h / 71.5h / expired / sort-by-urgency / already-notified cases.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required</h3>
        <p className="mb-4 text-foreground">
          <strong>None for most consumers.</strong> If you were typing your DSR payload
          manually with the broken <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Omit</code>, your code becomes more
          type-safe automatically. If you were casting your DPIA answers as{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">any</code>, you can now drop the cast:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import type { DPIAAnswerMap } from '@tantainnovative/ndpr-toolkit';

const initial: DPIAAnswerMap = {
  'data-categories': ['name', 'email'],
  'has-children-data': false,
};

<NDPRDPIA initialAnswers={initial} onComplete={(answers) => save(answers)} />`}</code></pre>
        </div>
      </section>

      <section id="v3-5-6" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.5.6 — SEO + landing pages</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Site-only release. Three long-tail landing pages were added under{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndprtoolkit.com.ng</code>, page metadata
          was tightened to disambiguate <em>Nigeria</em> from generic data-protection queries,
          and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">application/ld+json</code> structured-data blocks were added to the
          highest-traffic doc pages.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required</h3>
        <p className="mb-4 text-foreground">
          <strong>None.</strong> The library bundle is unchanged.
        </p>
      </section>

      <section id="v3-6-0" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.6.0 — Developer feedback</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          The biggest functional release in the 3.5 → 3.8 window. Four discrete improvements,
          all responses to integration feedback from production deployments:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> is production-ready.</strong>{' '}
            Adds <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">credentials</code> (defaults{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;same-origin&apos;</code>, set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;include&apos;</code> for cross-origin), dynamic{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">headers</code> (function form for runtime CSRF token lookup),{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">loadMethod</code>/<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">saveMethod</code>{' '}
            overrides, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unwrap</code> (for <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ data: ... }`}</code> envelopes),
            configurable <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">retry</code> with exponential backoff and a{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">shouldRetry</code> predicate, and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onError</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSuccess</code> hooks for telemetry.
          </li>
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRConsent copy={...} />`}</code></strong>{' '}
            — override <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">acceptAll</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rejectAll</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">customize</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">save</code> strings without dropping to the
            lower-level <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<ConsentBanner>`}</code>.
          </li>
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRSubjectRights submitTo="..." />`}</code></strong>{' '}
            — public sites can now POST submissions to a backend route instead of being
            state-managed by an adapter. Pairs with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitOptions</code>{' '}
            (credentials, headers) and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitError</code>. The existing{' '}
            state-managed <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code> mode is unchanged.
          </li>
          <li>
            <strong>Per-preset subpath entries</strong> —{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets/consent</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets/dsr</code>, and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets/policy</code> ship only one preset each
            (~4 KB vs ~8 KB for the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets</code> barrel).
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required (optional)</h3>
        <p className="mb-4 text-foreground">
          All four are opt-in. The most impactful for production deployments is the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> upgrade — recommended diff:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Before — 3.5.x style, no telemetry, no retry
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
const adapter = apiAdapter<ConsentSettings>({ url: '/api/consent' });

// After — 3.6.0+, production-ready
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
const adapter = apiAdapter<ConsentSettings>({
  url: '/api/consent',
  credentials: 'include',
  headers: () => ({ 'x-csrf-token': getCsrfToken() }),
  unwrap: (body) => body.data,
  retry: { maxAttempts: 3, backoffMs: 250 },
  onError: (err, ctx) => telemetry.warn('consent_sync_failed', { ctx, err }),
});`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          For bundle-size-sensitive landing pages that only need one preset, switch to the
          narrower subpath:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Before
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

// After — ships only NDPRConsent (~4 KB vs ~8 KB)
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent';`}</code></pre>
        </div>
      </section>

      <section id="v3-6-1" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.6.1 — create-ndpr fixes</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Companion-CLI release. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/create-ndpr@0.2.0</code> stops emitting
          broken Prisma imports when you pick <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ORM=None</code>, and a new unscoped{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">create-ndpr</code> alias lets{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">npm create ndpr@latest</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">bun create ndpr</code> work alongside the scoped form. README now ships
          StackBlitz + CodeSandbox badges.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required</h3>
        <p className="mb-4 text-foreground">
          <strong>None for library consumers.</strong> Main package is unchanged.
        </p>
      </section>

      <section id="v3-6-2" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.6.2 — Templates + StackBlitz</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Phase D+E+F patch. The 9 remaining <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">create-ndpr</code> route templates now
          support all three ORM choices (Prisma, Drizzle, none) via conditional blocks — picking{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ORM=none</code> now scaffolds a fully working in-memory app for every
          endpoint, not just consent. Eight per-module StackBlitz scaffolds shipped under{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">examples/stackblitz/{`{consent,dsr,dpia,breach,policy,lawful-basis,cross-border,ropa}`}</code>.
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/score</code> lead-magnet email capture now uses a real Web3Forms
          backend with a mailto fallback.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required</h3>
        <p className="mb-4 text-foreground">
          <strong>None.</strong> Main library has no code changes.
        </p>
      </section>

      <section id="v3-7-0" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.7.0 — Org templates + recipes</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Phase B — the template + recipe library. Five organisation-specific privacy-policy
          templates (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">saas</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ecommerce</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">school</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">healthcare</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">procurement</code>) are exposed via a new{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">templateContextFor(id, overrides?)</code> factory and a matching{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">template</code> prop on{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRPrivacyPolicy />`}</code>. Each template pre-fills sector-appropriate data
          categories, lawful-basis defaults, and the right flags for children / sensitive /
          financial / cross-border / automated-decisions processing.
        </p>
        <p className="mb-4 text-foreground">
          Five production-tested recipe pages also landed at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/docs/recipes/*</code>:{' '}
          <Link href="/docs/recipes/ecommerce-consent" className="text-primary hover:underline">ecommerce-consent</Link>,{' '}
          <Link href="/docs/recipes/newsletter-consent" className="text-primary hover:underline">newsletter-consent</Link>,{' '}
          <Link href="/docs/recipes/contact-form-disclosure" className="text-primary hover:underline">contact-form-disclosure</Link>,{' '}
          <Link href="/docs/recipes/careers-rights" className="text-primary hover:underline">careers-rights</Link>, and{' '}
          <Link href="/docs/recipes/admin-dsr-management" className="text-primary hover:underline">admin-dsr-management</Link>.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required (optional)</h3>
        <p className="mb-4 text-foreground">
          The simplest way to use an org template — drop the id and the wizard opens already
          populated:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Before — every consumer answered the same 4-step wizard from scratch
<NDPRPrivacyPolicy adapter={policyAdapter} onComplete={save} />

// After — pre-fill the wizard for your sector
<NDPRPrivacyPolicy
  template="ecommerce"
  templateOverrides={{ orgName: 'Acme Stores', dpoEmail: 'dpo@acme.ng' }}
  adapter={policyAdapter}
  onComplete={save}
/>`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          For a template-picker UI, the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ORG_POLICY_TEMPLATE_REGISTRY</code> constant
          exposes id, label, description, and example org types for each of the five
          templates.
        </p>
      </section>

      <section id="v3-8-0" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.8.0 — Lite manager variants</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Phase G — three read-only Lite variants of the heavy Manager components:{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LawfulBasisTrackerLite</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLite</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManagerLite</code>. Each renders the same
          list-and-summary view as its Full counterpart, minus every write affordance (Add,
          Edit, Archive, Delete, CSV export). They&apos;re purpose-built for dashboards, audit
          pages, embedded compliance widgets, and customer-facing transparency surfaces.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Full bundle</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Lite bundle</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Saved</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/lawful-basis</code> → <code className="bg-muted px-1 py-0.5 rounded">/lawful-basis/lite</code></td>
                <td className="border border-border px-4 py-2 text-foreground">36.7 KB</td>
                <td className="border border-border px-4 py-2 text-foreground">12.7 KB</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>65%</strong></td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/cross-border</code> → <code className="bg-muted px-1 py-0.5 rounded">/cross-border/lite</code></td>
                <td className="border border-border px-4 py-2 text-foreground">53.3 KB</td>
                <td className="border border-border px-4 py-2 text-foreground">5.6 KB</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>89%</strong></td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/ropa</code> → <code className="bg-muted px-1 py-0.5 rounded">/ropa/lite</code></td>
                <td className="border border-border px-4 py-2 text-foreground">36.9 KB</td>
                <td className="border border-border px-4 py-2 text-foreground">13.2 KB</td>
                <td className="border border-border px-4 py-2 text-foreground"><strong>64%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          The cross-border Lite saves the most because it skips the 124 KB country-adequacy
          dataset — Lite displays <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adequacyStatus</code> directly from each
          transfer record instead of recomputing it.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required (optional)</h3>
        <p className="mb-4 text-foreground">
          If a surface only needs to display records (not edit them), switch the import:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Before — heavy manager with all write affordances on a read-only dashboard
import { CrossBorderTransferManager } from '@tantainnovative/ndpr-toolkit/cross-border';

// After — same data, no edit/add/delete, saves 47.7 KB of JS
import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';

<CrossBorderTransferManagerLite
  transfers={transfers}
  onTransferClick={(t) => router.push(\`/admin/transfers/\${t.id}\`)}
/>`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The full per-prop comparison and the &ldquo;when to use which&rdquo; decision tree are in the{' '}
          <Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">
            Lite vs Full managers
          </Link>{' '}
          guide.
        </p>
      </section>

      <section id="v3-8-1" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3.8.1 — DSR submission polish</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">What changed</h3>
        <p className="mb-4 text-foreground">
          Phase H polish on the 3.6.0 <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code> mode. Three additions:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRSubjectRights onSubmitSuccess={...} />`}</code></strong>{' '}
            — typed counterpart to the existing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitError</code>. Called with the
            parsed JSON body returned by your <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code> endpoint.
          </li>
          <li>
            <strong>DSR submission payload contract</strong> is now documented on the{' '}
            <Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">
              Data Subject Rights component page
            </Link>{' '}
            — exact field names, optional vs required, and the matching{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRFormSubmission</code> type.
          </li>
          <li>
            <strong>Accessibility notes</strong> on each component doc page document the WCAG
            criteria already met by 3.5.4 and what consumers are responsible for (form labels,
            error announcements, focus management).
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Action required (optional)</h3>
        <p className="mb-4 text-foreground">
          If you&apos;re already using <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code>, wire the success
          callback to show a confirmation or update local state without re-fetching:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`<NDPRSubjectRights
  submitTo="/api/dsr"
  onSubmitError={(err) => toast.error(err.message)}
  onSubmitSuccess={(body) => {
    toast.success(\`Request \${body.requestId} received\`);
    router.push(\`/dsr/status/\${body.requestId}\`);
  }}
/>`}</code></pre>
        </div>
      </section>

      <section id="net-diff" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Net migration diff — the common path</h2>
        <p className="mb-4 text-foreground">
          Most 3.5.x consumers running a public DSR form fall into this shape: an adapter-backed{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<NDPRSubjectRights>`}</code> that writes to a homegrown API client. In 3.8.x,
          the recommended path is the built-in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code> mode paired with{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateDsrSubmission</code> on the server. Here is the entire
          before/after, including the route handler:
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Before (3.5.x)</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/dsr/page.tsx
'use client';

import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

const adapter = apiAdapter({ url: '/api/dsr' });

export default function DSRPage() {
  return <NDPRSubjectRights adapter={adapter} />;
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">After (3.8.x)</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/dsr/page.tsx
'use client';

import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets/dsr';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DSRPage() {
  const router = useRouter();
  return (
    <NDPRSubjectRights
      submitTo="/api/dsr"
      submitOptions={{
        credentials: 'same-origin',
        headers: () => ({ 'x-csrf-token': getCsrfToken() }),
      }}
      onSubmitSuccess={(body) => {
        toast.success(\`Request \${body.requestId} received — we'll respond within 30 days.\`);
        router.push(\`/dsr/status/\${body.requestId}\`);
      }}
      onSubmitError={(err) => toast.error(err.message)}
    />
  );
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">New backend handler</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/dsr/route.ts
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';
import { dsrStore } from '@/lib/dsr-store';

export async function POST(req: Request) {
  const result = validateDsrSubmission(await req.json());
  if (!result.valid) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  const record = await dsrStore.create(result.data);
  return Response.json(
    { requestId: record.id, status: record.status, dueDate: record.dueDate },
    { status: 201 },
  );
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          What you traded: an ad-hoc <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> with no telemetry, no
          retry, no validation, and no typed success hook. What you got: a typed contract on
          both ends, CSRF + retry in the SDK, server-side schema validation, and a smaller
          bundle on the page (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets/dsr</code> ships only{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code>).
        </p>
      </section>

      <section id="bundle-opportunity" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Bundle-size opportunity</h2>
        <p className="mb-4 text-foreground">
          If your app embeds <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManager</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManager</code>, or{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LawfulBasisTracker</code> anywhere it doesn&apos;t need to <em>write</em>, the
          3.8 Lite variants are pure upside — same data, same look, 64–89% less JavaScript. The{' '}
          <Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">
            Lite vs Full managers
          </Link>{' '}
          guide has the decision tree, per-prop comparison, and bundle measurements.
        </p>
      </section>

      <section id="verify" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Verify your upgrade</h2>
        <p className="mb-4 text-foreground">
          A short checklist after bumping. Each one catches a different regression class:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong>Typecheck.</strong> Run <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tsc --noEmit</code> on your app — the 3.5.5
            type-contract corrections should compile cleanly, but if you were relying on the
            broken <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submittedAt</code>/<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">estimatedCompletionDate</code> Omit on
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR.submitRequest</code>, you&apos;ll see a clear type error here.
          </li>
          <li>
            <strong>Run your tests.</strong> Component snapshots should be unchanged. Hook
            tests that depended on the old DPIA <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Record&lt;string, any&gt;</code> may need to be
            tightened to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIAAnswerMap</code>.
          </li>
          <li>
            <strong>Smoke-test the consent banner.</strong> Open and close it with a
            keyboard — focus should return to whatever opened it (the 3.5.4 fix), and macOS
            users with &ldquo;Reduce Motion&rdquo; on should see no slide-in animation.
          </li>
          <li>
            <strong>Smoke-test a DSR submission.</strong> If you&apos;ve adopted{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">submitTo</code>, verify the server returns 201 + JSON and that{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitSuccess</code> fires with the parsed body.
          </li>
          <li>
            <strong>Re-run your bundle analyzer.</strong> Switching to{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets/dsr</code> or any Lite variant should produce a visibly smaller
            chunk for the affected route.
          </li>
        </ol>
        <p className="mb-4 text-foreground">
          That&apos;s the entire upgrade. No required code changes, optional adoption of better
          defaults, and a clear path to a smaller bundle if you want it.
        </p>
      </section>

      <section id="next-steps" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next steps</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">
              Lite vs Full managers
            </Link>{' '}
            — when to switch and what you save.
          </li>
          <li>
            <Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">
              Data Subject Rights component reference
            </Link>{' '}
            — the documented <code className="bg-muted px-1 py-0.5 rounded">submitTo</code> payload contract and accessibility notes.
          </li>
          <li>
            <Link href="/docs/guides/server-rendering" className="text-primary hover:underline">
              Server Rendering &amp; RSC
            </Link>{' '}
            — using <code className="bg-muted px-1 py-0.5 rounded">validateDsrSubmission</code> and the rest of{' '}
            <code className="bg-muted px-1 py-0.5 rounded">/server</code>.
          </li>
          <li>
            <Link href="/docs/recipes/admin-dsr-management" className="text-primary hover:underline">
              Admin DSR Management
            </Link>{' '}
            — the DPO-side workflow that pairs with the new public form.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
