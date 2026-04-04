import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy Generator Demo | NDPA Toolkit',
  description:
    'Generate NDPA 2023-compliant privacy policies for Nigerian websites and apps. Preview, customize, and export policies that meet NDPC requirements.',
  keywords:
    'NDPA privacy policy, Nigeria privacy policy generator, NDPC compliant policy, NDPA Section 24, data protection policy Nigeria',
  openGraph: {
    title: 'Privacy Policy Generator Demo | NDPA Toolkit',
    description:
      'Generate NDPA 2023-compliant privacy policies for Nigerian websites and apps. Preview, customize, and export policies that meet NDPC requirements.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/policy',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Privacy Policy Generator Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy Generator Demo | NDPA Toolkit',
    description:
      'Generate NDPA 2023-compliant privacy policies for Nigerian websites and apps. Preview, customize, and export policies that meet NDPC requirements.',
    images: ['/og-image.png'],
  },
};

export default function PolicyDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
