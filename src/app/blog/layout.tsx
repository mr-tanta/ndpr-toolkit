import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | NDPA Toolkit',
  description:
    'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling. Stay current on data protection in Nigeria.',
  keywords:
    'NDPA blog, Nigeria Data Protection news, NDPC updates, data protection compliance articles, NDPA 2023 insights',
  openGraph: {
    title: 'Blog | NDPA Toolkit',
    description:
      'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling. Stay current on data protection in Nigeria.',
    url: 'https://ndprtoolkit.com.ng/blog',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | NDPA Toolkit',
    description:
      'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling. Stay current on data protection in Nigeria.',
    images: ['/og-image.png'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}
