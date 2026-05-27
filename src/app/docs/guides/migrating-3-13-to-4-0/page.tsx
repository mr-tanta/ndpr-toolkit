'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function MigratingFrom313To40Guide() {
  return (
    <DocLayout
      title="Migrating from 3.13.x to 4.0.0"
      description="Five small breaking changes — all aliased and dev-warned in 3.13.x. If your 3.13.x build runs without warnings in the dev console, your 4.0 upgrade is a one-line bump."
    >
      <section id="tldr" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">TL;DR</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          4.0 is the consolidated breaking-change window. Every removed alias or behavioural change was deprecated and dev-warned in 3.13.x, so the upgrade path is:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>On 3.13.x, run your dev server. Any deprecated prop or behaviour fires a one-shot <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">[ndpr-toolkit/&lt;module&gt;]</code> warning in the console.</li>
          <li>Fix each warning at its callsite.</li>
          <li>Bump to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^4.0.0</code>.</li>
        </ol>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`pnpm up @tantainnovative/ndpr-toolkit@^4.0.0
# or
bun add @tantainnovative/ndpr-toolkit@^4.0.0
# or
npm install @tantainnovative/ndpr-toolkit@^4.0.0`}</code>
        </pre>
      </section>

      <section id="changes" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The breaking changes</h2>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">1. React 17 dropped from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">peerDependencies</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The peer range is now <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^18.0.0 || ^19.0.0</code>. The toolkit uses <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">React.useId</code> (18+) in several components, so the previous <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^16.8 || ^17 || ^18 || ^19</code> claim was already a lie — React 17 consumers installed fine then hit cryptic errors. This release just makes the peer range honest.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          <strong>Action:</strong> if you're on React 17 (or earlier), upgrade your app to React 18+ before bumping. If you're on React 18 or 19, no action required.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">2. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">formDescription</code> → <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">BreachReportForm</code> and the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRBreachReport</code> preset have a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code> prop matching every other component. The legacy <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">formDescription</code> alias is removed.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (3.x)
<BreachReportForm formDescription="Custom blurb" />
<NDPRBreachReport formDescription="Custom blurb" />

// After (4.0)
<BreachReportForm description="Custom blurb" />
<NDPRBreachReport description="Custom blurb" />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">3. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialActivities</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialTransfers</code> → <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialData</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRLawfulBasis</code> and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRCrossBorder</code> presets standardised on <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">initialData</code> (matches <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRROPA</code>). The module-specific aliases are removed.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (3.x)
<NDPRLawfulBasis initialActivities={activities} />
<NDPRCrossBorder initialTransfers={transfers} />

// After (4.0)
<NDPRLawfulBasis initialData={activities} />
<NDPRCrossBorder initialData={transfers} />`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">4. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">extraOptions</code> removed from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRConsent</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The one-off <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">extraOptions</code> pattern (which extended the toolkit's defaults) is gone. Pass the full options array via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options</code> instead.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (3.x)
<NDPRConsent extraOptions={[{ id: 'research', label: 'Research', ... }]} />

// After (4.0)
<NDPRConsent
  options={[
    { id: 'essential', label: 'Essential', description: 'Required', required: true, purpose: 'Site operation' },
    { id: 'analytics', label: 'Analytics', description: 'Usage measurement', required: false, purpose: 'Product analytics' },
    { id: 'research', label: 'Research', description: 'For research', required: false, purpose: 'Research' },
  ]}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">5. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR</code> default storage flipped to in-memory</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR</code> is the admin tracker hook — its state holds data subjects' PII. The previous default stored that PII in the admin's browser localStorage, which is rarely appropriate. 4.0 flips the default to in-memory; localStorage requires explicit opt-in.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (3.x): default useLocalStorage was true
const { requests } = useDSR({ requestTypes });
// → requests persisted to localStorage["ndpr_dsr_requests"]

// After (4.0): default useLocalStorage is false
const { requests } = useDSR({ requestTypes });
// → requests live in component state only; nothing persists

// To keep the old behaviour (rarely the right move):
const { requests } = useDSR({ requestTypes, useLocalStorage: true });

// Recommended: pass an explicit adapter for production
const { requests } = useDSR({
  requestTypes,
  adapter: apiAdapter('/api/dsr'),
});`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Example rename: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dsr-backend-prod</code> → <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dsr-backend-reference</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The example was renamed to be honest about its scope. The "prod" name oversold what it does — it covers DSR receipt and confirmation only, not the full fulfilment pipeline (identity verification, audit logging, status transitions, request-type-specific handling, deadline tracking, DPO routing). The example's README now ships an explicit "What you still need to build" checklist.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          <strong>Action:</strong> if you bookmarked or cloned <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">examples/dsr-backend-prod/</code>, update to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">examples/dsr-backend-reference/</code>.
        </p>
      </section>

      <section id="non-breaking-recap" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Everything else stays the same</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>All 19 component <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">*Props</code> interfaces stay exported from the root.</li>
          <li>Adapter contract (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">StorageAdapter&lt;T&gt;</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">memoryAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">composeAdapters</code>) — unchanged.</li>
          <li>The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/hooks</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/presets</code>, and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> subpaths — unchanged.</li>
          <li>Compliance score engine, NDPA validators, all 5 locale files, the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRThemeProvider</code> — unchanged.</li>
          <li>i18n wiring across all 20 components (shipped in 3.13.0) — stays in place.</li>
        </ul>
      </section>

      <section id="verify" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">After the bump — verify checklist</h2>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tsc --noEmit</code> — no new type errors. If you hit any, they're almost certainly one of the 5 renames above.</li>
          <li>Run the app in dev. No more <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">[ndpr-toolkit/...]</code> deprecation warnings.</li>
          <li>If you use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR()</code> without an explicit adapter, the tracker now starts empty on every reload — that's intentional. Pass <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> or <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLocalStorage: true</code> if you need persistence.</li>
        </ol>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/upgrading-3-7-to-3-10" className="text-primary hover:underline">Upgrading 3.7 → 3.10</Link> — for consumers stuck further back.</li>
          <li><Link href="/docs/guides/migrating-3-5-to-3-8" className="text-primary hover:underline">Migrating 3.5 → 3.8</Link> — older.</li>
          <li><Link href="https://github.com/mr-tanta/ndpr-toolkit/blob/main/CHANGELOG.md" className="text-primary hover:underline">Full CHANGELOG</Link>.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
