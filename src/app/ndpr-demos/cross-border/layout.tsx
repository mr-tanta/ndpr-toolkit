import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Transfer Demo | NDPA Toolkit',
  description:
    'Assess international data transfers with NDPA 2023 Section 41-45 adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
  keywords:
    'NDPA cross-border transfer, Nigeria data transfer, NDPC Section 41, international data flow, data adequacy Nigeria',
  openGraph: {
    title: 'Cross-Border Transfer Demo | NDPA Toolkit',
    description:
      'Assess international data transfers with NDPA 2023 Section 41-45 adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/cross-border',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Cross-Border Transfer Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Border Transfer Demo | NDPA Toolkit',
    description:
      'Assess international data transfers with NDPA 2023 Section 41-45 adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
    images: ['/og-image.png'],
  },
};

export default function CrossBorderDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
