import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nigeria NDPA Components — React API Reference',
  description:
    'API reference for every NDPR Toolkit React component: cookie consent banner, DSR portal, DPIA questionnaire, 72-hour breach notification, RoPA, lawful-basis tracker, privacy-policy generator. NDPA 2023 compliant.',
  keywords:
    'Nigeria NDPA components, NDPA React API, Nigeria cookie consent component, Nigeria DSR React, Nigeria DPIA React, Nigeria breach notification component, NDPC compliance components',
  alternates: { canonical: '/docs/components' },
  openGraph: {
    title: 'Nigeria NDPA Components — React API Reference',
    description:
      'Every NDPR Toolkit component: cookie consent, DSR portal, DPIA, 72-hour breach notification, RoPA, privacy-policy generator. Built for Nigeria NDPA 2023.',
    url: 'https://ndprtoolkit.com.ng/docs/components',
    siteName: 'NDPR Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPR Toolkit — Nigeria NDPA Components Reference',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria NDPA Components — React API Reference',
    description:
      'Cookie consent, DSR portal, DPIA, breach notification, RoPA, and privacy-policy generator components for Nigeria NDPA 2023.',
    images: ['/screenshots/hero.png'],
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
