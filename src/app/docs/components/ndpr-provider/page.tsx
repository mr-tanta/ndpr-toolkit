'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { ProductionReadinessBlock } from '@/components/docs/ProductionReadinessBlock';

export default function NDPRProviderDocs() {
  return (
    <DocLayout
      title="NDPRProvider"
      description="App-level configuration provider for the NDPA Toolkit. Supplies organisation details, locale strings, and an error boundary in one place — every nested toolkit component reads from it via the useNDPRConfig hook."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> is the top-level configuration provider for the toolkit. It does three things:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>Stores cross-cutting configuration (organisation name, DPO email, NDPC registration number, locale strings) in a React Context that every nested component can read.</li>
          <li>Optionally applies a small set of brand CSS variables (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-primary</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-primary-hover</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-primary-foreground</code>) when a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">theme</code> is supplied — for the full token surface, prefer <Link href="/docs/components/ndpr-theme-provider" className="text-primary hover:underline">NDPRThemeProvider</Link>.</li>
          <li>Wraps children in an <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRErrorBoundary</code> so a rendering crash in any toolkit component does not bring down the host app.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> is <strong>optional</strong> — every component works without one. Use it when you want to (a) avoid repeating
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> organizationName</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dpoEmail</code> across multiple forms, (b) ship a non-English UI, or (c) want a managed error boundary around the toolkit surface.
        </p>
      </section>

      <ProductionReadinessBlock
        moduleName="NDPRProvider"
        importRows={[
          {
            packagePath: '@tantainnovative/ndpr-toolkit',
            exports: 'NDPRProvider, useNDPRConfig',
            useCase: 'App-level organization, DPO, storage, theme, and error-boundary configuration.',
          },
          {
            packagePath: '@tantainnovative/ndpr-toolkit/core',
            exports: 'useNDPRLocale, defaultLocale, yorubaLocale, igboLocale, hausaLocale, pidginLocale',
            useCase: 'Locale-aware copy and merged fallback strings for toolkit components.',
          },
          {
            packagePath: '@tantainnovative/ndpr-toolkit',
            exports: 'NDPRThemeProvider',
            useCase: 'Pair with NDPRProvider when brand tokens need full CSS-variable control.',
          },
          {
            packagePath: '@tantainnovative/ndpr-recipes',
            exports: 'src/nextjs/app-router/layout-example.tsx',
            useCase: 'Reference root layout showing provider, theme, locale, and metadata wiring.',
          },
        ]}
        checklist={[
          'Set the legal organization name, DPO/privacy email, NDPC registration number, and storage prefix from trusted configuration.',
          'Wire onError to production monitoring so toolkit render failures are visible to the engineering owner.',
          'Choose one root provider for the app unless a sub-brand genuinely needs different copy or storage keys.',
          'Review locale strings with fluent speakers and privacy owners before shipping non-English flows.',
          'Document which environment owns provider values so staging and production do not drift.',
        ]}
        backendNotes={[
          'Load provider values from environment or organization settings rather than hard-coded demo strings.',
          'Keep DPO email and organization identity synchronized with public policy, DSR, and breach notification records.',
          'Use storageKeyPrefix to separate tenants, sub-brands, or test environments on shared domains.',
          'Treat provider locale and theme changes as release changes because they affect public-facing legal UX.',
        ]}
        testingNotes={[
          'Render every major component under the provider and confirm organization and DPO details appear correctly.',
          'Trigger a controlled component error and confirm onError reaches the monitoring service.',
          'Check all enabled locales for missing labels, truncation, and legal meaning changes.',
          'Verify staging and production use distinct storage prefixes when they share a browser domain.',
        ]}
        commonMistakes={[
          'Leaving sample organization names or DPO emails in production configuration.',
          'Nesting providers accidentally and overriding locale or organization details in part of the app.',
          'Using translated strings without privacy/legal review.',
          'Relying on the error boundary without forwarding errors to monitoring.',
        ]}
      />

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import { yorubaLocale } from '@tantainnovative/ndpr-toolkit/core';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NDPRProvider
      organizationName="Acme Nigeria Ltd"
      dpoEmail="dpo@acme.ng"
      ndpcRegistrationNumber="NDPC/REG/0001"
      locale={yorubaLocale}
      onError={(error, info) => {
        // forward to Sentry / Bugsnag / etc.
        console.error('[NDPR]', error, info);
      }}
    >
      {children}
    </NDPRProvider>
  );
}`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props (NDPRConfig)</h2>
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
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">organizationName</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Official organisation name. Used by policy templates, DSR confirmations, and breach reports.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dpoEmail</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Data Protection Officer email. Surfaced in privacy policies, DSR receipts, and regulatory reports.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpcRegistrationNumber</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Optional NDPC registration number for organisations on the data-controller register.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">storageKeyPrefix</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Prefix applied to any localStorage / sessionStorage keys components use. Useful when multiple sub-brands share a domain.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">When <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>, every toolkit component strips its default classes (equivalent to passing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> per-component).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">theme</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ primary?; primaryHover?; primaryForeground? }`}</code></td>
                <td className="py-2">Minimal brand overrides. For the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> token surface, use <Link href="/docs/components/ndpr-theme-provider" className="text-primary hover:underline">NDPRThemeProvider</Link>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">locale</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRLocale</code></td>
                <td className="py-2">Partial locale overrides. Missing keys fall back to the English defaults via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mergeLocale</code>. Bundled locales: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">defaultLocale</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">yorubaLocale</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">igboLocale</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">hausaLocale</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">pidginLocale</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">fallback</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`ReactNode | (error, reset) => ReactNode`}</code></td>
                <td className="py-2">Custom error-boundary UI. If omitted, a minimal red &quot;Something went wrong&quot; panel is shown.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onError</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`(error: Error, info: ErrorInfo) => void`}</code></td>
                <td className="py-2">Called when the boundary catches a render error — wire this to your monitoring service.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="hooks" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Hooks: useNDPRConfig and useNDPRLocale</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Two hooks read from the provider. They are safe to call without a provider — they return an empty
          config / the English locale respectively.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// useNDPRConfig — exported from the root entry
import { useNDPRConfig } from '@tantainnovative/ndpr-toolkit';

function PolicyHeader() {
  const { organizationName, dpoEmail } = useNDPRConfig();
  return (
    <header>
      <h1>{organizationName} Privacy Policy</h1>
      <p>Contact: {dpoEmail}</p>
    </header>
  );
}

// useNDPRLocale — exported from /core (returns the merged locale,
// so every key is always present and non-nullable)
import { useNDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

function ConsentTitle() {
  const locale = useNDPRLocale();
  return <h2>{locale.consent.title}</h2>;
}`}</code>
        </pre>
      </section>

      <section id="nested" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Nested providers</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Nesting <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> is supported — the innermost provider wins for any field it sets.
          The locale, however, does not merge across nesting: an inner provider&apos;s <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">locale</code> prop fully
          replaces the outer one (missing keys fall back to English, not to the outer locale). Most apps use a single
          provider at the root.
        </p>
      </section>

      <section id="error-boundary" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Error boundary</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The provider wraps its children in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRErrorBoundary</code>. If any toolkit component throws during render,
          the boundary catches it, calls <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onError</code> if provided, and renders <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">fallback</code>. Pass a function-style
          fallback to get the reset handle:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<NDPRProvider
  fallback={(error, reset) => (
    <div role="alert">
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <App />
</NDPRProvider>`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/components/ndpr-theme-provider" className="text-primary hover:underline">NDPRThemeProvider</Link> — pair with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> to set the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> token surface.</li>
          <li><Link href="/docs/guides/internationalization" className="text-primary hover:underline">Internationalization</Link> — supported locales and how to author your own.</li>
          <li><Link href="/docs/guides/styling-customization" className="text-primary hover:underline">Styling &amp; Customization</Link> — per-component <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot API.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
