'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ROPAManagerLiteDocs() {
  return (
    <DocLayout
      title="ROPAManagerLite"
      description="Read-only variant of ROPAManager. Renders the summary stats, lawful-basis breakdown, risk indicators, compliance-gap alerts, and the records table — without the form, edit affordances, or CSV-export panel."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLite</code> is the display-only counterpart of
          <Link href="/docs/components/ropa" className="text-primary hover:underline"> ROPAManager</Link>. It renders the same summary cards
          (total records, active records, cross-border records, records with gaps), the same lawful-basis breakdown,
          the same risk indicators (sensitive data, DPIA required, automated decisions, due for review), the same
          compliance-gap alerts, and the same records table — but the add/edit form, the validation utilities, and the
          CSV-export panel are <strong>not</strong> bundled.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Reach for it on internal dashboards, audit reports, and DPO review pages. For the full read/write surface,
          use the regular <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManager</code> from the same module.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { ROPAManagerLite } from '@tantainnovative/ndpr-toolkit/ropa/lite';`}</code>
        </pre>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { ROPAManagerLite } from '@tantainnovative/ndpr-toolkit/ropa/lite';
import type { RecordOfProcessingActivities } from '@tantainnovative/ndpr-toolkit';

const ropa: RecordOfProcessingActivities = {
  id: 'ropa_001',
  organizationName: 'Acme Ltd',
  organizationContact: 'privacy@acme.example',
  organizationAddress: '12 Marina Road, Lagos',
  version: '1.0.0',
  lastUpdated: Date.now(),
  records: [
    {
      id: 'rec_001',
      name: 'Order fulfilment',
      description: 'Processing customer orders end to end.',
      department: 'Operations',
      controllerDetails: {
        name: 'Acme Ltd',
        contact: 'privacy@acme.example',
        address: '12 Marina Road, Lagos',
      },
      lawfulBasis: 'contract',
      lawfulBasisJustification: 'Necessary to perform the purchase contract.',
      purposes: ['Fulfil and ship customer orders'],
      dataCategories: ['Contact info', 'Order history'],
      dataSubjectCategories: ['Customers'],
      recipients: ['Logistics partner'],
      retentionPeriod: '7 years',
      securityMeasures: ['Encryption at rest', 'Access control'],
      dataSource: 'data_subject',
      dpiaRequired: false,
      automatedDecisionMaking: false,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastReviewedAt: Date.now() - 86400_000 * 30,
      nextReviewDate: Date.now() + 86400_000 * 60,
    },
  ],
};

export default function ROPAOverview() {
  return (
    <ROPAManagerLite
      ropa={ropa}
      showSummary
      showComplianceGaps
      onRecordClick={(r) => router.push(\`/ropa/\${r.id}\`)}
    />
  );
}`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Prop</th>
                <th className="text-left py-2 pr-4 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ropa</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RecordOfProcessingActivities</code></td>
                <td className="py-2"><strong>Required.</strong> The full ROPA whose <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">records</code> are displayed. Matches the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManager</code> API.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Header. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;Record of Processing Activities (ROPA)&quot;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Sub-header. Defaults to an NDPA accountability-principle explainer.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showSummary</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the four-stat summary cards plus the lawful-basis / risk-indicator panels. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showComplianceGaps</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the gap-alert banner powered by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">identifyComplianceGaps</code>. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onRecordClick</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`(record: ProcessingRecord) => void`}</code></td>
                <td className="py-2">Optional row callback. When provided, each row becomes keyboard-accessible (Enter / Space activates).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Extra class merged onto the root.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLiteClassNames</code></td>
                <td className="py-2">Per-slot overrides (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">root</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">header</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">summary</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">summaryCard</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">table</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tableHeader</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tableRow</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">statusBadge</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">complianceScore</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">gapAlert</code>).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Strip every default class.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="row-highlights" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Built-in row highlights</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The table colour-codes rows so reviewers can scan for problems:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>Red</strong> — review is overdue (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">nextReviewDate</code> is in the past).</li>
          <li><strong>Yellow</strong> — record has at least one compliance gap from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">identifyComplianceGaps</code>.</li>
          <li><strong>White / surface</strong> — healthy.</li>
        </ul>
      </section>

      <section id="when" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When NOT to use the Lite variant</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You need a DPO to add, edit, or archive records — use the full <Link href="/docs/components/ropa" className="text-primary hover:underline">ROPAManager</Link>.</li>
          <li>You need CSV export — use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">exportROPAToCSV</code> from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code> (or the full manager&apos;s export panel).</li>
          <li>You want server-side validation — pair with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateProcessingRecord</code> from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code>.</li>
        </ul>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">Lite vs Full managers</Link> — bundle-size comparison and decision rules.</li>
          <li><Link href="/docs/components/ropa" className="text-primary hover:underline">ROPAManager</Link> — the full read/write component.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
