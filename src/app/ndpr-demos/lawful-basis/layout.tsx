import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawful Basis Tracker Demo | NDPA Toolkit',
  description:
    'Track and document the lawful basis for every processing activity under NDPA 2023 Section 25. Maintain full audit trails for NDPC compliance.',
  keywords:
    'NDPA lawful basis, Nigeria data processing legal basis, NDPC Section 25, consent tracking, legitimate interest Nigeria',
  openGraph: {
    title: 'Lawful Basis Tracker Demo | NDPA Toolkit',
    description:
      'Track and document the lawful basis for every processing activity under NDPA 2023 Section 25. Maintain full audit trails for NDPC compliance.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/lawful-basis',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Lawful Basis Tracker Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawful Basis Tracker Demo | NDPA Toolkit',
    description:
      'Track and document the lawful basis for every processing activity under NDPA 2023 Section 25. Maintain full audit trails for NDPC compliance.',
    images: ['/og-image.png'],
  },
};

export default function LawfulBasisDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
