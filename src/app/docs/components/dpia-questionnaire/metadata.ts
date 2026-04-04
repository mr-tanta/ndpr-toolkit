import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPIA Questionnaire Component | NDPA Toolkit Documentation',
  description: 'Learn how to implement an NDPA-compliant Data Protection Impact Assessment (DPIA) questionnaire in your applications using the NDPA Toolkit.',
  keywords: 'DPIA, Data Protection Impact Assessment, NDPA Compliance, NDPA 2023, Risk Assessment, Privacy Impact',
  openGraph: {
    title: 'DPIA Questionnaire Component | NDPA Toolkit Documentation',
    description: 'Learn how to implement an NDPA-compliant Data Protection Impact Assessment (DPIA) questionnaire in your applications using the NDPA Toolkit.',
    url: 'https://ndprtoolkit.com.ng/docs/components/dpia-questionnaire',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-dpia-docs.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit DPIA Component Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DPIA Questionnaire Component | NDPA Toolkit Documentation',
    description: 'Learn how to implement an NDPA-compliant Data Protection Impact Assessment (DPIA) questionnaire in your applications using the NDPA Toolkit.',
    images: ['/og-dpia-docs.png'],
  },
};

export default metadata;
