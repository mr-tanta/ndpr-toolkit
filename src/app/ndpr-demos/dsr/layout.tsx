import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Subject Rights Demo | NDPA Toolkit',
  description:
    'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
  keywords:
    'NDPA data subject rights, DSR Nigeria, NDPC rights requests, right to erasure Nigeria, data access request NDPA',
  openGraph: {
    title: 'Data Subject Rights Demo | NDPA Toolkit',
    description:
      'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/dsr',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Data Subject Rights Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Subject Rights Demo | NDPA Toolkit',
    description:
      'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
    images: ['/og-image.png'],
  },
};

export default function DSRDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
