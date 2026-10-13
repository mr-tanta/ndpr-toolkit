import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { GrievanceWizard } from './GrievanceWizard';

export const metadata: Metadata = {
  title: 'Report Am: Write a Data Complaint to a Company | NDPA Toolkit',
  description:
    'Harassed by a loan app, or messaged about someone else’s loan? Write a notice to the company under the Nigeria Data Protection Act, ready to send by email, WhatsApp or SMS. Runs on your device; nothing is sent or stored by this site.',
  alternates: { canonical: '/report-am' },
  openGraph: {
    title: 'Report Am: Write a Data Complaint to a Company',
    description: 'A notice under the NDPA, ready for email, WhatsApp or SMS. Runs on your device.',
    url: 'https://ndprtoolkit.com.ng/report-am',
    siteName: 'NDPA Toolkit',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function ReportAmPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Runs on your device · Nothing is sent or stored by this site
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Report Am</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            If a company or app is misusing your personal data, you can serve them a notice under the Nigeria
            Data Protection Act. This page writes it for you, with your requests attached, ready to send by
            email, WhatsApp or SMS. You send it yourself, and you keep the proof.
          </p>
        </header>
        <GrievanceWizard />
        <section className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground space-y-3">
          <p>
            You do not need to give your NIN, BVN or bank details. A phone number or email the company can reply to
            is enough.
          </p>
          <p>
            This tool helps you write a notice. It is not legal advice and it does not file anything with the Nigeria
            Data Protection Commission.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
