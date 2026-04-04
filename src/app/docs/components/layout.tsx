import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Components Reference | NDPA Toolkit',
  description:
    'Browse all NDPA Toolkit components: consent banners, DSR portals, DPIA tools, breach workflows, and more. Build NDPC-compliant apps faster.',
  keywords:
    'NDPA components, Nigeria Data Protection components, NDPC compliance React, NDPA toolkit API, data protection UI components',
  openGraph: {
    title: 'Components Reference | NDPA Toolkit',
    description:
      'Browse all NDPA Toolkit components: consent banners, DSR portals, DPIA tools, breach workflows, and more. Build NDPC-compliant apps faster.',
    url: 'https://ndprtoolkit.com.ng/docs/components',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit Components Reference',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Components Reference | NDPA Toolkit',
    description:
      'Browse all NDPA Toolkit components: consent banners, DSR portals, DPIA tools, breach workflows, and more. Build NDPC-compliant apps faster.',
    images: ['/og-image.png'],
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
