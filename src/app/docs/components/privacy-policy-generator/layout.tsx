import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy Generator Docs | NDPA Toolkit',
  description:
    'Generate, preview, and export NDPA 2023-compliant privacy policies with full clause coverage. API reference and customization options included.',
  keywords:
    'NDPA privacy policy generator, Nigeria privacy policy component, NDPC policy compliance, privacy policy API, data protection policy React',
  openGraph: {
    title: 'Privacy Policy Generator Docs | NDPA Toolkit',
    description:
      'Generate, preview, and export NDPA 2023-compliant privacy policies with full clause coverage. API reference and customization options included.',
    url: 'https://ndprtoolkit.com.ng/docs/components/privacy-policy-generator',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Privacy Policy Generator Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy Generator Docs | NDPA Toolkit',
    description:
      'Generate, preview, and export NDPA 2023-compliant privacy policies with full clause coverage. API reference and customization options included.',
    images: ['/og-image.png'],
  },
};

export default function PrivacyPolicyGeneratorDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
