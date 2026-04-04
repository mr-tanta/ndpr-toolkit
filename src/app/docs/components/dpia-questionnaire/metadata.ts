import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPIA Questionnaire Docs | NDPA Toolkit',
  description:
    'Implement an NDPA 2023-compliant DPIA questionnaire with risk scoring and NDPC guidance. Full API reference, props, and integration examples included.',
  keywords:
    'DPIA questionnaire component, Data Protection Impact Assessment API, NDPA 2023 risk assessment, NDPC DPIA, privacy impact assessment toolkit',
  openGraph: {
    title: 'DPIA Questionnaire Docs | NDPA Toolkit',
    description:
      'Implement an NDPA 2023-compliant DPIA questionnaire with risk scoring and NDPC guidance. Full API reference, props, and integration examples included.',
    url: 'https://ndprtoolkit.com.ng/docs/components/dpia-questionnaire',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-dpia-docs.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit DPIA Questionnaire Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DPIA Questionnaire Docs | NDPA Toolkit',
    description:
      'Implement an NDPA 2023-compliant DPIA questionnaire with risk scoring and NDPC guidance. Full API reference, props, and integration examples included.',
    images: ['/og-dpia-docs.png'],
  },
};

export default metadata;
