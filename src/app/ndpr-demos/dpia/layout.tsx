import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPIA Assessment Demo | NDPA Toolkit',
  description:
    'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
  keywords:
    'DPIA Nigeria, Data Protection Impact Assessment, NDPA Section 28, NDPC risk assessment, privacy impact assessment Nigeria',
  alternates: { canonical: '/ndpr-demos/dpia' },
  openGraph: {
    title: 'DPIA Assessment Demo | NDPA Toolkit',
    description:
      'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
    url: 'https://ndprtoolkit.com.ng/ndpr-demos/dpia',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA DPIA Assessment Demo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DPIA Assessment Demo | NDPA Toolkit',
    description:
      'Run a Data Protection Impact Assessment with NDPA 2023 risk scoring, templates, and NDPC guidance. Start your DPIA in minutes.',
    images: ['/screenshots/hero.png'],
  },
};

export default function DPIADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
