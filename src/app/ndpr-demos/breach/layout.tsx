import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breach Notification Demo | NDPA Toolkit',
  description:
    'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
  keywords:
    'NDPA breach notification, 72-hour NDPC reporting, data breach Nigeria, NDPA Section 40, breach management toolkit',
  openGraph: {
    title: 'Breach Notification Demo | NDPA Toolkit',
    description:
      'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/breach',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Breach Notification Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breach Notification Demo | NDPA Toolkit',
    description:
      'Simulate 72-hour NDPC breach notifications with severity assessment and compliance workflows. Meet NDPA 2023 breach reporting deadlines.',
    images: ['/og-image.png'],
  },
};

export default function BreachDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
