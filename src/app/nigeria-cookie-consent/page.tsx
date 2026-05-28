import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Nigeria Cookie Consent Banner for React — NDPA 2023 Compliant',
  description:
    'Drop-in cookie consent banner for Nigerian websites. NDPA 2023 + GAID 2025 compliant. Supports granular categories (necessary, analytics, marketing, ads, functional), audit log, withdrawal-as-easy-as-consent (Section 26), version-bump re-prompt, and storage adapters for any backend.',
  keywords:
    'Nigeria cookie consent, Nigeria cookie banner, NDPA cookie consent, NDPR cookie consent, Nigeria cookie law React, NDPA Section 26 consent, cookie consent Nigerian fintech, Nigeria consent management',
  alternates: { canonical: '/nigeria-cookie-consent' },
  openGraph: {
    title: 'Nigeria Cookie Consent Banner for React — NDPA 2023 Compliant',
    description:
      'Drop-in cookie consent banner for Nigerian websites. NDPA 2023 + GAID 2025 compliant. Granular categories, audit log, withdrawal, version-bump re-prompt.',
    url: 'https://ndprtoolkit.com.ng/nigeria-cookie-consent',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'Nigeria NDPA Cookie Consent Banner for React',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria Cookie Consent Banner for React — NDPA 2023 Compliant',
    description:
      'Drop-in cookie consent banner for Nigerian websites. NDPA 2023 + GAID 2025 compliant.',
    images: ['/screenshots/hero.png'],
  },
};

// Static, server-rendered JSON-LD — no user input — safe to inject.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPR Toolkit Cookie Consent Banner',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Cookie Consent / CMP',
  operatingSystem: 'Cross-platform (Browser, Node.js, Next.js, Edge)',
  description:
    'NDPA 2023-compliant cookie consent banner for React and Next.js. Supports granular categories, audit log, withdrawal as easy as consent (Section 26), version-bump re-prompt, and pluggable storage adapters.',
  url: 'https://ndprtoolkit.com.ng/nigeria-cookie-consent',
  downloadUrl: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  keywords:
    'Nigeria cookie consent, Nigeria cookie banner, NDPA cookie consent, Section 26 consent',
};

export default function NigeriaCookieConsentLanding() {
  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Nigeria NDPA 2023 · MIT licensed · Open source
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Cookie Consent Banner for Nigerian Websites &mdash;{' '}
            <span className="text-primary">NDPA 2023 Compliant</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A drop-in React cookie consent banner built for the Nigeria Data
            Protection Act 2023. Granular categories, audit log, easy
            withdrawal, version-bump re-prompt, and pluggable storage adapters
            for any backend. Free and open source.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/docs/components/consent-management"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Read the docs →
            </Link>
            <Link
              href="/ndpr-demos/consent"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-card"
            >
              Try the live demo
            </Link>
          </div>
        </header>

        <section className="prose prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">Why a Nigeria-specific cookie consent banner?</h2>
          <p>
            Generic GDPR cookie banners do not satisfy Section 26 of the Nigeria Data Protection Act 2023,
            which requires consent to be <strong>specific, informed, freely given, and affirmative</strong>{' '}
            &mdash; with the right to withdraw at any time made as easy as the act of giving consent.
            The NDPR Toolkit cookie banner is built against the gazetted Act and the 2025 General
            Application and Implementation Directive (GAID), with audit-friendly defaults Nigerian DPOs
            can sign off on.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What you get</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Granular consent categories</strong> &mdash; necessary (always on), analytics, marketing, advertising, functional, with human-readable purpose descriptions for every category.</li>
            <li><strong>Section 26 withdrawal</strong> &mdash; one-click access to a consent management dialog from any page; revoke specific categories without losing necessary cookies.</li>
            <li><strong>Version-bump re-prompt</strong> &mdash; bump the consent version when your purposes change and every prior visitor gets re-asked. No stale consent.</li>
            <li><strong>Audit log</strong> &mdash; every accept / reject / update is recorded with timestamp and version, satisfying NDPC record-keeping requirements.</li>
            <li><strong>Storage adapters</strong> &mdash; localStorage, sessionStorage, cookie, API, or a custom backend via <code>StorageAdapter</code>. Bring your own Prisma / Drizzle / Firestore / Supabase.</li>
            <li><strong>RSC-safe</strong> &mdash; ships <code>&quot;use client&quot;</code> banners correctly so you can drop it into Next.js App Router without manual wrappers.</li>
            <li><strong>Multilingual</strong> &mdash; English (Nigeria), Yorùbá, Igbo, Hausa, and Pidgin locales out of the box; custom locales via a typed <code>mergeLocale</code> helper.</li>
            <li><strong>Accessible</strong> &mdash; WCAG 2.1 AA, full keyboard navigation, focus trap that restores focus on close, <code>prefers-reduced-motion</code> respected.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">30-second install</h2>
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`pnpm add @tantainnovative/ndpr-toolkit`}</code></pre>
          <p>Then drop the preset into your Next.js layout:</p>
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`// app/layout.tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import '@tantainnovative/ndpr-toolkit/styles';

export default function RootLayout({ children }) {
  return (
    <html lang="en-NG">
      <body>
        {children}
        <NDPRConsent />
      </body>
    </html>
  );
}`}</code></pre>
          <p>
            That&apos;s it &mdash; the banner appears on first visit, the preferences icon stays accessible site-wide,
            and every event is persisted to <code>localStorage</code> by default. For server-side persistence
            (recommended for fintech and health-tech), pass an <code>apiAdapter</code> and wire it to your existing
            user model.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Built for Nigerian apps</h2>
          <p>
            NDPR Toolkit is used by Nigerian fintech, insurtech, healthcare, and SaaS teams to satisfy the NDPC&apos;s
            compliance notices issued to licensed banks, insurance brokers, gaming operators, and pension funds.
            It is not legal advice &mdash; we recommend you have your DPO review the deployed consent surface
            &mdash; but it ships every piece of the consent stack the NDPC asks about during an audit, with the
            section references baked into the API.
          </p>
        </section>

        <section className="border-t border-border pt-10 pb-2 mb-10">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-xl font-bold mb-2">Not sure if your consent flow already passes?</h2>
            <p className="text-base text-muted-foreground mb-4">
              Take the free 5-minute NDPA audit. It scores your consent banner, DSR portal, breach
              process, and 5 other modules against the gazetted Act and gives you prioritised fixes.
            </p>
            <Link
              href="/score"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Run the free NDPA audit →
            </Link>
          </div>
        </section>

        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold mb-6">Related</h2>
          <ul className="space-y-3">
            <li><Link href="/docs/components/consent-management" className="text-primary hover:underline">Consent Management — full component API reference</Link></li>
            <li><Link href="/docs/guides/managing-consent" className="text-primary hover:underline">Guide — managing consent under NDPA 2023</Link></li>
            <li><Link href="/ndpr-demos/consent" className="text-primary hover:underline">Interactive live demo</Link></li>
            <li><Link href="/docs/guides/adapters" className="text-primary hover:underline">Storage adapters guide (Prisma, Drizzle, Firestore, custom)</Link></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
