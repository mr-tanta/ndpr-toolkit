import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Styling & Customization Guide | NDPA Toolkit',
  description:
    'Learn how to customize component styles using classNames overrides, unstyled mode, and CSS framework integration. Works with Tailwind, Bootstrap, CSS Modules, and vanilla CSS.',
  keywords:
    'NDPA Toolkit styling, classNames overrides, unstyled components, CSS customization, Bootstrap integration, CSS Modules, Tailwind CSS',
  openGraph: {
    title: 'Styling & Customization Guide | NDPA Toolkit',
    description:
      'Learn how to customize component styles using classNames overrides, unstyled mode, and CSS framework integration. Works with Tailwind, Bootstrap, CSS Modules, and vanilla CSS.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/styling-customization',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Styling & Customization Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Styling & Customization Guide | NDPA Toolkit',
    description:
      'Learn how to customize component styles using classNames overrides, unstyled mode, and CSS framework integration. Works with Tailwind, Bootstrap, CSS Modules, and vanilla CSS.',
    images: ['/og-image.png'],
  },
};

export default function StylingCustomizationGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
