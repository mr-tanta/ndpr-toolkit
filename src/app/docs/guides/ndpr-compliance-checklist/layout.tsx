import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NDPA Compliance Checklist | NDPA Toolkit',
  description:
    'Comprehensive NDPA 2023 compliance checklist for Nigerian organizations. Verify your data protection obligations and meet NDPC requirements step by step.',
  keywords:
    'NDPA compliance checklist, Nigeria Data Protection checklist, NDPC requirements, NDPA 2023 obligations, data protection audit Nigeria',
  openGraph: {
    title: 'NDPA Compliance Checklist | NDPA Toolkit',
    description:
      'Comprehensive NDPA 2023 compliance checklist for Nigerian organizations. Verify your data protection obligations and meet NDPC requirements step by step.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/ndpr-compliance-checklist',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA 2023 Compliance Checklist - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDPA Compliance Checklist | NDPA Toolkit',
    description:
      'Comprehensive NDPA 2023 compliance checklist for Nigerian organizations. Verify your data protection obligations and meet NDPC requirements step by step.',
    images: ['/og-image.png'],
  },
};

export default function NDPRComplianceChecklistGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
