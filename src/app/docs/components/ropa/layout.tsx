import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROPA Component Docs | NDPA Toolkit',
  description:
    'Maintain Records of Processing Activities per NDPA 2023 Section 29. Component API, props reference, and export functionality for NDPC audits.',
  keywords:
    'ROPA component Nigeria, Record of Processing Activities API, NDPA Section 29, NDPC audit records, data processing register toolkit',
  openGraph: {
    title: 'ROPA Component Docs | NDPA Toolkit',
    description:
      'Maintain Records of Processing Activities per NDPA 2023 Section 29. Component API, props reference, and export functionality for NDPC audits.',
    url: 'https://ndprtoolkit.com.ng/docs/components/ropa',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA ROPA Component Documentation',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ROPA Component Docs | NDPA Toolkit',
    description:
      'Maintain Records of Processing Activities per NDPA 2023 Section 29. Component API, props reference, and export functionality for NDPC audits.',
    images: ['/screenshots/hero.png'],
  },
};

export default function ROPADocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
