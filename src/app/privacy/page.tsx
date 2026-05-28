import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const LAST_UPDATED = '28 May 2026';
const PRIVACY_EMAIL = 'privacy@tantainnovative.com';

export const metadata: Metadata = {
  title: 'Privacy Policy — NDPA Toolkit',
  description:
    'How ndprtoolkit.com.ng collects, uses, and protects personal data under the Nigeria Data Protection Act (NDPA) 2023. Covers the NDPA audit form, analytics, your data-subject rights, and how to contact us.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — NDPA Toolkit',
    description:
      'How ndprtoolkit.com.ng handles personal data under the Nigeria Data Protection Act (NDPA) 2023.',
    url: 'https://ndprtoolkit.com.ng/privacy',
    siteName: 'NDPA Toolkit',
    images: [{ url: '/screenshots/hero.png', width: 1280, height: 800, alt: 'NDPA Toolkit' }],
    locale: 'en_NG',
    type: 'website',
  },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {LAST_UPDATED}. This policy explains how we handle personal data on this
            website under the Nigeria Data Protection Act (NDPA) 2023.
          </p>
        </header>

        <Section id="scope" title="1. Scope">
          <p>
            This policy covers the website <strong>ndprtoolkit.com.ng</strong> (the &ldquo;Site&rdquo;),
            operated by <strong>Tanta Innovatives</strong> as data controller. It does{' '}
            <strong>not</strong> cover the open-source <code>@tantainnovative/ndpr-toolkit</code>{' '}
            library itself: that code runs entirely inside your own application and sends no data to us.
            When you build with the toolkit, <em>you</em> are the data controller for your users&rsquo; data.
          </p>
        </Section>

        <Section id="what-we-collect" title="2. What we collect and why">
          <p>We only collect personal data in two situations:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>NDPA audit requests.</strong> When you use the audit tool and ask us to email your
              report, we collect your <strong>name</strong>, <strong>email address</strong>,
              <strong> organisation name</strong> (optional), and the <strong>self-assessment answers
              and score</strong> you submit. We use these to deliver your report and respond to your
              request.
            </li>
            <li>
              <strong>Usage analytics.</strong> We use PostHog to collect anonymised/pseudonymised usage
              data (pages viewed, interactions, approximate location, device/browser) to understand how
              the Site is used and improve it. This relies on cookies and similar local storage.
            </li>
          </ul>
          <p>
            The compliance audit itself is computed in your browser; your individual answers are sent to
            us only if you choose to email yourself the report.
          </p>
        </Section>

        <Section id="lawful-basis" title="3. Lawful basis (NDPA §25)">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Audit requests</strong> — your <em>consent</em>, given when you submit the form, and
              our <em>legitimate interest</em> in responding to and improving the service.
            </li>
            <li>
              <strong>Analytics</strong> — our <em>legitimate interest</em> in measuring and improving the
              Site, balanced against your rights; where consent is required for cookies, we rely on it.
            </li>
          </ul>
        </Section>

        <Section id="processors" title="4. Who we share it with">
          <p>
            We do not sell your personal data. We share it only with the service providers (data
            processors) needed to run the Site:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Web3Forms</strong> — receives audit-form submissions and delivers them to us by email.
            </li>
            <li>
              <strong>PostHog</strong> — product analytics.
            </li>
            <li>
              <strong>Our hosting/CDN provider</strong> — serves the Site and processes standard server logs.
            </li>
          </ul>
        </Section>

        <Section id="cross-border" title="5. Cross-border transfers (NDPA Part VI)">
          <p>
            Some of our processors (e.g. PostHog and Web3Forms) operate outside Nigeria, including in the
            United States. Where personal data is transferred abroad, we rely on the transfer conditions
            permitted under the NDPA &mdash; such as the processor&rsquo;s own data-protection commitments and
            contractual safeguards &mdash; and limit transfers to what is necessary to run the Site.
          </p>
        </Section>

        <Section id="retention" title="6. How long we keep it">
          <p>
            We keep audit-request details only for as long as needed to respond to you and for reasonable
            follow-up, then delete them. Analytics data is retained in line with our analytics
            provider&rsquo;s defaults and used in aggregate.
          </p>
        </Section>

        <Section id="your-rights" title="7. Your rights (NDPA §§34–38)">
          <p>As a data subject under the NDPA 2023, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>access the personal data we hold about you;</li>
            <li>request rectification of inaccurate data;</li>
            <li>request erasure of your data;</li>
            <li>restrict or object to our processing;</li>
            <li>request portability of data you provided; and</li>
            <li>withdraw consent at any time (without affecting prior processing).</li>
          </ul>
          <p>
            To exercise any of these, email{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-foreground underline">
              {PRIVACY_EMAIL}
            </a>
            . We will respond within the timeframe required by the NDPA.
          </p>
        </Section>

        <Section id="cookies" title="8. Cookies & analytics">
          <p>
            We use cookies and local storage only for analytics (via PostHog). You can block or delete
            cookies in your browser settings, and use your browser&rsquo;s &ldquo;Do Not Track&rdquo; or
            tracker-blocking features; the Site remains fully usable without analytics cookies.
          </p>
        </Section>

        <Section id="security" title="9. Security">
          <p>
            We apply reasonable technical and organisational measures to protect personal data. No method
            of transmission or storage is perfectly secure, but we work to limit the data we hold and who
            can access it.
          </p>
        </Section>

        <Section id="complaints" title="10. Complaints (NDPA §46)">
          <p>
            If you believe we have mishandled your data, please contact us first so we can put it right.
            You also have the right to lodge a complaint with the Nigeria Data Protection Commission
            (NDPC) at{' '}
            <a href="https://ndpc.gov.ng" className="text-foreground underline" target="_blank" rel="noreferrer">
              ndpc.gov.ng
            </a>
            .
          </p>
        </Section>

        <Section id="contact" title="11. Contact">
          <p>
            Questions about this policy or your data? Email{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-foreground underline">
              {PRIVACY_EMAIL}
            </a>
            , or open an issue on{' '}
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit/issues"
              className="text-foreground underline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </Section>

        <Section id="changes" title="12. Changes to this policy">
          <p>
            We may update this policy as the Site evolves. Material changes will be reflected here with a
            new &ldquo;last updated&rdquo; date.
          </p>
        </Section>

        <p className="text-sm text-muted-foreground border-t border-border pt-6">
          See also our{' '}
          <Link href="/docs" className="text-foreground underline">
            documentation
          </Link>{' '}
          and the{' '}
          <a href="https://ndpc.gov.ng" className="text-foreground underline" target="_blank" rel="noreferrer">
            NDPA 2023 text
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
