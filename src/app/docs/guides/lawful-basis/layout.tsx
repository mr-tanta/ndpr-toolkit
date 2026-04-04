import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawful Basis Guide | NDPA Toolkit',
  description:
    'Understand and document the lawful basis for processing personal data under NDPA 2023 Section 25. Consent, contract, legal obligation, and more explained.',
  keywords:
    'NDPA lawful basis guide, Nigeria legal basis processing, NDPC Section 25, consent vs legitimate interest, lawful processing Nigeria',
  openGraph: {
    title: 'Lawful Basis Guide | NDPA Toolkit',
    description:
      'Understand and document the lawful basis for processing personal data under NDPA 2023 Section 25. Consent, contract, legal obligation, and more explained.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/lawful-basis',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lawful Basis for Processing Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawful Basis Guide | NDPA Toolkit',
    description:
      'Understand and document the lawful basis for processing personal data under NDPA 2023 Section 25. Consent, contract, legal obligation, and more explained.',
    images: ['/og-image.png'],
  },
};

export default function LawfulBasisGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
