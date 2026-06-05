import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consent Management Demo | NDPA Toolkit',
  description:
    'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
  keywords:
    'NDPA consent management, Nigeria Data Protection consent, NDPC Section 25, consent banner, cookie consent Nigeria',
  alternates: { canonical: '/ndpr-demos/consent' },
  openGraph: {
    title: 'Consent Management Demo | NDPA Toolkit',
    description:
      'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/consent',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Consent Management Demo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consent Management Demo | NDPA Toolkit',
    description:
      'Try NDPA Section 25-26 consent banners, preference management, and audit-ready storage. Build compliant consent flows for Nigeria Data Protection.',
    images: ['/screenshots/hero.png'],
  },
};

export default function ConsentDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
