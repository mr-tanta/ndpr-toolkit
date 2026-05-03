'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function StylingArchitectureGuide() {
  return (
    <DocLayout
      title="Styling Architecture"
      description="How NDPA Toolkit components are styled in v3.4+: BEM class names, --ndpr-* tokens, and the /unstyled escape hatch."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          As of <strong>v3.4.0</strong>, every NDPA Toolkit component ships with semantic{' '}
          <strong>BEM-style class names</strong> backed by a real stylesheet. There is{' '}
          <strong>no Tailwind dependency</strong> — the toolkit works in any host (Next.js, Vite, CRA,
          Remix, raw HTML) provided you import the stylesheet once. Components remain themable
          through CSS custom properties and replaceable via the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code>{' '}
          slot map or the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> entry.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2 font-semibold">If you&apos;re upgrading from 3.3.x</p>
          <p className="text-sm text-foreground">
            The previous releases shipped components with Tailwind utility classes baked into JSX strings, which
            silently produced unstyled markup unless your Tailwind <code className="bg-muted px-1 py-0.5 rounded">content</code> config scanned <code className="bg-muted px-1 py-0.5 rounded">node_modules</code>.
            That coupling is gone — see the{' '}
            <Link href="/docs/guides/upgrading-from-3-3" className="text-primary hover:underline">
              upgrade guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="install" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Import the stylesheet</h2>
        <p className="mb-4 text-foreground">
          Add this <strong>one line</strong> in your app entry. Components render with full default styling
          immediately afterwards.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Next.js App Router — app/layout.tsx
// Vite / CRA — src/main.tsx
import "@tantainnovative/ndpr-toolkit/styles";`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          PostCSS, Tailwind v4, Sass, and Bun all resolve this through the package&apos;s{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">style</code> /{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">sass</code> /{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">import</code> /{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">require</code> conditional exports. From a CSS file you can also do <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@import</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`/* globals.css */
@import "@tantainnovative/ndpr-toolkit/styles";`}</code></pre>
        </div>
      </section>

      <section id="naming-convention" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">2. Class naming convention</h2>
        <p className="mb-4 text-foreground">All toolkit class names follow a consistent BEM-style pattern:</p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`.ndpr-{component}                  /* component root */
.ndpr-{component}__{element}       /* child part */
.ndpr-{component}--{modifier}      /* variant or state */`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">For example, the consent banner exposes:</p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`.ndpr-consent-banner               /* root */
.ndpr-consent-banner--card         /* variant: bounded floating card */
.ndpr-consent-banner--bottom       /* placement modifier */
.ndpr-consent-banner__container    /* inner content wrapper */
.ndpr-consent-banner__title        /* heading */
.ndpr-consent-banner__buttons      /* action button row */
.ndpr-consent-banner__button       /* shared button base */
.ndpr-consent-banner__button--primary
.ndpr-consent-banner__button--secondary`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          You can target these directly from your own CSS without any toolkit utilities. Hash-suffixed internal
          chunk class names (the v3.3-era <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">_styles_h7c2k</code> pattern) are gone.
        </p>
      </section>

      <section id="data-attributes" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3. Data attributes for stable hooks</h2>
        <p className="mb-4 text-foreground">
          Every component root carries a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-component</code> attribute. Stateful variants (mode,
          variant, position) get their own data attributes too. Use these when you want a stable
          consumer-side selector that doesn&apos;t depend on the internal class names.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`/* Stable across releases — internal class names may evolve */
[data-ndpr-component="consent-banner"][data-ndpr-variant="card"] {
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

[data-ndpr-component="policy-page"] {
  font-family: var(--my-prose-font);
}`}</code></pre>
        </div>
      </section>

      <section id="theming" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">4. Theming via CSS custom properties</h2>
        <p className="mb-4 text-foreground">
          The stylesheet is opinionated but token-driven. Override any{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> property
          at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">:root</code>, on a
          per-section parent, or scoped to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">[data-theme=&quot;dark&quot;]</code>.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`:root {
  /* Brand */
  --ndpr-primary: 22 163 74;            /* RGB triplet — green-600 */
  --ndpr-primary-hover: 21 128 61;      /* green-700 */
  --ndpr-primary-foreground: 255 255 255;

  /* Neutrals */
  --ndpr-background: 255 255 255;
  --ndpr-surface: 249 250 251;
  --ndpr-foreground: 17 24 39;
  --ndpr-muted: 243 244 246;
  --ndpr-muted-foreground: 107 114 128;
  --ndpr-border: 229 231 235;

  /* Shape */
  --ndpr-radius: 1rem;
  --ndpr-font-sans: "Inter", system-ui, sans-serif;
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Token values use <strong>RGB triplets without commas</strong> — the toolkit applies them via{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary))</code> internally so you can opacify them as needed
          (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary) / 0.1)</code>).
        </p>
      </section>

      <section id="dark-mode" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">5. Dark mode</h2>
        <p className="mb-4 text-foreground">
          The toolkit supports <strong>three dark-mode strategies</strong>, mix and match as your host site requires:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Strategy</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Trigger</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Use when</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">prefers-color-scheme</code></td>
                <td className="border border-border px-4 py-2 text-foreground">OS-level setting</td>
                <td className="border border-border px-4 py-2 text-foreground">Your host site already follows OS preference</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">data-theme=&quot;dark&quot;</code></td>
                <td className="border border-border px-4 py-2 text-foreground">Attribute on any ancestor</td>
                <td className="border border-border px-4 py-2 text-foreground">Explicit user toggle (recommended)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">.dark</code> class</td>
                <td className="border border-border px-4 py-2 text-foreground">Class on any ancestor</td>
                <td className="border border-border px-4 py-2 text-foreground">Tailwind&apos;s default class strategy</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          For <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'<PolicyPage />'}</code>{' '}
          specifically, dark mode is opt-in via the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">options.theme</code> prop because Shadow
          DOM does not isolate <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">prefers-color-scheme</code>. See{' '}
          <Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">
            Privacy Policy Generator
          </Link>{' '}
          for details.
        </p>
      </section>

      <section id="overrides" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">6. Per-instance class overrides</h2>
        <p className="mb-4 text-foreground">
          Every component accepts a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot map. Pass your own class string for any
          named slot — the default <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.ndpr-*</code> class is replaced (not appended) for that slot.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`<ConsentBanner
  options={options}
  onSave={handleSave}
  classNames={{
    root: "fixed bottom-0 inset-x-0 my-banner",
    title: "text-2xl font-display",
    acceptButton: "btn btn-primary",
    rejectButton: "btn btn-ghost",
  }}
/>`}</code></pre>
        </div>
      </section>

      <section id="unstyled" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">7. The /unstyled escape hatch</h2>
        <p className="mb-4 text-foreground">
          When you want to bring your own design system entirely (Tailwind, Mantine, Chakra, raw CSS — your
          choice), import from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> instead of the default entry. Every component
          has <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> defaulted to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>, stripping all <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.ndpr-*</code> classes.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { ConsentBanner, ConsentManager, DSRRequestForm }
  from '@tantainnovative/ndpr-toolkit/unstyled';

// No default classes — your CSS applies unfiltered. ARIA, focus
// management, and data-ndpr-* attributes are preserved (they're
// part of the contract, not styling).
<ConsentBanner
  options={options}
  onSave={handleSave}
  classNames={{ root: 'my-banner', acceptButton: 'btn-primary' }}
/>`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          You can also opt back into default styling per-instance by passing{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled={`{false}`}</code> — useful when migrating screen-by-screen.
        </p>
      </section>

      <section id="next-steps" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next steps</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/guides/styling-customization" className="text-primary hover:underline">
              Styling &amp; Customization
            </Link>{' '}
            — deeper dive on the <code className="bg-muted px-1 py-0.5 rounded">classNames</code> slot maps per component.
          </li>
          <li>
            <Link href="/docs/components/consent-management" className="text-primary hover:underline">
              ConsentBanner variants
            </Link>{' '}
            — the new <code className="bg-muted px-1 py-0.5 rounded">variant=&quot;bar&quot;|&quot;card&quot;|&quot;modal&quot;</code> prop.
          </li>
          <li>
            <Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">
              PolicyPage
            </Link>{' '}
            — Shadow DOM rendering and the <code className="bg-muted px-1 py-0.5 rounded">theme</code> option.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
