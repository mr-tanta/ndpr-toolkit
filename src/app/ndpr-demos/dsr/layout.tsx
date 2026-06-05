import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Subject Rights Demo | NDPA Toolkit',
  description:
    'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
  keywords:
    'NDPA data subject rights, DSR Nigeria, NDPC rights requests, right to erasure Nigeria, data access request NDPA',
  alternates: { canonical: '/ndpr-demos/dsr' },
  openGraph: {
    title: 'Data Subject Rights Demo | NDPA Toolkit',
    description:
      'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/dsr',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Data Subject Rights Demo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Subject Rights Demo | NDPA Toolkit',
    description:
      'Demo all 8 NDPA data subject rights: access, rectification, erasure, and more. Manage DSR requests with NDPC-compliant workflows. Try it free.',
    images: ['/screenshots/hero.png'],
  },
};

export default function DSRDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
