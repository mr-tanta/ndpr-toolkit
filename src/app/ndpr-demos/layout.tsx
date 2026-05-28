import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Live Nigeria NDPA 2023 Compliance Demos — Try in Browser',
  description:
    'Eight interactive demos for Nigeria NDPA 2023 compliance — cookie consent, DSR portal, DPIA questionnaire, 72-hour breach notification, RoPA, lawful-basis tracker, cross-border transfers, and privacy-policy generator. No install required.',
  keywords:
    'Nigeria NDPA demo, Nigeria cookie consent demo, Nigeria DSR demo, Nigeria DPIA tool, Nigeria breach notification demo, NDPC compliance demo, NDPA 2023 React demo',
  alternates: { canonical: '/ndpr-demos' },
  openGraph: {
    title: 'Live Nigeria NDPA 2023 Compliance Demos — Try in Browser',
    description:
      'Try Nigeria NDPA 2023 compliance components in your browser — consent, DSR, DPIA, breach, RoPA, privacy policy. Zero setup.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPR Toolkit — Live Nigeria NDPA 2023 Demos',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Nigeria NDPA Demos — Try in Browser',
    description:
      'Eight zero-setup demos for Nigeria NDPA 2023 compliance: consent, DSR, DPIA, breach, RoPA, privacy policy.',
    images: ['/screenshots/hero.png'],
  },
};

export default function NDPRDemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </>
  );
}
