import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consent Management Demo | NDPA Toolkit',
  description:
    'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
  keywords:
    'NDPA consent management, Nigeria Data Protection consent, NDPC Section 25, consent banner, cookie consent Nigeria',
  openGraph: {
    title: 'Consent Management Demo | NDPA Toolkit',
    description:
      'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/consent',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Consent Management Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consent Management Demo | NDPA Toolkit',
    description:
      'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
    images: ['/og-image.png'],
  },
};

export default function ConsentDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
