'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const moduleLinks = [
  {
    title: 'Consent Management',
    reference: 'NDPA S.25-S.26',
    href: '/docs/components/consent-management',
  },
  {
    title: 'Data Subject Rights',
    reference: 'NDPA Part VI, S.34-S.38',
    href: '/docs/components/data-subject-rights',
  },
  {
    title: 'DPIA Questionnaire',
    reference: 'NDPA S.28',
    href: '/docs/components/dpia-questionnaire',
  },
  {
    title: 'Breach Notification',
    reference: 'NDPA S.40 / GAID 2025 Art. 33',
    href: '/docs/components/breach-notification',
  },
  {
    title: 'Privacy Policy Generator',
    reference: 'NDPA S.27',
    href: '/docs/components/privacy-policy-generator',
  },
  {
    title: 'Lawful Basis Tracker',
    reference: 'NDPA S.25',
    href: '/docs/components/lawful-basis-tracker',
  },
  {
    title: 'Cross-Border Transfers',
    reference: 'NDPA S.41-S.43',
    href: '/docs/components/cross-border-transfers',
  },
  {
    title: 'ROPA',
    reference: 'NDPA S.29',
    href: '/docs/components/ropa',
  },
  {
    title: 'Compliance Audit CLI',
    reference: 'NDPA 2023 / GAID 2025 / registration guidance',
    href: '/docs/guides/audit-cli',
  },
  {
    title: 'DCPMI Registration & CAR',
    reference: 'GAID 2025 / NDPC registration guidance',
    href: '/docs/guides/dcpmi-registration',
  },
];

export default function LegalBasisAndCitationsGuide() {
  return (
    <DocLayout
      title="Legal Basis & Citations"
      description="Citation index for NDPA modules, GAID DCPMI/CAR utilities, and audit CLI boundaries in NDPR Toolkit."
    >
      <section id="purpose" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Purpose</h2>
        <p className="mb-4 text-foreground">
          This page is the citation index for NDPR Toolkit modules and GAID 2025 utilities. Each linked page includes a
          legal source map showing the primary reference, what the toolkit automates, and what still requires controller,
          DPO, DPCO, or legal review.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
          <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Not legal advice</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            NDPR Toolkit provides implementation support for Nigerian data protection workflows. It does not replace
            legal advice, statutory filings, regulator submissions, or current NDPC guidance review.
          </p>
        </div>
      </section>

      <section id="module-citations" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Module citation map</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Toolkit area</th>
                <th className="text-left p-3 border-b border-border">Primary reference</th>
                <th className="text-left p-3 border-b border-border">Citation block</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {moduleLinks.map((module) => (
                <tr key={module.href}>
                  <td className="p-3 border-b border-border font-medium">{module.title}</td>
                  <td className="p-3 border-b border-border">{module.reference}</td>
                  <td className="p-3 border-b border-border">
                    <Link href={module.href} className="text-primary hover:underline">
                      Open docs
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="governance" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Source governance</h2>
        <p className="mb-4 text-foreground">
          The detailed source list, regulatory update cadence, and release policy live in the governance guide.
        </p>
        <Link href="/docs/guides/legal-sources-governance" className="text-primary hover:underline">
          Open Legal Sources & Update Governance
        </Link>
      </section>
    </DocLayout>
  );
}
