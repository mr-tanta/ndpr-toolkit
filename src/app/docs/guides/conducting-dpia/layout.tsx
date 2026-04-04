import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conducting a DPIA Guide | NDPA Toolkit',
  description:
    'Step-by-step guide to conducting a Data Protection Impact Assessment under NDPA 2023. Includes risk scoring, templates, and NDPC submission tips.',
  keywords:
    'DPIA guide Nigeria, Data Protection Impact Assessment, NDPA Section 28, NDPC DPIA requirements, privacy impact assessment how-to',
  openGraph: {
    title: 'Conducting a DPIA Guide | NDPA Toolkit',
    description:
      'Step-by-step guide to conducting a Data Protection Impact Assessment under NDPA 2023. Includes risk scoring, templates, and NDPC submission tips.',
    url: 'https://ndprtoolkit.com.ng/docs/guides/conducting-dpia',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Conducting a DPIA Guide - NDPA Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conducting a DPIA Guide | NDPA Toolkit',
    description:
      'Step-by-step guide to conducting a Data Protection Impact Assessment under NDPA 2023. Includes risk scoring, templates, and NDPC submission tips.',
    images: ['/og-image.png'],
  },
};

export default function ConductingDPIAGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
