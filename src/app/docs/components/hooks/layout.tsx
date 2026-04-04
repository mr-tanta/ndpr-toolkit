import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'React Hooks Reference | NDPA Toolkit',
  description:
    'Custom React hooks for NDPA 2023 compliance: useConsent, useDSR, useBreach, and more. Simplify state management in Nigeria Data Protection apps.',
  keywords:
    'NDPA React hooks, useConsent hook, Nigeria data protection hooks, NDPC compliance React, data protection custom hooks',
  openGraph: {
    title: 'React Hooks Reference | NDPA Toolkit',
    description:
      'Custom React hooks for NDPA 2023 compliance: useConsent, useDSR, useBreach, and more. Simplify state management in Nigeria Data Protection apps.',
    url: 'https://ndprtoolkit.com.ng/docs/components/hooks',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit React Hooks Reference',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'React Hooks Reference | NDPA Toolkit',
    description:
      'Custom React hooks for NDPA 2023 compliance: useConsent, useDSR, useBreach, and more. Simplify state management in Nigeria Data Protection apps.',
    images: ['/og-image.png'],
  },
};

export default function HooksDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
