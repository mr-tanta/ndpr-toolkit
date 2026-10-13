import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROPA Manager Demo | NDPA Toolkit',
  description:
    'Maintain a Record of Processing Activities per the NDPA 2023 accountability duty (Section 24(3)) and NDPC GAID 2025 Article 13. Categorize, filter, and export your ROPA for NDPC audits.',
  keywords:
    'ROPA Nigeria, Record of Processing Activities, NDPA accountability, GAID 2025 RoPA, NDPC audit, data processing register Nigeria',
  alternates: { canonical: '/ndpr-demos/ropa' },
  openGraph: {
    title: 'ROPA Manager Demo | NDPA Toolkit',
    description:
      'Maintain a Record of Processing Activities per the NDPA 2023 accountability duty (Section 24(3)) and NDPC GAID 2025 Article 13. Categorize, filter, and export your ROPA for NDPC audits.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/ropa',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA ROPA Manager Demo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ROPA Manager Demo | NDPA Toolkit',
    description:
      'Maintain a Record of Processing Activities per the NDPA 2023 accountability duty (Section 24(3)) and NDPC GAID 2025 Article 13. Categorize, filter, and export your ROPA for NDPC audits.',
    images: ['/screenshots/hero.png'],
  },
};

export default function ROPADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
