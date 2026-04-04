import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPIA Assessment Demo | NDPA Toolkit',
  description:
    'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
  keywords:
    'DPIA Nigeria, Data Protection Impact Assessment, NDPA Section 28, NDPC risk assessment, privacy impact assessment Nigeria',
  openGraph: {
    title: 'DPIA Assessment Demo | NDPA Toolkit',
    description:
      'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/dpia',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA DPIA Assessment Demo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DPIA Assessment Demo | NDPA Toolkit',
    description:
      'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
    images: ['/og-image.png'],
  },
};

export default function DPIADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
