import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Managing Consent Guide | NDPA Toolkit',
  description:
    'Implement a complete consent management system compliant with NDPA 2023. Learn consent collection, withdrawal, and audit trail best practices.',
  keywords:
    'NDPA consent guide, Nigeria consent management, NDPC consent compliance, consent withdrawal process, consent audit trail',
  openGraph: {
    title: 'Managing Consent Guide | NDPA Toolkit',
    description:
      'Implement a complete consent management system compliant with NDPA 2023. Learn consent collection, withdrawal, and audit trail best practices.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/managing-consent',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'Managing Consent Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Managing Consent Guide | NDPA Toolkit',
    description:
      'Implement a complete consent management system compliant with NDPA 2023. Learn consent collection, withdrawal, and audit trail best practices.',
    images: ['/screenshots/hero.png'],
  },
};

export default function ManagingConsentGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
