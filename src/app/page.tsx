import { HomePageClient } from './HomePageClient';

export const metadata = {
  title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
  description:
    'Build NDPA 2023-compliant apps with our open-source toolkit. Consent management, DSR, DPIA, breach notification, and NDPC reporting for Nigerian developers.',
  keywords:
    'NDPA, NDPA 2023, Nigeria Data Protection Act, NDPC, compliance toolkit, React, Next.js, open source, data protection Nigeria',
  openGraph: {
    title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
    description:
      'Build NDPA 2023-compliant apps with our open-source toolkit. Consent management, DSR, DPIA, breach notification, and NDPC reporting for Nigerian developers.',
    url: 'https://ndprtoolkit.com.ng',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit - Nigeria Data Protection Compliance',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
    description:
      'Build NDPA 2023-compliant apps with our open-source toolkit. Consent management, DSR, DPIA, breach notification, and NDPC reporting for Nigerian developers.',
    images: ['/og-image.png'],
  },
};

// JSON-LD structured data (static, hardcoded — safe for dangerouslySetInnerHTML)
const jsonLdString = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPA Toolkit',
  description:
    'Enterprise-grade React components for Nigeria Data Protection Act (NDPA) 2023 compliance',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: 'https://ndprtoolkit.com.ng',
  author: {
    '@type': 'Person',
    name: 'Abraham Esandayinze Tanta',
    url: 'https://linkedin.com/in/mr-tanta',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
  },
  license: 'https://opensource.org/licenses/MIT',
  programmingLanguage: 'TypeScript',
});

export default function HomePage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger -- JSON-LD is static, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <HomePageClient />
    </>
  );
}
