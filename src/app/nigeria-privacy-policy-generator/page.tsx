import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { FaqSection } from '@/components/site/FaqSection';

export const metadata: Metadata = {
  title: 'Nigeria Privacy Policy Generator — NDPA 2023 Free & Open Source',
  description:
    'Free privacy policy generator for Nigerian websites and apps. NDPA 2023 + GAID 2025 compliant: lawful basis, data-subject rights (Section 34), retention, cross-border transfer, sensitive data, children, automated decisions, NDPC complaint route. Export to HTML, Markdown, PDF, or DOCX.',
  keywords:
    'Nigeria privacy policy generator, NDPA privacy policy, NDPR privacy policy template, Nigeria privacy policy template, free Nigerian privacy policy, NDPC compliant privacy policy, NDPA Section 27 privacy notice',
  alternates: { canonical: '/nigeria-privacy-policy-generator' },
  openGraph: {
    title: 'Nigeria Privacy Policy Generator — NDPA 2023, Free',
    description:
      'Free privacy policy generator for Nigerian websites + apps. NDPA 2023 compliant. Export to HTML, Markdown, PDF, or DOCX.',
    url: 'https://ndprtoolkit.com.ng/nigeria-privacy-policy-generator',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'Nigeria NDPA Privacy Policy Generator',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria Privacy Policy Generator — Free, NDPA 2023 Compliant',
    description:
      'Free, open-source privacy policy generator for Nigerian apps. NDPA 2023 + GAID 2025. PDF / DOCX / HTML / Markdown export.',
    images: ['/screenshots/hero.png'],
  },
};

// Static, server-rendered JSON-LD — no user input — safe to inject.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPR Toolkit Privacy Policy Generator',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Privacy Policy Generator',
  operatingSystem: 'Cross-platform (Browser, Node.js, Next.js, Edge)',
  description:
    'Free, NDPA 2023-compliant privacy policy generator for Nigerian websites and apps. Lawful basis, data-subject rights, retention, cross-border, sensitive data, children, automated decisions. HTML / Markdown / PDF / DOCX export.',
  url: 'https://ndprtoolkit.com.ng/nigeria-privacy-policy-generator',
  downloadUrl: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  keywords:
    'Nigeria privacy policy generator, NDPA privacy policy, Section 27 privacy notice',
};

const faqs = [
  {
    question: 'Does the Nigeria Data Protection Act require a privacy policy?',
    answer:
      'Effectively, yes. NDPA 2023 Section 27 requires a data controller to provide data subjects with specified information before (or at the point of) collecting their personal data. A published privacy policy is the standard way to meet that “provision of information” duty, so any Nigerian website or app that collects personal data needs one.',
  },
  {
    question: 'What must a Nigerian privacy policy include under the NDPA?',
    answer:
      'Section 27(1) requires the controller’s identity and contact details (and the DPO under Section 32), the specific lawful basis (Section 25(1), or Section 30 for sensitive data), recipients including any cross-border transfers (Section 41), the retention period, the data-subject rights under Part VI (Sections 34–38), the right to complain to the NDPC (Section 46), and any automated decision-making (Section 37). The generator produces all of these.',
  },
  {
    question: 'Is the privacy policy generator free, and do I need to give an email?',
    answer:
      'It is free and MIT-licensed, with no email signup and no SaaS lock-in. You run it inside your own app or DPO portal, so the generated policy and any data you enter never leave your environment.',
  },
  {
    question: 'What formats can I export the privacy policy to?',
    answer:
      'HTML, Markdown, PDF and DOCX, via the exportHTML, exportMarkdown, exportPDF and exportDOCX helpers. The underlying output is a typed PrivacyPolicy object, so you can also render it however you like.',
  },
  {
    question: 'Does it handle sensitive personal data and children’s data?',
    answer:
      'Yes. The generator includes a conditional sensitive-personal-data section citing Section 30, and a children’s-data section citing Section 31 and the Child’s Right Act parental-consent requirement — each included only when your configuration says they apply.',
  },
  {
    question: 'Is the generated policy legal advice?',
    answer:
      'No. Every artifact ships with a clear “not legal advice” notice. The generator covers the Section 27 disclosure list mechanically, but your DPO or qualified Nigerian privacy counsel should review the final wording before publication.',
  },
];

export default function NigeriaPrivacyPolicyGeneratorLanding() {
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
            NDPA Section 27 · Free · No email required
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nigeria Privacy Policy Generator &mdash;{' '}
            <span className="text-primary">Free, NDPA 2023 Compliant</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A free, open-source privacy-policy generator built for Nigerian apps. Generates the
            disclosures NDPA 2023 Section 27 requires &mdash; lawful basis, data-subject rights,
            retention, cross-border transfers, sensitive data, children&apos;s data, automated
            decisions, and the NDPC complaint route &mdash; with HTML / Markdown / PDF / DOCX
            export. No email signup, no SaaS lock-in.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/docs/components/privacy-policy-generator" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">Read the docs →</Link>
            <Link href="/ndpr-demos/policy" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-card">Generate one now</Link>
          </div>
        </header>

        <section className="prose prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">What Nigerian law requires in a privacy policy</h2>
          <p>
            NDPA 2023 Section 27(1) lists the information a data controller must provide to data
            subjects <strong>before</strong> collecting personal data. The privacy policy is the
            standard surface for these disclosures:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Identity and contact details of the controller (and the DPO under Section 32).</li>
            <li>Specific lawful basis for processing under Section 25(1) or Section 30(1) (for sensitive personal data).</li>
            <li>Recipients or categories of recipients &mdash; including third-country recipients (cross-border, Section 41).</li>
            <li>Retention period (or the criteria used to determine it).</li>
            <li>Existence of the rights of the data subject under Part VI (Sections 34&ndash;38, plus 35 and 36).</li>
            <li>Right to lodge a complaint with the Nigeria Data Protection Commission under Section 46(1).</li>
            <li>Existence of automated decision-making, including profiling (Section 37), and meaningful information about the logic involved.</li>
          </ul>
          <p>
            The NDPR Toolkit generator covers all of these, with section references baked into the
            output so your DPO can verify compliance at a glance.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Sections the generator includes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity &amp; contact</strong> &mdash; organisation, address, website, privacy contact, DPO.</li>
            <li><strong>Data we collect</strong> &mdash; itemised by category, with purpose for each.</li>
            <li><strong>Lawful basis</strong> &mdash; consent, contract, legal obligation, vital interests, public interest, legitimate interests; cited to Section 25(1)(a)&ndash;(f).</li>
            <li><strong>Sensitive personal data</strong> &mdash; only included when applicable; cites Section 30.</li>
            <li><strong>Children&apos;s data</strong> &mdash; conditional section citing Section 31 and Nigeria&apos;s Child&apos;s Right Act parental-consent requirements.</li>
            <li><strong>Data-subject rights</strong> &mdash; access (S.34(1)(a)&ndash;(b)), rectification (S.34(1)(c)), erasure (S.34(1)(d) + S.34(2)), restriction (S.34(1)(e)), withdraw consent (S.35), object (S.36), automated decisions (S.37), portability (S.38).</li>
            <li><strong>Retention</strong> &mdash; per-category retention or the criteria used to set it.</li>
            <li><strong>Cross-border transfer</strong> &mdash; conditional section citing Section 41 mechanisms, Section 42 adequacy, and Section 43 derogations.</li>
            <li><strong>Automated decision-making</strong> &mdash; conditional section citing Section 37 with the right to human intervention.</li>
            <li><strong>Complaint route</strong> &mdash; how to contact the NDPC under Section 46(1).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">Use it as a SaaS or self-host</h2>
          <p>
            The generator is a React component; you can either run it inside your own admin / DPO
            portal, or use the headless <code>usePrivacyPolicy</code> hook to build a custom UI on
            top of the policy engine. Either way the output is the same: a typed{' '}
            <code>PrivacyPolicy</code> object that you can render to HTML, Markdown, PDF, or DOCX
            via the <code>exportHTML</code> / <code>exportMarkdown</code> / <code>exportPDF</code>{' '}
            / <code>exportDOCX</code> helpers.
          </p>
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`import { NDPRPrivacyPolicy } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRPrivacyPolicy
  organization={{ name: 'Acme NG', address: 'Lagos, Nigeria', dpoEmail: 'dpo@acme.ng' }}
  features={{ hasChildrenData: true, hasCrossBorderTransfer: true }}
/>;`}</code></pre>

          <h2 className="text-2xl font-bold mt-10 mb-4">Not legal advice</h2>
          <p>
            Every artifact this toolkit produces &mdash; including the privacy policies generated
            here &mdash; ships with a clear &quot;not legal advice&quot; notice. NDPC&apos;s subsidiary
            guidance evolves; your DPO or qualified Nigerian privacy counsel should sign off on the
            final wording before publication. The generator covers the Section 27 list mechanically;
            counsel makes the judgement calls.
          </p>
        </section>

        <section className="border-t border-border pt-10 pb-2 mb-10">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-xl font-bold mb-2">Not sure what to put in the policy?</h2>
            <p className="text-base text-muted-foreground mb-4">
              The free 5-minute audit walks you through every Section 27(1) disclosure — and 7 other
              compliance areas — and tells you exactly what to add.
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
            <li><Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">Privacy Policy Generator — full API reference</Link></li>
            <li><Link href="/ndpr-demos/policy" className="text-primary hover:underline">Generate a policy now (live demo)</Link></li>
            <li><Link href="/docs/guides/lawful-basis" className="text-primary hover:underline">Guide — choosing a lawful basis under Section 25</Link></li>
            <li><Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">Data-subject rights portal (Section 34)</Link></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
