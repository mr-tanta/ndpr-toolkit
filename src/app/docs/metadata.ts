import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | NDPA Toolkit',
  description:
    'Comprehensive NDPA 2023 compliance docs: component API reference, implementation guides, and NDPC best practices. Start building compliant apps now.',
  keywords:
    'NDPA documentation, Nigeria Data Protection docs, NDPC compliance guide, NDPA 2023 API reference, data protection implementation',
  openGraph: {
    title: 'Documentation | NDPA Toolkit',
    description:
      'Comprehensive NDPA 2023 compliance docs: component API reference, implementation guides, and NDPC best practices. Start building compliant apps now.',
    url: 'https://ndprtoolkit.com.ng/docs',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-docs.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | NDPA Toolkit',
    description:
      'Comprehensive NDPA 2023 compliance docs: component API reference, implementation guides, and NDPC best practices. Start building compliant apps now.',
    images: ['/og-docs.png'],
  },
};

export default metadata;
