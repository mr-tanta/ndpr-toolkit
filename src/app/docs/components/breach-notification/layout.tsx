import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breach Notification Docs | NDPA Toolkit',
  description:
    'Implement NDPA 2023-compliant breach notification with severity scoring, 72-hour NDPC reporting, and incident management. View API docs and examples.',
  keywords:
    'NDPA breach notification component, data breach API, NDPC reporting toolkit, 72-hour notification Nigeria, breach severity assessment',
  openGraph: {
    title: 'Breach Notification Docs | NDPA Toolkit',
    description:
      'Implement NDPA 2023-compliant breach notification with severity scoring, 72-hour NDPC reporting, and incident management. View API docs and examples.',
    url: 'https://ndprtoolkit.com.ng/docs/components/breach-notification',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Breach Notification Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breach Notification Docs | NDPA Toolkit',
    description:
      'Implement NDPA 2023-compliant breach notification with severity scoring, 72-hour NDPC reporting, and incident management. View API docs and examples.',
    images: ['/og-image.png'],
  },
};

export default function BreachNotificationDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
