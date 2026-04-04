import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Implementation Guides | NDPA Toolkit',
  description:
    'Step-by-step guides for NDPA 2023 compliance: consent management, DPIA, breach notification, DSR handling, and more. Start building compliant apps today.',
  keywords:
    'NDPA implementation guide, Nigeria Data Protection tutorial, NDPC compliance guide, NDPA 2023 how-to, data protection implementation',
  openGraph: {
    title: 'Implementation Guides | NDPA Toolkit',
    description:
      'Step-by-step guides for NDPA 2023 compliance: consent management, DPIA, breach notification, DSR handling, and more. Start building compliant apps today.',
    url: 'https://ndprtoolkit.com.ng/docs/guides',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit Implementation Guides',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Implementation Guides | NDPA Toolkit',
    description:
      'Step-by-step guides for NDPA 2023 compliance: consent management, DPIA, breach notification, DSR handling, and more. Start building compliant apps today.',
    images: ['/og-image.png'],
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
