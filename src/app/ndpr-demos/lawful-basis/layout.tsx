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
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
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
    images: ['/screenshots/hero.png'],
  },
};

export default function LawfulBasisDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
