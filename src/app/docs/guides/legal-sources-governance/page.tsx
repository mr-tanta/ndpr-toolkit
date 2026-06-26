'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const officialSources = [
  {
    title: 'Nigeria Data Protection Act, 2023',
    publisher: 'Nigeria Data Protection Commission',
    href: 'https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf',
    use: 'Primary statutory source for controller and processor duties, data subject rights, DPIA, breach notification, ROPA, and cross-border transfer requirements.',
  },
  {
    title: 'NDP Act General Application and Implementation Directive, 2025',
    publisher: 'Nigeria Data Protection Commission',
    href: 'https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf',
    use: 'Operational source for DCPMI classification, Compliance Audit Returns, breach notification detail, and implementation expectations.',
  },
  {
    title: 'Guidance Notice on Registration of Data Controllers and Processors of Major Importance',
    publisher: 'Nigeria Data Protection Commission',
    href: 'https://ndpc.gov.ng/wp-content/uploads/2025/07/Updated-Guidance-Notice-on-Registtration-2024.pdf',
    use: 'Supplemental registration source used when reviewing DCPMI thresholds, classes, and filing assumptions.',
  },
  {
    title: 'NDPC Resources',
    publisher: 'Nigeria Data Protection Commission',
    href: 'https://ndpc.gov.ng/resources/',
    use: 'Monitoring source for new notices, forms, consultation material, and updated guidance.',
  },
];

const moduleMappings = [
  ['Consent management', 'NDPA S.25-S.26', 'Specific, informed consent, lawful basis, withdrawal, and demonstrable records.'],
  ['Data subject rights', 'NDPA Part VI, S.34-S.38', 'Access, correction, erasure, portability, objection, and response workflow support.'],
  ['Privacy policy generator', 'NDPA S.27', 'Transparent privacy notices covering controller identity, purposes, rights, sharing, retention, and safeguards.'],
  ['DPIA questionnaire', 'NDPA S.28', 'Risk assessment workflow for high-risk processing and mitigation tracking.'],
  ['ROPA', 'NDPA S.29', 'Records of processing activities for purposes, categories, recipients, transfers, and retention.'],
  ['Breach notification', 'NDPA S.40 / GAID 2025 Art. 33', '72-hour NDPC readiness, content completeness, and high-risk data-subject notification checks.'],
  ['Cross-border transfers', 'NDPA S.41-S.43', 'Adequacy, safeguards, transfer basis, and approval-oriented evidence gathering.'],
  ['DCPMI and CAR utilities', 'GAID 2025 / registration guidance', 'Major importance classification, fee baseline, and Compliance Audit Return schedule support.'],
];

const reviewCadence = [
  ['Monthly', 'Check NDPC resources, notices, forms, and public guidance for changes that affect defaults, thresholds, or docs.'],
  ['Release planning', 'Review module citations before minor releases and when adding compliance-sensitive exports.'],
  ['Emergency', 'Cut a patch or minor release when NDPC changes deadlines, reporting content, registration tiers, fees, or enforcement-critical interpretation.'],
  ['Annual', 'Run a full source review against NDPA, GAID, and NDPC notices before the first release of each calendar year.'],
];

const changelogTaxonomy = [
  ['Features', 'Additive public APIs, components, hooks, routes, adapters, CLI behavior, or documented capabilities.'],
  ['Bug Fixes', 'Corrections to shipped behavior, validation, packaging, security hardening, or regressions.'],
  ['Documentation', 'Docs, examples, release guidance, legal citation wording, or site content that does not change package behavior.'],
  ['Compliance Rule Changes', 'Changes to NDPA/NDPC/GAID assumptions, default thresholds, filing deadlines, citation mappings, scoring semantics, or compliance-sensitive validator behavior.'],
];

export default function LegalSourcesGovernanceGuide() {
  return (
    <DocLayout
      title="Legal Sources & Update Governance"
      description="Official legal references, module mapping, and the process used to keep NDPR Toolkit aligned with Nigerian data protection guidance."
    >
      <section id="scope" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Scope</h2>
        <p className="mb-4 text-foreground">
          NDPR Toolkit is developer infrastructure for implementing Nigeria Data Protection Act workflows in React,
          Next.js, and server-side TypeScript applications. It is not a law firm, DPCO, or replacement for legal
          review. The goal is to encode repeatable implementation patterns and make the underlying legal assumptions
          visible to engineering teams.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Not legal advice</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Treat toolkit output as implementation support. Before relying on it for regulated operations, confirm
            current obligations with counsel, a licensed DPCO, or the latest NDPC guidance.
          </p>
        </div>
      </section>

      <section id="sources" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Official sources tracked</h2>
        <div className="grid gap-4">
          {officialSources.map((source) => (
            <article key={source.href} className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                <a href={source.href} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{source.publisher}</p>
              <p className="text-sm text-foreground mb-0">{source.use}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="module-mapping" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Module mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Toolkit area</th>
                <th className="text-left p-3 border-b border-border">Primary reference</th>
                <th className="text-left p-3 border-b border-border">Implementation coverage</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {moduleMappings.map(([area, reference, coverage]) => (
                <tr key={area}>
                  <td className="p-3 border-b border-border font-medium">{area}</td>
                  <td className="p-3 border-b border-border">{reference}</td>
                  <td className="p-3 border-b border-border">{coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="governance" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Update governance</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Cadence</th>
                <th className="text-left p-3 border-b border-border">Review action</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {reviewCadence.map(([cadence, action]) => (
                <tr key={cadence}>
                  <td className="p-3 border-b border-border font-medium">{cadence}</td>
                  <td className="p-3 border-b border-border">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          Each compliance-sensitive change should identify the affected module, source reference, source version or
          retrieval date, expected behavior, tests or docs updated, and whether the change requires a breaking release.
        </p>
      </section>

      <section id="release-policy" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Release policy for regulatory changes</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>Patch releases fix citations, copy, examples, false positives, and non-breaking validator behavior.</li>
          <li>Minor releases add new regulatory utilities, new checks, new module coverage, or stricter optional validation.</li>
          <li>Major releases are reserved for breaking API changes or materially different compliance assumptions.</li>
          <li>Deprecated behavior should remain documented for at least one minor release unless it is legally misleading.</li>
        </ul>
      </section>

      <section id="changelog-taxonomy" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Changelog taxonomy</h2>
        <p className="mb-4 text-foreground">
          Compliance-impacting release notes are separated from ordinary feature, bug, and docs changes so adopters can
          decide whether to update config, re-run audits, refresh evidence, or seek legal review.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Heading</th>
                <th className="text-left p-3 border-b border-border">Use when</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {changelogTaxonomy.map(([heading, use]) => (
                <tr key={heading}>
                  <td className="p-3 border-b border-border font-medium">{heading}</td>
                  <td className="p-3 border-b border-border">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="user-responsibility" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What users should do after updates</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>Watch GitHub Releases or npm version updates for compliance-impacting release notes.</li>
          <li>Read any Compliance Rule Changes entry before upgrading production compliance workflows.</li>
          <li>Re-run <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr audit</code> after upgrading if the change affects DCPMI, CAR, breach, score, or evidence behavior.</li>
          <li>Refresh generated evidence or docs when citations, thresholds, deadlines, or source assumptions change.</li>
          <li>Confirm current NDPC guidance with counsel, a licensed DPCO, or the regulator before relying on outputs for filings.</li>
        </ul>
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related guides</h2>
        <div className="grid gap-3">
          <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">Compliance Score</Link>
          <Link href="/docs/guides/dcpmi-registration" className="text-primary hover:underline">DCPMI Registration & Audit Returns</Link>
          <Link href="/docs/guides/breach-notification-completeness" className="text-primary hover:underline">Breach Notification Completeness</Link>
          <Link href="/docs/guides/audit-cli" className="text-primary hover:underline">Compliance Audit CLI</Link>
        </div>
      </section>
    </DocLayout>
  );
}
