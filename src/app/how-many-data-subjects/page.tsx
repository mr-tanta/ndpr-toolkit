import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { DerivedSubjectsCalculator } from './DerivedSubjectsCalculator';

export const metadata: Metadata = {
  title: 'How Many Data Subjects Do You Really Hold? | NDPA Toolkit',
  description:
    'Count the guarantors, next of kin, referees, dependants and uploaded phone contacts in your systems, and see how they compare with your declared NDPC GAID 2025 DCPMI tier. Runs in your browser; nothing is sent anywhere.',
  alternates: { canonical: '/how-many-data-subjects' },
  openGraph: {
    title: 'How Many Data Subjects Do You Really Hold?',
    description:
      'Third-party data subjects and your DCPMI tier, side by side. Runs in your browser; nothing is sent anywhere.',
    url: 'https://ndprtoolkit.com.ng/how-many-data-subjects',
    siteName: 'NDPA Toolkit',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function HowManyDataSubjectsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Runs in your browser · Nothing is sent or stored
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How many data subjects do you really hold?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Most organisations count customers when they estimate their DCPMI tier. Many also hold data about
            people who never signed up: guarantors, next of kin, referees, dependants, and contacts uploaded
            from users&apos; phones. Each of them is a data subject your privacy notice and request process must
            reach.
          </p>
        </header>

        <DerivedSubjectsCalculator />

        <section className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground space-y-3">
          <p>
            This is an exposure estimate, not a classification. Whether third-party subjects count toward a DCPMI
            threshold is for the NDPC and your counsel to decide. Report direct and third-party counts separately.
          </p>
          <p>
            The same calculation is available in code as <code>estimateDerivedDataSubjects</code> from{' '}
            <code>@tantainnovative/ndpr-toolkit/server</code>, and on the command line as{' '}
            <code>npx ndpr dcpmi</code>. See the{' '}
            <Link href="/docs/guides/dcpmi-registration" className="text-primary hover:underline">
              DCPMI registration guide
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
