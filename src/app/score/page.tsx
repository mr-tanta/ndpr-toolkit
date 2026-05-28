import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AuditScore } from './components/AuditScore';

export const metadata: Metadata = {
  title: 'Free Nigeria NDPA Audit — Score Your Compliance in 5 Minutes',
  description:
    'Free self-assessment for Nigeria Data Protection Act (NDPA) 2023 compliance. 8-section audit covering consent, DSR, DPIA, breach notification, RoPA, lawful basis, cross-border, privacy policy. Live score, prioritised recommendations with NDPA section references, downloadable PDF. No signup required to see your score.',
  keywords:
    'Nigeria NDPA audit, free NDPA compliance check, NDPR audit Nigeria, NDPC audit tool, Nigeria data protection self-assessment, Nigeria compliance score, NDPA 2023 audit',
  alternates: { canonical: '/score' },
  openGraph: {
    title: 'Free Nigeria NDPA Audit — Score Your Compliance in 5 Minutes',
    description:
      'Free 8-section self-assessment for Nigeria NDPA 2023. Live score, prioritised recommendations, downloadable PDF report. No signup to see your score.',
    url: 'https://ndprtoolkit.com.ng/score',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'Free Nigeria NDPA Compliance Audit',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Nigeria NDPA Audit — Score in 5 Minutes',
    description:
      'Free 8-section NDPA 2023 self-assessment. Live score, prioritised recommendations, downloadable PDF.',
    images: ['/screenshots/hero.png'],
  },
};

// Static, server-rendered JSON-LD — no user input — safe to inject.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPR Toolkit Compliance Audit',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Compliance / Risk Assessment',
  operatingSystem: 'Web',
  description:
    'Free 8-section self-assessment for Nigeria Data Protection Act (NDPA) 2023 compliance. Covers consent, DSR, DPIA, breach notification, RoPA, lawful basis, cross-border, privacy policy. Generates a 0-100 score with prioritised recommendations.',
  url: 'https://ndprtoolkit.com.ng/score',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  inLanguage: ['en', 'en-NG'],
  isAccessibleForFree: true,
  keywords:
    'Nigeria NDPA audit, free compliance check, NDPC audit, Section 25, Section 26, Section 28, Section 40',
};

export default function ScorePage() {
  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Free · No signup to see your score · ~5 minutes
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nigeria NDPA 2023 Compliance Audit
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Answer the 30-odd questions below to see how your organisation stacks up against the
            gazetted Nigeria Data Protection Act 2023. Your score updates live as you fill in the
            form. Prioritised recommendations include NDPA section references your DPO can verify
            independently.
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-3xl">
            The scoring engine is open source — the same{' '}
            <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">
              <code>getComplianceScore</code>
            </Link>{' '}
            function powers this audit, your CI pipeline, and the bundled{' '}
            <Link href="/docs/components/hooks" className="text-primary hover:underline">
              <code>NDPRComplianceDashboard</code>
            </Link>{' '}
            component. No black box.
          </p>
        </header>

        <AuditScore />

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">After the audit</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/nigeria-privacy-policy-generator"
              className="rounded-lg border border-border p-5 hover:bg-card transition"
            >
              <h3 className="text-base font-semibold mb-2">Fix Section 27 gaps →</h3>
              <p className="text-sm text-muted-foreground">
                Generate a Nigeria-NDPA-aware privacy policy with the policy generator. Free, no signup.
              </p>
            </Link>
            <Link
              href="/nigeria-cookie-consent"
              className="rounded-lg border border-border p-5 hover:bg-card transition"
            >
              <h3 className="text-base font-semibold mb-2">Fix Section 26 gaps →</h3>
              <p className="text-sm text-muted-foreground">
                Drop in the NDPA-compliant consent banner. Withdrawal-as-easy-as-consent built in.
              </p>
            </Link>
            <Link
              href="/ndpa-dpia-tool"
              className="rounded-lg border border-border p-5 hover:bg-card transition"
            >
              <h3 className="text-base font-semibold mb-2">Fix Section 28 gaps →</h3>
              <p className="text-sm text-muted-foreground">
                Run a DPIA through the questionnaire tool. NDPC consultation flag included.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
