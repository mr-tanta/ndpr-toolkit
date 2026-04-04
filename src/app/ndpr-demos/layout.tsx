import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive NDPA Demos | NDPA Toolkit',
  description:
    'Explore 8 interactive demos for NDPA 2023 compliance: consent management, DSR, DPIA, breach notification, and more. Try the NDPA Toolkit free.',
  keywords:
    'NDPA demos, Nigeria Data Protection, NDPC compliance, NDPA 2023, interactive compliance tools',
  openGraph: {
    title: 'Interactive NDPA Demos | NDPA Toolkit',
    description:
      'Explore 8 interactive demos for NDPA 2023 compliance: consent management, DSR, DPIA, breach notification, and more. Try the NDPA Toolkit free.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit Interactive Demos',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive NDPA Demos | NDPA Toolkit',
    description:
      'Explore 8 interactive demos for NDPA 2023 compliance: consent management, DSR, DPIA, breach notification, and more. Try the NDPA Toolkit free.',
    images: ['/og-image.png'],
  },
};

export default function NDPRDemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
