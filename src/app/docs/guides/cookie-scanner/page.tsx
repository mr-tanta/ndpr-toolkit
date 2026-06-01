'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CookieScannerGuide() {
  return (
    <DocLayout
      title="Cookie Scanner"
      description="Audit the cookies actually present against the cookies you declare — surface undeclared trackers that fall outside your cookie notice (NDPA 2023 S.25-26 / NDPC GAID 2025)"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What this covers</h2>
        <p className="mb-4 text-foreground">
          Under <strong>NDPA 2023 Sections 25–26</strong> and the <strong>NDPC GAID 2025</strong> directive, consent
          for non-essential cookies must be specific and informed — which means the cookies your site actually sets
          should match the categories your notice describes. In practice, third-party scripts quietly drop cookies that
          were never declared. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">scanCookies()</code>{' '}
          finds that gap.
        </p>
        <p className="mb-4 text-foreground">
          It compares the cookies actually present against the cookies you declare and reports which are{' '}
          <strong>declared</strong>, which are <strong>undeclared</strong> (the compliance gap), which undeclared ones a
          built-in registry can still <strong>identify</strong>, and which remain fully <strong>unknown</strong>. It is a
          pure function with no React dependency and is DOM-optional — pass a cookie string (a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Cookie:</code> header server-side,
          or a test fixture) or let it read{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">document.cookie</code> in the
          browser. It ships from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/consent</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code>, and the package
          root, plus the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useCookieScan</code> hook for
          client UIs.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">A compliance-discovery aid, not legal advice</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The scanner reads the cookies present in a given context and classifies them. It can&apos;t see cookies set on
            other pages, in other browsers, or by scripts that haven&apos;t run yet — run it where your third-party tags
            load, and verify against current NDPC guidance.
          </p>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using scanCookies()</h2>
        <p className="mb-4 text-foreground">
          Declare the cookies you expect — by exact name, a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">prefix</code>, or a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RegExp</code> — each tagged with a
          consent category, and optionally a provider and purpose for your cookie policy:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { scanCookies } from '@tantainnovative/ndpr-toolkit/core'; // or /server

const scan = scanCookies(
  [
    { name: 'sid', category: 'necessary', provider: 'App', purpose: 'Login session' },
    { name: 'app_', prefix: true, category: 'functional' },
    { name: /^analytics-[0-9]+$/, category: 'analytics' },
  ],
  { cookieString: document.cookie }, // omit entirely in the browser to read it automatically
);

scan.total;        // number of cookies present
scan.complete;     // false while any undeclared cookie is present
scan.declared;     // cookies that matched one of your declarations
scan.undeclared;   // present but NOT declared — the compliance gap
scan.identified;   // undeclared, but the registry knows them (_ga -> Google Analytics, ...)
scan.unknown;      // undeclared and unidentifiable
scan.byCategory;   // present cookies grouped by resolved category ('uncategorized' for nulls)`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          On the server, pass a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Cookie</code>{' '}
          header instead — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`scanCookies(declared, { cookieString: req.headers.cookie ?? '' })`}</code>{' '}
          — which makes it safe to run inside Server Components, middleware, or a CI check.
        </p>
      </section>

      <section id="result" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Reading the result</h2>
        <p className="mb-4 text-foreground">
          Every present cookie is returned in{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">scan.cookies</code> as a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ScannedCookie</code> with how it
          was matched:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// ScannedCookie
{
  name: '_ga',
  category: 'analytics',     // resolved category, or null when unclassified
  matchedBy: 'known',        // 'declared' | 'known' | 'none'
  provider: 'Google Analytics',
  purpose: 'Distinguishes users',
}`}</code></pre>
        </div>
        <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
          <li><strong>declared</strong> — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">matchedBy: &apos;declared&apos;</code>: matched one of your declarations.</li>
          <li><strong>identified</strong> — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">matchedBy: &apos;known&apos;</code>: undeclared, but recognised by the built-in registry.</li>
          <li><strong>unknown</strong> — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">matchedBy: &apos;none&apos;</code>: undeclared and unidentifiable.</li>
        </ul>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">undeclared</code> is{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">identified</code> +{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unknown</code> — the list to act
          on. Drop it into CI to fail a build when an unexpected cookie appears, or render it in a DPO dashboard.
        </p>
      </section>

      <section id="registry" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The known-cookie registry</h2>
        <p className="mb-4 text-foreground">
          A built-in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">KNOWN_COOKIES</code>{' '}
          registry recognises widely deployed third-party cookies — Google Analytics/GA4, Google Ads, Meta, Hotjar,
          Microsoft Clarity, LinkedIn, Stripe, HubSpot, TikTok, Intercom, and others — so undeclared cookies are usually
          still identified with a provider and a likely category. Your own declarations always take precedence over the
          registry.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Extend the registry for tools it doesn't know yet
scanCookies(declared, {
  knownCookies: [{ name: 'acme_pixel', category: 'marketing', provider: 'Acme Ads' }],
});

// Or rely solely on your own declarations
scanCookies(declared, { useKnownRegistry: false });`}</code></pre>
        </div>
      </section>

      <section id="hook" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The useCookieScan hook</h2>
        <p className="mb-4 text-foreground">
          For client UIs, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useCookieScan</code>{' '}
          (from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/hooks</code>) scans on mount
          and returns a stable <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rescan()</code>{' '}
          to re-run after you set or clear cookies. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">result</code>{' '}
          is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">null</code> until the first
          client-side scan, so server and first client render agree — no hydration mismatch.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`'use client';
import { useCookieScan } from '@tantainnovative/ndpr-toolkit/hooks';

function CookieAudit() {
  const { result, rescan } = useCookieScan([
    { name: 'sid', category: 'necessary' },
  ]);

  if (!result) return null; // pre-scan (SSR / first render)

  return (
    <div>
      <p>{result.undeclared.length} undeclared cookie(s)</p>
      <button onClick={rescan}>Re-scan</button>
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 text-foreground space-y-2">
          <li>
            <Link href="/docs/guides/managing-consent" className="text-primary hover:underline">
              Managing Consent
            </Link>{' '}
            — collect, store, and withdraw consent for the categories the scanner checks against.
          </li>
          <li>
            <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">
              Compliance Score
            </Link>{' '}
            — scores your consent posture alongside the other seven NDPA modules.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
