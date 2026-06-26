import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nigeria NDPA 2023 Documentation — React & Next.js',
  description:
    'Documentation for the NDPA Toolkit: a React/TypeScript library for Nigeria Data Protection Act (NDPA) 2023 compliance. Component API, integration guides, and NDPC best practices for Nigerian fintech, insurtech, and SaaS.',
  keywords:
    'Nigeria NDPA documentation, Nigeria Data Protection Act 2023 React, NDPR documentation, NDPC compliance guide, Nigeria privacy policy React, Nigeria cookie consent docs, Nigeria DPIA implementation',
  alternates: { canonical: '/docs' },
  openGraph: {
    title: 'Nigeria NDPA 2023 Documentation — NDPA Toolkit',
    description:
      'React & TypeScript docs for Nigeria NDPA 2023 compliance: consent, DSR, DPIA, breach notification, RoPA, and privacy-policy generator. Built for Nigerian apps.',
    url: 'https://ndprtoolkit.com.ng/docs',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-docs.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit — Nigeria NDPA Documentation',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria NDPA 2023 Documentation — NDPA Toolkit',
    description:
      'React/TypeScript docs for Nigeria NDPA 2023 compliance: consent, DSR, DPIA, breach, RoPA, privacy policy.',
    images: ['/og-docs.png'],
  },
};

export default metadata;
