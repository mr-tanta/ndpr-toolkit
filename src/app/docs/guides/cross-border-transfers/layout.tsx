import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Transfers Guide | NDPA Toolkit',
  description:
    'Guide to managing cross-border data transfers under NDPA 2023 Section 41-45. Adequacy checks, safeguards, and NDPC approval workflows explained.',
  keywords:
    'NDPA cross-border transfer guide, Nigeria data transfer compliance, NDPC Section 41, international data flow guide, data adequacy assessment',
  openGraph: {
    title: 'Cross-Border Transfers Guide | NDPA Toolkit',
    description:
      'Guide to managing cross-border data transfers under NDPA 2023 Section 41-45. Adequacy checks, safeguards, and NDPC approval workflows explained.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/cross-border-transfers',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cross-Border Transfers Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Border Transfers Guide | NDPA Toolkit',
    description:
      'Guide to managing cross-border data transfers under NDPA 2023 Section 41-45. Adequacy checks, safeguards, and NDPC approval workflows explained.',
    images: ['/og-image.png'],
  },
};

export default function CrossBorderTransfersGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
