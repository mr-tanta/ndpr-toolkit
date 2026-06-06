'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ServerSideStorageGuide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'SSR-safe storage for the NDPA Toolkit — cookie-bridge pattern',
    description:
      'Patterns for rendering the NDPA Toolkit consent state on the server in Next.js App Router, Remix, Astro, and SvelteKit. Read the consent cookie on the server, seed initial UI state, and let the browser cookieAdapter take over after hydration.',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
    keywords: [
      'SSR consent banner',
      'Next.js App Router cookies',
      'Remix loader cookies',
      'Astro cookies',
      'SvelteKit cookies',
      'ndpr-toolkit',
    ],
  };

  const jsonLdString = JSON.stringify(jsonLd);

  return (
    <DocLayout
      title="Server-Side Storage & SSR-safe Consent"
      description="Read the consent cookie on the server, seed initial state, then let the cookieAdapter take over on the client. Patterns for Next.js, Remix, Astro, and SvelteKit."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The toolkit&apos;s default persistence layer is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>.
          That works fine in a SPA but on the server <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">window</code>{' '}
          and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorage</code> are undefined. The consent state
          is therefore rendered as &quot;unset&quot; on the server, then revealed-or-hidden during hydration when the
          adapter finally runs in the browser — a visible flash and, with strict hydration, a console warning.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> works
          in the browser too (it uses <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">document.cookie</code>),
          but the same cookie is visible to the framework&apos;s request API on the server. That gives you a
          single source of truth that both sides can read. The pattern:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>Configure the toolkit on the client with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> so writes land in a cookie.</li>
          <li>In your server-rendering layer, read that same cookie from the request headers.</li>
          <li>Parse the JSON payload and pass it as initial state to the client component that hosts the banner.</li>
          <li>The banner now hydrates in the correct state (visible only when consent is missing or stale). The cookieAdapter handles every subsequent read and write on the client.</li>
        </ol>
        <p className="mb-4 text-foreground leading-relaxed">
          You do not need a new server-side adapter — the existing <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> at
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/adapters</code> is the persistence layer in
          both directions. The server just needs to read the same cookie name.
        </p>
      </section>

      <section id="cookie-bridge" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Pattern: cookie-bridged SSR initial state</h2>
        <p className="mb-4 text-foreground">
          The cookie name you read on the server <strong>must match</strong> the key you pass to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> on
          the client. The examples below use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr-consent</code>{' '}
          throughout. The full setup is three pieces:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>A server bit</strong> that reads <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr-consent</code> from the request cookies.</li>
          <li><strong>A small parser</strong> that decodes <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">decodeURIComponent(JSON.stringify(T))</code> back into a typed object.</li>
          <li><strong>A client component</strong> that receives the parsed value as a prop and feeds it into{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'<ConsentBanner show={...}>'}</code> so the banner does not flash open while consent already exists.</li>
        </ul>
      </section>

      <section id="nextjs" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next.js App Router (RSC)</h2>
        <p className="mb-4 text-foreground">
          Read the cookie in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">app/layout.tsx</code>{' '}
          (a Server Component) and forward the parsed value to a client wrapper:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/layout.tsx
import { cookies } from 'next/headers';
import { parseConsentCookie } from '@/lib/parse-consent-cookie';
import { ConsentRoot } from './ConsentRoot';
import '@tantainnovative/ndpr-toolkit/styles';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialConsent = parseConsentCookie(cookieStore.get('ndpr-consent')?.value);

  return (
    <html lang="en">
      <body>
        <ConsentRoot initialConsent={initialConsent}>{children}</ConsentRoot>
      </body>
    </html>
  );
}`}</code></pre>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/ConsentRoot.tsx
'use client';

import { useMemo } from 'react';
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';
import { cookieAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type { ConsentSettings, ConsentOption } from '@tantainnovative/ndpr-toolkit';

const OPTIONS: ConsentOption[] = [
  { id: 'essential', label: 'Essential', description: 'Required.', required: true, purpose: 'Site operation' },
  { id: 'analytics', label: 'Analytics', description: 'Usage stats.', required: false, purpose: 'Analytics' },
];

export function ConsentRoot({
  initialConsent,
  children,
}: { initialConsent: ConsentSettings | null; children: React.ReactNode }) {
  const adapter = useMemo(() => cookieAdapter<ConsentSettings>('ndpr-consent'), []);
  const hasConsent = initialConsent?.hasInteracted === true;

  return (
    <>
      {children}
      <ConsentBanner
        options={OPTIONS}
        manageStorage={false}
        show={!hasConsent}
        onSave={(settings) => adapter.save(settings)}
      />
    </>
  );
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">manageStorage={'{false}'}</code>{' '}
          tells the banner not to talk to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorage</code> directly —{' '}
          the cookie adapter owns persistence end to end. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">show</code>{' '}
          is derived from server-parsed state, so the banner is rendered in its final visibility on the first paint.
        </p>
      </section>

      <section id="remix" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Remix</h2>
        <p className="mb-4 text-foreground">
          Parse the cookie inside a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">loader</code> and read it via{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useLoaderData</code> in the component:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/root.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { parseConsentCookie } from '~/lib/parse-consent-cookie';
import { ConsentRoot } from '~/components/ConsentRoot';
import '@tantainnovative/ndpr-toolkit/styles';

export async function loader({ request }: LoaderFunctionArgs) {
  const header = request.headers.get('cookie') ?? '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith('ndpr-consent='));
  const raw = match?.slice('ndpr-consent='.length);
  return json({ initialConsent: parseConsentCookie(raw) });
}

export default function App() {
  const { initialConsent } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <body>
        <ConsentRoot initialConsent={initialConsent}>
          <Outlet />
        </ConsentRoot>
      </body>
    </html>
  );
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentRoot</code>{' '}
          here is the same client wrapper as the Next.js example — it imports{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentBanner</code>{' '}
          and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code>, decides{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">show</code> from the prop, and writes through the adapter on save.
          Remix has no <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'"use client"'}</code> boundary;
          every component runs in both environments, so no separate file is strictly required.
        </p>
      </section>

      <section id="astro" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Astro</h2>
        <p className="mb-4 text-foreground">
          Astro pages run on the server by default. Use{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Astro.cookies.get</code> in the frontmatter and pass the parsed value into a React island:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`---
// src/pages/index.astro
import { parseConsentCookie } from '../lib/parse-consent-cookie';
import { ConsentRoot } from '../components/ConsentRoot';
import '@tantainnovative/ndpr-toolkit/styles';

const initialConsent = parseConsentCookie(Astro.cookies.get('ndpr-consent')?.value);
---
<html lang="en">
  <body>
    <main>
      <h1>Welcome</h1>
    </main>
    <ConsentRoot client:load initialConsent={initialConsent} />
  </body>
</html>`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">client:load</code>{' '}
          hydrates the React island immediately. The prop passed across the bridge is plain JSON so it
          survives serialisation; the island itself is the same{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentRoot</code> as before.
        </p>
      </section>

      <section id="sveltekit" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">SvelteKit</h2>
        <p className="mb-4 text-foreground">
          The toolkit&apos;s UI is React-only, so this applies if you mount the React banner via a wrapper
          such as <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">svelte-react</code>{' '}
          or run it inside a Svelte component shell. The server side of the pattern is unchanged:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { parseConsentCookie } from '$lib/parse-consent-cookie';

export const load: LayoutServerLoad = ({ cookies }) => ({
  initialConsent: parseConsentCookie(cookies.get('ndpr-consent')),
});`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The value is then available as <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data.initialConsent</code> in{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">+layout.svelte</code> and can be forwarded to the React island.
        </p>
      </section>

      <section id="cookie-format" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Reading the cookie format</h2>
        <p className="mb-4 text-foreground">
          The shape that lands in the cookie is the toolkit&apos;s{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentSettings</code> object,
          serialised with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">JSON.stringify</code> and then URL-encoded.
          The relevant source is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">packages/ndpr-toolkit/src/adapters/cookie.ts</code> at line 30.
          The matching parser is small and shared by every framework:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// lib/parse-consent-cookie.ts
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit';

export function parseConsentCookie(raw: string | undefined): ConsentSettings | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as ConsentSettings;
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.timestamp !== 'number') return null;
    if (typeof parsed.consents !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The shape validation is deliberately narrow — if the cookie is corrupt, tampered, or was written by an
          older version of the toolkit, returning <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">null</code>{' '}
          means the banner re-opens and the user re-consents. Failing closed is the correct default for a
          consent record under NDPA Section 26.
        </p>
      </section>

      <section id="caveats" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Caveats</h2>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Cookie size limits</h3>
        <p className="mb-4 text-foreground">
          Browsers cap a single cookie at roughly 4 KB. The default{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ConsentSettings</code> payload is well under 1 KB,
          but if you push large <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dataCategories</code> arrays into
          each option you can outgrow that. If the payload starts approaching the limit, store only the minimal
          decision map in the cookie and keep the full settings server-side keyed by a session cookie.
        </p>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Cookie security</h3>
        <p className="mb-4 text-foreground">
          The toolkit&apos;s <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> writes with{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">SameSite=Lax</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Secure</code> by default. Both are appropriate for a
          consent cookie. Do <strong>not</strong> set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">HttpOnly</code> —
          the client needs to read it to render the banner and to write updates. If your threat model includes
          XSS-based consent tampering, store the canonical consent record server-side and treat the cookie as a hint.
        </p>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">SSR/CSR mismatch</h3>
        <p className="mb-4 text-foreground">
          The bridge eliminates the visible flash but only if the server-parsed cookie matches what the client
          would compute. Two ways that can drift:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>The cookie name on the server differs from the key passed to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">cookieAdapter</code> on the client. Keep both at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr-consent</code> or pull the name from a shared constant.</li>
          <li>The version pinned on the banner via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'<ConsentBanner version="...">'}</code> changes. The banner treats a stale version as &quot;needs re-consent&quot;, so derive <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">show</code> from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">parsed?.version === currentVersion</code>, not from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">hasInteracted</code> alone.</li>
        </ul>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Edge cases per framework</h3>
        <p className="mb-4 text-foreground">
          The pattern works in every server-rendered React framework that exposes a request-cookie API. It does{' '}
          <strong>not</strong> apply to static export (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">next export</code>,
          Astro&apos;s default <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">output: &apos;static&apos;</code>) because
          there is no request and therefore no cookie to read at build time. Use SSR (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">output: &apos;server&apos;</code>)
          or fall back to the default localStorage adapter and accept the hydration flash.
        </p>
      </section>

      <section id="see-also" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">See also</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/guides/server-rendering" className="text-primary hover:underline">
              Server Rendering &amp; RSC
            </Link>{' '}
            — the <code className="bg-muted px-1 py-0.5 rounded">/server</code> entry, validators, and policy generation.
          </li>
          <li>
            <Link href="/docs/guides/adapters" className="text-primary hover:underline">
              Storage Adapters
            </Link>{' '}
            — full reference for <code className="bg-muted px-1 py-0.5 rounded">cookieAdapter</code>,{' '}
            <code className="bg-muted px-1 py-0.5 rounded">composeAdapters</code>, and friends.
          </li>
          <li>
            <Link href="/docs/guides/managing-consent" className="text-primary hover:underline">
              Managing Consent
            </Link>{' '}
            — NDPA Section 25-26 obligations and the banner&apos;s lifecycle.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
