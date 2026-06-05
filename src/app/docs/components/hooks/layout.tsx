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
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Toolkit React Hooks Reference',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'React Hooks Reference | NDPA Toolkit',
    description:
      'Custom React hooks for NDPA 2023 compliance: useConsent, useDSR, useBreach, and more. Simplify state management in Nigeria Data Protection apps.',
    images: ['/screenshots/hero.png'],
  },
};

export default function HooksDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
