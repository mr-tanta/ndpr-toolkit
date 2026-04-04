import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NDPA Toolkit Documentation | Implementation Guides & API Reference',
  description: 'Comprehensive documentation for implementing NDPA-compliant features in your applications, including guides, API references, and compliance information.',
  keywords: 'NDPA Documentation, Nigeria Data Protection Act, Compliance Guides, API Reference, Implementation Tutorials',
  openGraph: {
    title: 'NDPA Toolkit Documentation | Implementation Guides & API Reference',
    description: 'Comprehensive documentation for implementing NDPA-compliant features in your applications, including guides, API references, and compliance information.',
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
    title: 'NDPA Toolkit Documentation | Implementation Guides & API Reference',
    description: 'Comprehensive documentation for implementing NDPA-compliant features in your applications, including guides, API references, and compliance information.',
    images: ['/og-docs.png'],
  },
};

export default metadata;
