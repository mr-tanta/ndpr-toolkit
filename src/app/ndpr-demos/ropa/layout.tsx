import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROPA Manager Demo | NDPA Toolkit',
  description:
    'Maintain a Record of Processing Activities per NDPA 2023 Section 29. Categorize, filter, and export your ROPA for NDPC audits.',
  keywords:
    'ROPA Nigeria, Record of Processing Activities, NDPA Section 29, NDPC audit, data processing register Nigeria',
  openGraph: {
    title: 'ROPA Manager Demo | NDPA Toolkit',
    description:
      'Maintain a Record of Processing Activities per NDPA 2023 Section 29. Categorize, filter, and export your ROPA for NDPC audits.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/ropa',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA ROPA Manager Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ROPA Manager Demo | NDPA Toolkit',
    description:
      'Maintain a Record of Processing Activities per NDPA 2023 Section 29. Categorize, filter, and export your ROPA for NDPC audits.',
    images: ['/og-image.png'],
  },
};

export default function ROPADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
