import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breach Notification Guide | NDPA Toolkit',
  description:
    'Learn the 72-hour NDPC breach notification process under NDPA 2023. Step-by-step guide with severity assessment, templates, and compliance timelines.',
  keywords:
    'NDPA breach notification guide, 72-hour NDPC notification, data breach process Nigeria, breach reporting template, NDPA Section 40',
  openGraph: {
    title: 'Breach Notification Guide | NDPA Toolkit',
    description:
      'Learn the 72-hour NDPC breach notification process under NDPA 2023. Step-by-step guide with severity assessment, templates, and compliance timelines.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/breach-notification-process',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Breach Notification Process Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breach Notification Guide | NDPA Toolkit',
    description:
      'Learn the 72-hour NDPC breach notification process under NDPA 2023. Step-by-step guide with severity assessment, templates, and compliance timelines.',
    images: ['/og-image.png'],
  },
};

export default function BreachNotificationGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
