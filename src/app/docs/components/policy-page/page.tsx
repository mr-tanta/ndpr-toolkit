'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function PolicyPageDocs() {
  return (
    <DocLayout
      title="PolicyPage"
      description="Renders a typed PrivacyPolicy object as a full document — either inside a Shadow DOM root (default, opinionated styling) or inline in the host document (SSR-safe, your own typography)."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PolicyPage</code> is the renderer for the typed <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PrivacyPolicy</code>
          objects produced by <Link href="/docs/components/adaptive-policy-wizard" className="text-primary hover:underline">AdaptivePolicyWizard</Link>,
          <Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline"> PolicyGenerator</Link>, or your own code. It
          delegates HTML generation to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportHTML(policy, options)</code> under the hood, so the
          exported document and the rendered page are byte-for-byte identical.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Two render modes are available, each tuned for a different surface:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>Shadow mode (default)</strong> — mounts the policy inside a Shadow DOM root, fully isolating the embedded <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;style&gt;</code> block. Use this for in-app embeds where you want the rich, opinionated default styling without polluting global CSS. Client-only.</li>
          <li><strong>Inline mode</strong> — injects the policy markup directly into the host document. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">includeStyles: false</code> so bare element selectors don&apos;t leak. Pair with your own CSS / design tokens. SSR-safe.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          Exported from the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/policy</code> subpath:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { PolicyPage } from '@tantainnovative/ndpr-toolkit/policy';`}</code>
        </pre>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { PolicyPage } from '@tantainnovative/ndpr-toolkit/policy';
import type { PrivacyPolicy } from '@tantainnovative/ndpr-toolkit';

export default function PrivacyRoute({ policy }: { policy: PrivacyPolicy }) {
  // Inline mode — crawlable markup, you supply the typography
  return (
    <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
      <PolicyPage policy={policy} mode="inline" />
    </article>
  );
}`}</code>
        </pre>
      </section>

      <section id="modes" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Choosing a mode</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Mode</th>
                <th className="text-left py-2 pr-4 font-semibold">Renders</th>
                <th className="text-left py-2 pr-4 font-semibold">SEO</th>
                <th className="text-left py-2 pr-4 font-semibold">Host-CSS isolation</th>
                <th className="text-left py-2 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;shadow&apos;</code> (default)</td>
                <td className="py-2 pr-4">Inside a Shadow DOM root, opinionated styles included</td>
                <td className="py-2 pr-4">Markup is invisible to crawlers</td>
                <td className="py-2 pr-4">Structurally impossible to leak</td>
                <td className="py-2">In-app embeds where you want a polished drop-in widget</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;inline&apos;</code></td>
                <td className="py-2 pr-4">Directly in the host document body</td>
                <td className="py-2 pr-4">Crawlable markup</td>
                <td className="py-2 pr-4">Consumer styles the markup themselves</td>
                <td className="py-2">SSR&apos;d <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/privacy</code> pages, public legal pages</td>
              </tr>
            </tbody>
          </table>
        </div>
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
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">policy</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PrivacyPolicy</code></td>
                <td className="py-2"><strong>Required.</strong> The typed policy object — usually obtained from the wizard&apos;s <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete</code> or your own builder.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mode</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;shadow&apos; | &apos;inline&apos;</code></td>
                <td className="py-2">Render mode. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;shadow&apos;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Class applied to the wrapping <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;div&gt;</code> (the shadow host in shadow mode, the inline container otherwise).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">HTMLExportOptions</code></td>
                <td className="py-2">Pass-through to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportHTML</code>. Toggle <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">includeStyles</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">includePrintCSS</code>, inject <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">customCSS</code>, or pick a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">theme</code> (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;light&apos;</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;dark&apos;</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;auto&apos;</code>). Defaults differ by mode: shadow includes styles; inline omits them.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="inline-typography" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Inline-mode typography</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The rendered markup is plain semantic HTML — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;article&gt;</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;section&gt;</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;h2&gt;</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;p&gt;</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;ul&gt;</code>. Pair it with your own typography:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Tailwind + @tailwindcss/typography
<article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
  <PolicyPage policy={policy} mode="inline" />
</article>

// shadcn/ui card
<Card>
  <CardContent className="prose dark:prose-invert">
    <PolicyPage policy={policy} mode="inline" />
  </CardContent>
</Card>

// Raw CSS
// .ndpr-policy-page article { font-family: Georgia, serif; line-height: 1.7; }
// .ndpr-policy-page h2 { font-size: 1.5rem; margin-top: 2rem; }`}</code>
        </pre>
      </section>

      <section id="shadow-theming" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Branding shadow mode</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Stay in shadow mode and brand the policy by passing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">theme</code> and
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> customCSS</code> through <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options</code>:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<PolicyPage
  policy={policy}
  options={{
    theme: 'auto', // 'light' (default) | 'dark' | 'auto'
    customCSS: ':root { --color-accent: #1d4ed8; --max-width: 64rem; }',
  }}
/>`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportHTML</code> — the underlying HTML generator, re-exported from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/policy</code>. Use it directly if you need the HTML string outside React.</li>
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportPDF</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportDOCX</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportMarkdown</code> — sibling exporters for other formats.</li>
          <li><Link href="/docs/components/adaptive-policy-wizard" className="text-primary hover:underline">AdaptivePolicyWizard</Link> — produces the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PrivacyPolicy</code> object this component renders.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
