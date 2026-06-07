import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { FaqSection } from '@/components/site/FaqSection';

export const metadata: Metadata = {
  title: 'Nigeria DPIA Tool — Section 28 Data Privacy Impact Assessment',
  description:
    'Free, open-source Data Privacy Impact Assessment (DPIA) tool for Nigeria NDPA 2023 Section 28. Stepped questionnaire, risk scoring, mitigation tracking, NDPC consultation flag, PDF/DOCX export. Drop-in React component with a typed hook for custom UIs.',
  keywords:
    'Nigeria DPIA tool, NDPA Section 28 DPIA, NDPR DPIA, NDPC DPIA consultation, Nigeria DPIA template, Data Privacy Impact Assessment Nigeria, Nigeria high-risk processing assessment, NDPC GAID 2025, DCPMI',
  alternates: { canonical: '/ndpa-dpia-tool' },
  openGraph: {
    title: 'Nigeria DPIA Tool — NDPA 2023 Section 28 Compliant',
    description:
      'Free open-source DPIA tool for Nigeria NDPA 2023 Section 28. Stepped questionnaire, risk scoring, mitigation tracking, NDPC consultation flag, PDF/DOCX export.',
    url: 'https://ndprtoolkit.com.ng/ndpa-dpia-tool',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'Nigeria NDPA DPIA Tool — Section 28',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria DPIA Tool — NDPA 2023 Section 28',
    description:
      'Free open-source DPIA tool for Nigeria NDPA 2023. Questionnaire, risk scoring, mitigation, NDPC consultation flag, PDF/DOCX export.',
    images: ['/screenshots/hero.png'],
  },
};

// Static, server-rendered JSON-LD — no user input — safe to inject.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPR Toolkit DPIA Questionnaire',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Privacy & Compliance · DPIA',
  operatingSystem: 'Cross-platform (Browser, Node.js, Next.js, Edge)',
  description:
    'Open-source Data Privacy Impact Assessment tool for Nigeria NDPA 2023 Section 28. Stepped questionnaire, weighted risk scoring, mitigation tracking, NDPC prior-consultation flag, and PDF/DOCX export.',
  url: 'https://ndprtoolkit.com.ng/ndpa-dpia-tool',
  downloadUrl: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  keywords: 'Nigeria DPIA tool, NDPA Section 28, Nigeria DPIA template',
};

const faqs = [
  {
    question: 'When is a DPIA required under the Nigeria Data Protection Act?',
    answer:
      'NDPA 2023 Section 28(1) requires a Data Privacy Impact Assessment before any processing likely to result in a high risk to the rights and freedoms of data subjects — for example large-scale processing of sensitive data (Section 30), systematic monitoring of public areas, automated decisions with significant effects (Section 37), or combining datasets in unexpected ways. The NDPC’s GAID 2025 also expects DPIAs from Data Controllers and Processors of Major Importance (DCPMI).',
  },
  {
    question: 'What is a DPIA under NDPA 2023?',
    answer:
      'A Data Privacy Impact Assessment is a documented analysis of a processing activity that identifies the data flows and data subjects involved, scores the privacy risks by likelihood and severity, records mitigations, and determines the residual risk. It is how a controller demonstrates it considered privacy risk before processing, as required by Section 28.',
  },
  {
    question: 'When must I consult the NDPC about a DPIA?',
    answer:
      'Under Section 28(2), if the residual risk remains high after you apply mitigations, you must consult the Nigeria Data Protection Commission before proceeding. The tool surfaces this automatically: the result returns requiresConsultation: true when the residual risk is high or critical.',
  },
  {
    question: 'Is the DPIA tool free and open source?',
    answer:
      'Yes — it is MIT-licensed and free. You can use the drop-in NDPRDPIA preset component, or the headless useDPIA hook with the DPIAProvider compound API to build your own interface on top of the same scoring engine.',
  },
  {
    question: 'Can I export the completed DPIA?',
    answer:
      'Yes. The tool produces deterministic PDF and DOCX exports, each carrying the “not legal advice” notice the toolkit ships everywhere, so the assessment is ready to file in your compliance records or hand to your DPO.',
  },
];

export default function NDPADPIAToolLanding() {
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
            NDPA Section 28 · Free · Open source
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nigeria DPIA Tool &mdash;{' '}
            <span className="text-primary">NDPA Section 28 Compliant</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A complete Data Privacy Impact Assessment workflow for Nigeria&apos;s Data
            Protection Act 2023. Stepped questionnaire, weighted risk scoring,
            mitigation tracking, NDPC prior-consultation flag, and PDF/DOCX
            export &mdash; all as a typed React component or a headless hook
            you can wrap in your own UI.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/docs/components/dpia-questionnaire" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">Read the docs →</Link>
            <Link href="/ndpr-demos/dpia" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-card">Try the live demo</Link>
          </div>
        </header>

        <section className="prose prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">When do I need a DPIA under Nigerian law?</h2>
          <p>
            NDPA 2023 Section 28(1) requires a Data Privacy Impact Assessment <em>before</em> any
            processing that is likely to result in a high risk to the rights and freedoms of data
            subjects. The NDPC&apos;s General Application and Implementation Directive (GAID) 2025
            reinforces DPIAs as an expectation for Data Controllers and Processors of Major Importance
            (DCPMI) — not sure if that&apos;s you? Check your tier with the{' '}
            <Link href="/docs/guides/dcpmi-registration" className="text-primary hover:underline">DCPMI registration classifier</Link>.
            In practice, a DPIA covers:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Large-scale processing of <strong>sensitive personal data</strong> (Section 30) &mdash; health, biometric, financial, religious, political, ethnic, children.</li>
            <li>Systematic monitoring of publicly accessible areas (CCTV, surveillance, geo-location).</li>
            <li>Automated decision-making with legal or similarly significant effects (Section 37 territory).</li>
            <li>Combining datasets in ways data subjects would not reasonably expect.</li>
            <li>Any processing the NDPC has formally designated high-risk in subsidiary guidance.</li>
          </ul>
          <p>
            Under Section 28(2), if residual risk after mitigation remains high, the controller
            <strong> must consult the NDPC</strong> before proceeding. The DPIA tool surfaces this
            consultation requirement automatically as part of the result.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What the tool does</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Stepped questionnaire</strong> &mdash; multi-section flow covering project overview, data flows, data subjects, lawful basis, risks, and mitigations. Progress indicator + per-section validation.</li>
            <li><strong>Weighted risk scoring</strong> &mdash; each risk gets a likelihood × severity score; mitigated risks reduce the residual level.</li>
            <li><strong>NDPC consultation flag</strong> &mdash; the result returns <code>requiresConsultation: true</code> when residual risk is high or critical, matching Section 28(2).</li>
            <li><strong>Audit-friendly output</strong> &mdash; deterministic PDF + DOCX export with the legal notice footer the NDPR Toolkit ships everywhere.</li>
            <li><strong>Headless mode</strong> &mdash; if the default UI is too opinionated, use the <code>useDPIA</code> hook + <code>DPIAProvider</code> compound API and build your own.</li>
            <li><strong>Persistence</strong> &mdash; long DPIAs save progress via any <code>StorageAdapter</code> (localStorage by default).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">Install</h2>
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`pnpm add @tantainnovative/ndpr-toolkit`}</code></pre>
          <p>Drop the preset into any client component:</p>
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`// app/dpia/page.tsx
'use client';
import { NDPRDPIA } from '@tantainnovative/ndpr-toolkit/presets';

export default function DPIAPage() {
  return (
    <NDPRDPIA
      onResult={(result) => {
        fetch('/api/dpia', { method: 'POST', body: JSON.stringify(result) });
      }}
    />
  );
}`}</code></pre>

          <h2 className="text-2xl font-bold mt-10 mb-4">Built for Nigerian compliance teams</h2>
          <p>
            Every label, section reference, and consultation prompt is derived from the gazetted
            text of the NDPA 2023 (not GDPR, not Nebraska&apos;s NDPA). Section numbers are
            consistent with the Act as published &mdash; if NDPC issues subsidiary guidance that
            changes thresholds, the toolkit&apos;s open-source repo accepts PRs from privacy
            practitioners.
          </p>
        </section>

        <section className="border-t border-border pt-10 pb-2 mb-10">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-xl font-bold mb-2">Want to know your overall NDPA risk?</h2>
            <p className="text-base text-muted-foreground mb-4">
              The DPIA tool covers Section 28. The free 5-minute audit scores your whole compliance
              posture across all 8 NDPA modules with prioritised fixes.
            </p>
            <Link
              href="/score"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Run the free NDPA audit →
            </Link>
          </div>
        </section>

        <FaqSection faqs={faqs} />

        <section className="border-t border-border pt-12 mt-12">
          <h2 className="text-2xl font-bold mb-6">Related</h2>
          <ul className="space-y-3">
            <li><Link href="/docs/components/dpia-questionnaire" className="text-primary hover:underline">DPIA Questionnaire — full API reference</Link></li>
            <li><Link href="/docs/guides/conducting-dpia" className="text-primary hover:underline">Guide — conducting a DPIA under Section 28</Link></li>
            <li><Link href="/ndpr-demos/dpia" className="text-primary hover:underline">Interactive live demo</Link></li>
            <li><Link href="/docs/components/breach-notification" className="text-primary hover:underline">Breach notification — 72-hour countdown</Link></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
