import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Transfer Docs | NDPA Toolkit',
  description:
    'Validate international data transfers under NDPA 2023 Section 41 with adequacy checks and safeguard APIs. See code examples and integration guide.',
  keywords:
    'NDPA cross-border component, data transfer validation API, NDPC Section 41, Nigeria international transfer, adequacy decision toolkit',
  openGraph: {
    title: 'Cross-Border Transfer Docs | NDPA Toolkit',
    description:
      'Validate international data transfers under NDPA 2023 Section 41 with adequacy checks and safeguard APIs. See code examples and integration guide.',
    url: 'https://ndprtoolkit.com.ng/docs/components/cross-border-transfers',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Cross-Border Transfers Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Border Transfer Docs | NDPA Toolkit',
    description:
      'Validate international data transfers under NDPA 2023 Section 41 with adequacy checks and safeguard APIs. See code examples and integration guide.',
    images: ['/screenshots/hero.png'],
  },
};

export default function CrossBorderTransfersDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
