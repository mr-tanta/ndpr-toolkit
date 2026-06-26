import { HomePageClient } from './HomePageClient';
import { version as pkgVersion } from '../../package.json';

export const metadata = {
  title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
  description:
    'Build NDPA 2023 and NDPC GAID 2025-compliant apps with our open-source toolkit. Consent management, DSR portal, DPIA, breach notification, compliance score, DCPMI designation checks, Compliance Audit Returns, and a CI-ready audit CLI for Nigerian developers.',
  keywords:
    'NDPA, NDPA 2023, Nigeria Data Protection Act, NDPC, GAID 2025, DCPMI, Compliance Audit Returns, ndpr audit CLI, compliance toolkit, React, Next.js, open source, data protection Nigeria, adapters, presets, compliance score',
  openGraph: {
    title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
    description:
      'Build NDPA 2023 and NDPC GAID 2025-compliant apps with our open-source toolkit. Consent management, DSR portal, DPIA, breach notification, compliance score, DCPMI designation checks, Compliance Audit Returns, and a CI-ready audit CLI for Nigerian developers.',
    url: 'https://ndprtoolkit.com.ng',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1280,
        height: 800,
        alt: 'NDPA Toolkit - Nigeria Data Protection Compliance Infrastructure',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDPA 2023 Compliance Made Easy | NDPA Toolkit',
    description:
      'Build NDPA 2023 and NDPC GAID 2025-compliant apps with our open-source toolkit. Consent management, DSR portal, DPIA, breach notification, compliance score, DCPMI designation checks, Compliance Audit Returns, and a CI-ready audit CLI for Nigerian developers.',
    images: ['/screenshots/hero.png'],
  },
};

// JSON-LD structured data (static + package version — no user input, safe for dangerouslySetInnerHTML)
const jsonLdString = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NDPA Toolkit',
  version: pkgVersion,
  description:
    'Enterprise-grade React compliance infrastructure for Nigeria Data Protection Act (NDPA) 2023. Adapters, presets, compliance score, DSR portal, and fully customisable theming.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: 'https://ndprtoolkit.com.ng',
  author: {
    '@type': 'Person',
    name: 'Abraham Esandayinze Tanta',
    url: 'https://linkedin.com/in/mr-tanta',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
  },
  license: 'https://opensource.org/licenses/MIT',
  programmingLanguage: 'TypeScript',
  featureList: [
    'Consent management',
    'Data Subject Rights (DSR) portal',
    'DPIA questionnaire',
    'Breach notification',
    'Compliance score',
    'Adapters',
    'Presets',
    'Lawful basis tracker',
    'Cross-border transfer safeguards',
    'ROPA management',
    'Privacy policy generator',
    'NDPC reporting',
    'DCPMI designation classifier (GAID 2025)',
    'Compliance Audit Returns scheduler',
    'Breach notification completeness checker',
    'ndpr audit CLI compliance gate',
  ],
  softwareVersion: pkgVersion,
  downloadUrl: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
  sameAs: [
    'https://github.com/mr-tanta/ndpr-toolkit',
    'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
  ],
});

export default function HomePage() {
  return (
    <>
      { }
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <HomePageClient version={pkgVersion} />
    </>
  );
}
