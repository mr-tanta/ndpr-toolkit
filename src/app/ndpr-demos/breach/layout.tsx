import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breach Notification Demo | NDPA Toolkit',
  description:
    'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
  keywords:
    'NDPA breach notification, 72-hour NDPC reporting, data breach Nigeria, NDPA Section 40, breach management toolkit',
  alternates: { canonical: '/ndpr-demos/breach' },
  openGraph: {
    title: 'Breach Notification Demo | NDPA Toolkit',
    description:
      'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/breach',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Breach Notification Demo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breach Notification Demo | NDPA Toolkit',
    description:
      'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
    images: ['/screenshots/hero.png'],
  },
};

export default function BreachDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
