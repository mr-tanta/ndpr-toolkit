'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function UpgradingFrom37To310Guide() {
  return (
    <DocLayout
      title="Upgrading from 3.7.x to 3.10.x"
      description="A concise upgrade guide for consumers on 3.7.0 jumping directly to 3.10.x. Every change between these versions is backward-compatible — no API breaks, no required code edits. This guide tells you what's new and what's worth adopting."
    >
      <section id="tldr" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">TL;DR</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The upgrade is a one-line dependency bump:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`pnpm up @tantainnovative/ndpr-toolkit@^3.10.3
# or
bun add @tantainnovative/ndpr-toolkit@^3.10.3
# or
npm install @tantainnovative/ndpr-toolkit@^3.10.3`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Every release between 3.7.0 and 3.10.3 is backward-compatible. Your existing imports, props, and adapters keep working — adopting the new APIs is optional.
        </p>
      </section>

      <section id="why-310-3" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Why 3.10.3 specifically?</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Releases <strong>3.8.0, 3.8.1, 3.9.0, and 3.10.0</strong> had a broken publish pipeline — their git tags and GitHub releases shipped, but the npm publish workflow failed at the entry-points check before the tarball reached the registry. As a result, npm stayed on 3.7.0 for several weeks while the GitHub side advanced.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          <strong>3.10.1</strong> fixed the build script. <strong>3.10.2</strong> fixed the npm-rendered README header. <strong>3.10.3</strong> fixes a related miss: four subpath exports (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/lawful-basis/lite</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/cross-border/lite</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/ropa/lite</code>) shipped in the dist tarball but were missing from the published <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exports</code> map, so consumers got resolution errors when importing them. 3.10.3 wires them up.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          From 3.7.0, jump straight to <strong>3.10.3</strong> — it carries every feature from the intermediate versions plus the publish-pipeline and exports fixes.
        </p>
      </section>

      <section id="new-since-37" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">New APIs available after upgrade</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every item below is opt-in. Don&apos;t feel obligated to adopt any of it — your 3.7.0 code keeps working.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.8.0 — Lite Manager variants</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Read-only versions of the three heaviest Manager components, useful for audit dashboards and compliance reports where the full editing UI is overkill. They skip form, validation, and write callbacks — and the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cross-border-lite</code> variant also skips the 124 KB country-adequacy dataset.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { LawfulBasisTrackerLite } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';
import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';
import { ROPAManagerLite } from '@tantainnovative/ndpr-toolkit/ropa/lite';`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          See <Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">Lite vs Full managers</Link> for bundle-size comparisons and the full feature matrix.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.8.1 — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitSuccess</code> on DSR preset</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Typed counterpart to the existing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onSubmitError</code>. Receives the parsed JSON body so you can route to a confirmation page with the server-issued reference.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<NDPRSubjectRights
  submitTo="/api/dsr"
  onSubmitSuccess={({ response, data, body }) => {
    const ref = (body as { referenceId?: string })?.referenceId;
    if (ref) router.push(\`/dsr-confirmation?ref=\${ref}\`);
  }}
  onSubmitError={({ error, response }) => {
    console.error('DSR submit failed', error, response?.status);
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.9.0 — Runnable example apps</h3>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/examples/ecommerce-starter" className="text-primary hover:underline">examples/ecommerce-starter</Link> — multi-page Next.js 15 Nigerian storefront wiring four toolkit subpaths together</li>
          <li><Link href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/examples/ssr" className="text-primary hover:underline">examples/ssr/{`{nextjs-app-router,remix,astro}`}</Link> — SSR-safe cookie-bridge starters that hydrate the banner already-resolved (no flash)</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          The full SSR pattern is documented at <Link href="/docs/guides/server-side-storage" className="text-primary hover:underline">Server-Side Storage (SSR)</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.10.0 — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRThemeProvider</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          A typed React Context that injects <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> CSS variables from a JavaScript theme object. Syntactic sugar over the existing CSS-variable theming — unset fields fall through to defaults.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRThemeProvider, type NDPRTheme } from '@tantainnovative/ndpr-toolkit';

<NDPRThemeProvider theme={{ colors: { primary: '22 163 74' }, radius: { base: '0.75rem' } }}>
  <App />
</NDPRThemeProvider>`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Full reference: <Link href="/docs/guides/theming" className="text-primary hover:underline">Theming with NDPRThemeProvider</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.10.0 — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code> subpath</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Alias of <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/hooks</code> under a more discoverable name for headless-UI consumers. Same exports — pick whichever name fits.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { useConsent, useDSR } from '@tantainnovative/ndpr-toolkit/headless';
// identical to: from '@tantainnovative/ndpr-toolkit/hooks'`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Note: this subpath was missing from the published <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exports</code> map until 3.10.3 — if you tried to use it on 3.10.0 / 3.10.1 / 3.10.2 you would have hit a resolution error. The dist files were always present; only the exports wiring was broken.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From 3.10.0 — Production DSR backend reference</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          <Link href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/examples/dsr-backend-reference" className="text-primary hover:underline">examples/dsr-backend-reference</Link> — a Next.js 15 / React 19 reference wiring <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code> to Prisma persistence and Resend email confirmation, both behind dual-mode shims so it runs without infrastructure. Full walkthrough: <Link href="/docs/guides/production-dsr-backend" className="text-primary hover:underline">Production DSR backend</Link>.
        </p>
      </section>

      <section id="not-breaking" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Things that did NOT change</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Sanity-check list of things you might worry about — none of these break between 3.7.0 and 3.10.3:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>Prop types on <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRConsent</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRSubjectRights</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRBreachReport</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRPrivacyPolicy</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDPIA</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRComplianceDashboard</code> — additive only.</li>
          <li>Hook signatures — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useConsent</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDSR</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDPIA</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useBreach</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLawfulBasis</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useCrossBorderTransfer</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useROPA</code> — unchanged.</li>
          <li>Storage adapters — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">sessionStorageAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">memoryAdapter</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">composeAdapters</code> — same interface.</li>
          <li>The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code> RSC-safe entry — still zero React, same validator and scoring exports.</li>
          <li>The stylesheet at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/styles</code> — all <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> CSS variables you may have overridden are preserved.</li>
          <li>The compliance score engine — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> takes the same input shape.</li>
        </ul>
      </section>

      <section id="verify" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">After the bump — verify checklist</h2>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>App still typechecks (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tsc --noEmit</code>) — no new prop or hook errors.</li>
          <li>Consent banner still renders, accept / reject / customize still work, storage still persists where it used to.</li>
          <li>If you submit DSR / Breach / DPIA forms to your own backend, the request body shape is unchanged.</li>
          <li>If you import from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/headless</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/lawful-basis/lite</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/cross-border/lite</code>, or <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/ropa/lite</code>, those resolutions now work (they would have failed on 3.10.2 and earlier).</li>
        </ol>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/migrating-3-5-to-3-8" className="text-primary hover:underline">Migrating from 3.5.x to 3.8.x</Link> — the prior guide; if you&apos;re even older than 3.7.0, start there.</li>
          <li><Link href="/docs/guides/upgrading-from-3-3" className="text-primary hover:underline">Upgrading from 3.3.x</Link> — for very old consumers.</li>
          <li><Link href="https://github.com/mr-tanta/ndpr-toolkit/blob/main/CHANGELOG.md" className="text-primary hover:underline">Full CHANGELOG</Link> — release-by-release diff if you want every detail.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
