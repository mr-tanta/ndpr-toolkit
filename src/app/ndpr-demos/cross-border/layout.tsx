import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Transfer Demo | NDPA Toolkit',
  description:
    'Assess international data transfers with NDPA 2023 Part VIII (Sections 41-43) adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
  keywords:
    'NDPA cross-border transfer, Nigeria data transfer, NDPC Section 41, international data flow, data adequacy Nigeria',
  openGraph: {
    title: 'Cross-Border Transfer Demo | NDPA Toolkit',
    description:
      'Assess international data transfers with NDPA 2023 Part VIII (Sections 41-43) adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/cross-border',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
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
      'Assess international data transfers with NDPA 2023 Part VIII (Sections 41-43) adequacy checks and safeguard recommendations. Ensure NDPC-compliant cross-border flows.',
    images: ['/screenshots/hero.png'],
  },
};

export default function CrossBorderDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
