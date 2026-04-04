import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Subject Requests Guide | NDPA Toolkit',
  description:
    'Best practices for handling data subject rights requests under NDPA 2023. Manage access, rectification, and erasure requests with compliant workflows.',
  keywords:
    'NDPA DSR guide, data subject request handling, Nigeria data rights process, NDPC rights compliance, access request workflow',
  openGraph: {
    title: 'Data Subject Requests Guide | NDPA Toolkit',
    description:
      'Best practices for handling data subject rights requests under NDPA 2023. Manage access, rectification, and erasure requests with compliant workflows.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/data-subject-requests',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Data Subject Requests Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Subject Requests Guide | NDPA Toolkit',
    description:
      'Best practices for handling data subject rights requests under NDPA 2023. Manage access, rectification, and erasure requests with compliant workflows.',
    images: ['/og-image.png'],
  },
};

export default function DataSubjectRequestsGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
