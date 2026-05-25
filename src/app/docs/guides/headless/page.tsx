'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function HeadlessGuide() {
  return (
    <DocLayout
      title="Headless / hooks-only API"
      description="Build a completely custom UI on top of the toolkit's compliance state machines. The /headless subpath ships every hook with zero UI surface, perfect for headless component libraries and bespoke design systems."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The toolkit ships React hooks for every compliance module — consent, DSR, DPIA, breach, lawful basis,
          cross-border, ROPA, and policy. New in 3.10.0, you can import them from
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> @tantainnovative/ndpr-toolkit/headless</code> — an alias of the existing
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> /hooks</code> subpath, named for discoverability.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          The two subpaths export <strong>exactly the same surface</strong> — they re-export the same
          identifiers from the same source. Pick whichever name fits your mental model:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/hooks</code> — if your codebase speaks &quot;React hooks&quot;.</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code> — if you&apos;re building a headless component library or pairing with Radix / Ariakit / Headless UI.</li>
        </ul>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { useConsent } from '@tantainnovative/ndpr-toolkit/headless';

function MyCustomConsentBanner() {
  const {
    settings,
    hasInteracted,
    shouldShowBanner,
    acceptAll,
    rejectAll,
    updateOption,
  } = useConsent({
    options: [
      { id: 'analytics', label: 'Analytics', description: '...', required: false, purpose: 'Product analytics' },
      { id: 'marketing', label: 'Marketing', description: '...', required: false, purpose: 'Outreach' },
    ],
  });

  if (!shouldShowBanner) return null;

  return (
    <aside role="dialog" aria-labelledby="consent-title">
      <h2 id="consent-title">Your privacy</h2>
      {/* …entirely your UI… */}
      <button onClick={acceptAll}>Accept all</button>
      <button onClick={rejectAll}>Reject all</button>
    </aside>
  );
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          You own every DOM node and every class name. The hook just owns state, persistence (via the
          configured adapter), and the consent lifecycle invariants.
        </p>
      </section>

      <section id="available-hooks" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Available hooks</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every compliance module has a hook. They&apos;re identical to the hooks the bundled UI components
          consume internally:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import {
  useConsent,
  useDSR,
  useDPIA,
  useBreach,
  useLawfulBasis,
  useCrossBorderTransfer,
  useROPA,
  useComplianceScore,
  useAdaptivePolicyWizard,
  useFocusTrap,             // shared a11y primitive
} from '@tantainnovative/ndpr-toolkit/headless';`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Each hook&apos;s argument and return types are exported alongside it — TypeScript autocomplete tells you
          exactly what each hook offers.
        </p>
      </section>

      <section id="bundle-size" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Bundle size</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code> entry has <strong>no UI components or styling imports</strong> in
          its dependency graph. A bundler that supports tree-shaking will drop everything you don&apos;t use,
          so you pay only for the hooks you actually import — typically a few KB minified for a single module.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          If you also <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">import &apos;@tantainnovative/ndpr-toolkit/styles&apos;</code> for some pages and use
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> /headless</code> on others, the stylesheet ships only on the pages that import it. Headless pages stay style-free.
        </p>
      </section>

      <section id="adapters" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Wiring storage adapters</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Hooks accept the same <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code> prop the preset components do.
          Mix-and-match adapters per hook — for example, persist consent to a cookie (server-readable) and
          DSR drafts to localStorage:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { useConsent, useDSR } from '@tantainnovative/ndpr-toolkit/headless';
import { cookieAdapter, localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

const consent = useConsent({
  options,
  adapter: cookieAdapter('ndpr_consent', { expires: 365 }),
});

const dsr = useDSR({
  adapter: localStorageAdapter('ndpr_dsr_draft'),
});`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/compound-components" className="text-primary hover:underline">Compound Components</Link> — middle ground: keep the layout slots, swap the visuals.</li>
          <li><Link href="/docs/guides/adapters" className="text-primary hover:underline">Storage Adapters</Link> — every place hooks can persist state.</li>
          <li><Link href="/docs/guides/server-side-storage" className="text-primary hover:underline">Server-Side Storage (SSR)</Link> — pairing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> with framework cookie APIs.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
