import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consent Management Docs | NDPA Toolkit',
  description:
    'Integrate NDPA 2023-compliant consent collection, storage, and preference management into your app. Full API reference with code examples.',
  keywords:
    'NDPA consent component, consent management API, Nigeria consent banner, NDPC consent compliance, consent preference React',
  openGraph: {
    title: 'Consent Management Docs | NDPA Toolkit',
    description:
      'Integrate NDPA 2023-compliant consent collection, storage, and preference management into your app. Full API reference with code examples.',
    url: 'https://ndprtoolkit.com.ng/docs/components/consent-management',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Consent Management Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consent Management Docs | NDPA Toolkit',
    description:
      'Integrate NDPA 2023-compliant consent collection, storage, and preference management into your app. Full API reference with code examples.',
    images: ['/og-image.png'],
  },
};

export default function ConsentManagementDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
