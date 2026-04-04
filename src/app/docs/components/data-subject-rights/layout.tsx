import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Subject Rights Docs | NDPA Toolkit',
  description:
    'Build an NDPA 2023-compliant DSR portal with request forms, dashboards, and tracking. Handle access, rectification, and erasure requests programmatically.',
  keywords:
    'NDPA data subject rights component, DSR portal API, Nigeria data rights, NDPC rights management, data access request toolkit',
  openGraph: {
    title: 'Data Subject Rights Docs | NDPA Toolkit',
    description:
      'Build an NDPA 2023-compliant DSR portal with request forms, dashboards, and tracking. Handle access, rectification, and erasure requests programmatically.',
    url: 'https://ndprtoolkit.com.ng/docs/components/data-subject-rights',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Data Subject Rights Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Subject Rights Docs | NDPA Toolkit',
    description:
      'Build an NDPA 2023-compliant DSR portal with request forms, dashboards, and tracking. Handle access, rectification, and erasure requests programmatically.',
    images: ['/og-image.png'],
  },
};

export default function DataSubjectRightsDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
