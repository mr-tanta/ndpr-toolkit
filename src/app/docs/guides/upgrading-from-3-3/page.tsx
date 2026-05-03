'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function UpgradingFrom33Guide() {
  return (
    <DocLayout
      title="Upgrading from 3.3.x"
      description="What changed in v3.4 and v3.5, what's deprecated, and what you need to do (mostly: add one import line)."
    >
      <section id="tldr" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">TL;DR</h2>
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-foreground mb-3">
            The toolkit is <strong>backward-compatible at the component API level</strong> from 3.3.x to 3.5.x — every
            prop, ARIA attribute, and behaviour from 3.3.1 still works. The only required change for most consumers is{' '}
            <strong>one import line</strong> for the stylesheet:
          </p>
          <div className="bg-muted border border-border rounded-lg p-3 overflow-x-auto">
            <pre className="text-foreground"><code>{`// app/layout.tsx (Next.js) or src/main.tsx (Vite/CRA)
import "@tantainnovative/ndpr-toolkit/styles";`}</code></pre>
          </div>
        </div>
        <p className="mb-4 text-foreground">
          If you previously had Tailwind configured to scan{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">node_modules/@tantainnovative/*</code>, you can remove that{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">content</code> entry — it&apos;s
          no longer doing anything.
        </p>
      </section>

      <section id="version-map" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What landed in each version</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Version</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Headline change</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Required action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">3.4.0</td>
                <td className="border border-border px-4 py-2 text-foreground">Tailwind utilities replaced with BEM stylesheet; <code className="bg-muted px-1 py-0.5 rounded">/server</code> + <code className="bg-muted px-1 py-0.5 rounded">/unstyled</code> entries; <code className="bg-muted px-1 py-0.5 rounded">{`<PolicyPage />`}</code> Shadow DOM</td>
                <td className="border border-border px-4 py-2 text-foreground">Add <code className="bg-muted px-1 py-0.5 rounded">import &quot;.../styles&quot;</code></td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">3.4.1</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">{`{{var}}`}</code> substitution fix; <code className="bg-muted px-1 py-0.5 rounded">theme</code> opt-in dark mode; <code className="bg-muted px-1 py-0.5 rounded">&quot;use client&quot;</code> actually emitted</td>
                <td className="border border-border px-4 py-2 text-foreground">None</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">3.5.0</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">validateDsrSubmission</code>; <code className="bg-muted px-1 py-0.5 rounded">persist</code> alias; rolled-up <code className="bg-muted px-1 py-0.5 rounded">.d.ts</code> files</td>
                <td className="border border-border px-4 py-2 text-foreground">None</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">3.5.1</td>
                <td className="border border-border px-4 py-2 text-foreground">PolicyPage TOC anchors work in Shadow DOM</td>
                <td className="border border-border px-4 py-2 text-foreground">None — automatic</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="step-1" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Step 1: Bump the version</h2>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`pnpm add @tantainnovative/ndpr-toolkit@latest
# or
npm install @tantainnovative/ndpr-toolkit@latest
# or
bun add @tantainnovative/ndpr-toolkit@latest`}</code></pre>
        </div>
      </section>

      <section id="step-2" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Step 2: Import the stylesheet</h2>
        <p className="mb-4 text-foreground">
          Add one line to your app entry. <strong>Required</strong> for default styles to render — without it
          the components emit semantic class names but nothing styles them.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/layout.tsx (Next.js App Router)
import "@tantainnovative/ndpr-toolkit/styles";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          From a CSS file (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">globals.css</code>, Tailwind v4 entrypoint, etc.) you can also use{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@import</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`@import "@tantainnovative/ndpr-toolkit/styles";`}</code></pre>
        </div>
      </section>

      <section id="step-3" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Step 3: Audit your style overrides</h2>
        <p className="mb-4 text-foreground">
          Components no longer emit Tailwind utility classes. If your CSS targeted those (e.g.{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.bg-white</code> on the consent
          banner), update to the new BEM selectors:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Old (3.3.x)</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">New (3.4.0+)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">[role=&quot;dialog&quot;].bg-white</code></td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">.ndpr-consent-banner</code></td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">.text-2xl.font-bold</code> (banner title)</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">.ndpr-consent-banner__title</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Button utility classes</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">.ndpr-consent-banner__button--primary</code> / <code className="bg-muted px-1 py-0.5 rounded">--secondary</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          Better still: target the stable <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-component</code> attributes — see the{' '}
          <Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">
            styling architecture guide
          </Link>
          .
        </p>
      </section>

      <section id="optional-changes" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Optional API improvements you may want to adopt</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">persist</code> over <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLocalStorage</code></h3>
        <p className="mb-4 text-foreground">
          The clearer name <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">persist</code> is now canonical on{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">usePrivacyPolicy</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDefaultPrivacyPolicy</code>. The old{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLocalStorage</code> still works as a deprecated alias and will be removed in 4.0.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Before
useDefaultPrivacyPolicy({ orgInfo, useLocalStorage: false });

// After
useDefaultPrivacyPolicy({ orgInfo, persist: false });`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<ConsentBanner variant>`}</code></h3>
        <p className="mb-4 text-foreground">
          Three visual variants: <code className="bg-muted px-1 py-0.5 rounded">bar</code> (default, full-width strip),{' '}
          <code className="bg-muted px-1 py-0.5 rounded">card</code> (bounded floating card with margin from edges),{' '}
          <code className="bg-muted px-1 py-0.5 rounded">modal</code> (centered with backdrop overlay).
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`<ConsentBanner
  options={options}
  onSave={handleSave}
  variant="card"
  position="bottom"
/>`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<PolicyPage>`}</code> mode + theme</h3>
        <p className="mb-4 text-foreground">
          The new component renders a complete privacy policy with full styling. Defaults to Shadow DOM (no
          host CSS leak) in light mode (no surprise dark theme on macOS users):
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Drop-in widget
<PolicyPage policy={policy} />

// Inline mode for SEO/SSR — pair with @tailwindcss/typography
<article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
  <PolicyPage policy={policy} mode="inline" />
</article>

// Follow OS dark-mode preference (opt-in)
<PolicyPage policy={policy} options={{ theme: 'auto' }} />`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Server-side validation with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateDsrSubmission</code></h3>
        <p className="mb-4 text-foreground">
          Replace ad-hoc zod or class-validator schemas in your DSR route handler with the toolkit-shipped
          validator. Mirrors the client-side rules in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<DSRRequestForm />`}</code> exactly.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/dsr/route.ts
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';

export async function POST(req: Request) {
  const result = validateDsrSubmission(await req.json());
  if (!result.valid) return Response.json({ errors: result.errors }, { status: 422 });
  // result.data is the typed DsrSubmissionPayload
  await dsrStore.create(result.data);
  return Response.json({ ok: true }, { status: 201 });
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          See the{' '}
          <Link href="/docs/guides/server-rendering" className="text-primary hover:underline">
            server-rendering guide
          </Link>{' '}
          for NestJS and Express examples.
        </p>
      </section>

      <section id="deprecations" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Deprecations slated for 4.0</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLocalStorage</code> option on{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">usePrivacyPolicy</code> and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDefaultPrivacyPolicy</code> — use{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">persist</code> instead.
          </li>
        </ul>
        <p className="mb-4 text-foreground mt-4">
          That&apos;s the entire deprecation list — the API surface has been remarkably stable.
        </p>
      </section>

      <section id="troubleshooting" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Troubleshooting</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Components look unstyled after upgrade</h3>
        <p className="mb-4 text-foreground">
          You forgot the stylesheet import. Add{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">import &quot;@tantainnovative/ndpr-toolkit/styles&quot;</code> in your app entry. CSS class names are present in the markup but no rules
          are loaded.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">PolicyPage renders dark on macOS dark mode users</h3>
        <p className="mb-4 text-foreground">
          You&apos;re likely on 3.4.0 — upgrade to 3.4.1 or later. v3.4.1 made dark mode opt-in via{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`options={{ theme: 'auto' }}`}</code>.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Privacy policy shows literal {`{{orgName}}`}</h3>
        <p className="mb-4 text-foreground">
          You&apos;re on 3.4.0 — upgrade to 3.4.1 or later. The substitution path was broken in 3.4.0 and fixed in 3.4.1.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">TOC anchor links don&apos;t scroll inside PolicyPage</h3>
        <p className="mb-4 text-foreground">
          Upgrade to 3.5.1 — the click delegate that scrolls to the matching shadow-root section was added there.
        </p>
      </section>

      <section id="next-steps" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next steps</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">
              Styling Architecture
            </Link>{' '}
            — how the new BEM stylesheet works and how to theme it.
          </li>
          <li>
            <Link href="/docs/guides/server-rendering" className="text-primary hover:underline">
              Server Rendering
            </Link>{' '}
            — using <code className="bg-muted px-1 py-0.5 rounded">/server</code> from your backend.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
