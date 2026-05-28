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
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
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
    images: ['/screenshots/hero.png'],
  },
};

export default function StylingCustomizationGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
