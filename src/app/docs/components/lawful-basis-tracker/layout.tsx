import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawful Basis Tracker Docs | NDPA Toolkit',
  description:
    'Document and audit the lawful basis for every processing activity under NDPA 2023 Section 25. API reference, props, and integration examples.',
  keywords:
    'NDPA lawful basis component, legal basis tracker API, NDPC Section 25, Nigeria processing legal basis, consent vs legitimate interest',
  openGraph: {
    title: 'Lawful Basis Tracker Docs | NDPA Toolkit',
    description:
      'Document and audit the lawful basis for every processing activity under NDPA 2023 Section 25. API reference, props, and integration examples.',
    url: 'https://ndprtoolkit.com.ng/docs/components/lawful-basis-tracker',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Lawful Basis Tracker Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawful Basis Tracker Docs | NDPA Toolkit',
    description:
      'Document and audit the lawful basis for every processing activity under NDPA 2023 Section 25. API reference, props, and integration examples.',
    images: ['/og-image.png'],
  },
};

export default function LawfulBasisTrackerDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
