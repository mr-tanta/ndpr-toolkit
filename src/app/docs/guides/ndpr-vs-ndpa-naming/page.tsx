'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const usageRows = [
  ['NDPA 2023', 'Current law and current compliance claims.', 'Use for page titles, product positioning, legal obligations, module descriptions, and customer-facing claims.'],
  ['NDPC', 'Current regulator and guidance owner.', 'Use for regulator references, GAID 2025 guidance, DCPMI/CAR, breach-notification guidance, and source citations.'],
  ['NDPR', 'Historical regulation, package identity, and search term.', 'Use for npm package names, import paths, legacy migration context, old component names, and SEO capture.'],
];

export default function NdprVsNdpaNamingGuide() {
  return (
    <DocLayout
      title="NDPR vs NDPA Naming"
      description="How NDPA Toolkit uses NDPA 2023 as the current legal term while preserving NDPR in package names, legacy migration context, and SEO."
    >
      <section id="short-version" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Short version</h2>
        <p className="mb-4 text-foreground">
          The current legal framing is <strong>NDPA 2023</strong>, enforced by the{' '}
          <strong>Nigeria Data Protection Commission (NDPC)</strong>. The package name remains{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>{' '}
          for compatibility and discoverability, but public compliance claims should lead with NDPA 2023.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
          <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Rule of thumb</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Say <strong>NDPA Toolkit</strong> for the product and <strong>NDPA 2023 compliance</strong> for current
            obligations. Say <strong>NDPR</strong> only when referring to the npm package name, legacy 2019 regulation,
            old API names such as <code>NDPRProvider</code>, or SEO/search context.
          </p>
        </div>
      </section>

      <section id="usage-map" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage map</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Term</th>
                <th className="text-left p-3 border-b border-border">Meaning</th>
                <th className="text-left p-3 border-b border-border">Use it for</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {usageRows.map(([term, meaning, use]) => (
                <tr key={term}>
                  <td className="p-3 border-b border-border font-semibold">{term}</td>
                  <td className="p-3 border-b border-border">{meaning}</td>
                  <td className="p-3 border-b border-border">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="why-package-stays-ndpr" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Why the package still says NDPR</h2>
        <p className="mb-4 text-foreground">
          The project started when Nigerian data-protection tooling was commonly searched for as NDPR tooling. Renaming
          the npm package would break existing imports, generated scaffolds, docs links, and installed projects. Keeping
          the package name stable is a compatibility decision, not a claim that NDPR 2019 is the current legal baseline.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4 text-foreground"><code>{`pnpm add @tantainnovative/ndpr-toolkit

import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';`}</code></pre>
        <p className="mb-4 text-foreground">
          Those import paths remain supported. New public copy should explain that the toolkit implements NDPA 2023 and
          NDPC GAID 2025 workflows.
        </p>
      </section>

      <section id="migration-context" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">NDPR 2019 to NDPA 2023 context</h2>
        <p className="mb-4 text-foreground">
          NDPR 2019 was the earlier Nigerian data-protection regulation. NDPA 2023 is the current Act and the basis for
          current toolkit legal citations, module pages, audit scoring, and compliance messaging. GAID 2025 adds
          implementation detail for areas such as DCPMI designation, Compliance Audit Returns, and breach-notification
          content.
        </p>
        <p className="mb-4 text-foreground">
          If you are migrating older NDPR-era implementations, keep your package imports stable, then review current
          NDPA/NDPC obligations through the{' '}
          <Link href="/docs/guides/legal-basis-and-citations" className="text-primary hover:underline">
            Legal Basis & Citations
          </Link>{' '}
          guide and the{' '}
          <Link href="/docs/guides/legal-sources-governance" className="text-primary hover:underline">
            Legal Sources & Update Governance
          </Link>{' '}
          guide.
        </p>
      </section>

      <section id="seo-boundary" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">SEO boundary</h2>
        <p className="mb-4 text-foreground">
          Metadata may include both NDPA and NDPR keywords because users still search for both terms. Titles,
          descriptions, headings, and schema descriptions should make NDPA 2023 the current compliance term and avoid
          presenting NDPR as the active statute.
        </p>
      </section>
    </DocLayout>
  );
}
