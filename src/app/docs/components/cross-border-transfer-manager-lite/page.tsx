'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CrossBorderTransferManagerLiteDocs() {
  return (
    <DocLayout
      title="CrossBorderTransferManagerLite"
      description="Read-only variant of CrossBorderTransferManager. Renders the four-stat summary, risk alerts, and transfer table — without the form, the adequacy dataset, or any add / edit / delete affordances."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManagerLite</code> is the display-only counterpart of
          <Link href="/docs/components/cross-border-transfers" className="text-primary hover:underline"> CrossBorderTransferManager</Link>. It renders the
          same four-stat summary (active transfers, pending approval, high risk, missing TIA), the same risk alerts, and
          the same transfers table — but the add/edit form, the full country adequacy dataset, and the write-path
          utilities are <strong>not</strong> bundled.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Use it on dashboards, regulatory reports, and transparency pages where users only need to inspect transfers.
          For the full read/write surface, use the regular <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManager</code> from the same module.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';`}</code>
        </pre>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';
import type { CrossBorderTransfer } from '@tantainnovative/ndpr-toolkit';

const transfers: CrossBorderTransfer[] = [
  {
    id: 'xfer_001',
    destinationCountry: 'United Kingdom',
    destinationCountryCode: 'GB',
    recipientOrganization: 'Acme UK Ltd',
    transferMechanism: 'adequacy_decision',
    adequacyStatus: 'adequate',
    riskLevel: 'low',
    status: 'active',
    tiaCompleted: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // ...remaining CrossBorderTransfer fields
  },
];

export default function TransfersOverview() {
  return (
    <CrossBorderTransferManagerLite
      transfers={transfers}
      showSummary
      showRiskAlerts
      onTransferClick={(t) => router.push(\`/transfers/\${t.id}\`)}
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
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">transfers</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransfer[]</code></td>
                <td className="py-2"><strong>Required.</strong> Transfers to display. Sorted by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">updatedAt</code> descending in the rendered table.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Header. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;Cross-Border Data Transfer Manager&quot;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Sub-header. Defaults to an NDPA Part VIII (Sections 41-43) explainer.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showSummary</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the four-stat summary cards. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showRiskAlerts</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the high-risk / NDPC-approval-required alert banner. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onTransferClick</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`(transfer: CrossBorderTransfer) => void`}</code></td>
                <td className="py-2">Optional row callback. When provided, each row becomes keyboard-accessible (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">role=&quot;button&quot;</code>, Enter / Space activates).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Extra class merged onto the root.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManagerLiteClassNames</code></td>
                <td className="py-2">Per-slot overrides (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">root</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">header</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">summary</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">summaryCard</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">table</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tableHeader</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tableRow</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">statusBadge</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">riskBadge</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">riskAlert</code>).</td>
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

      <section id="when" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When NOT to use the Lite variant</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You need an admin to add, edit, or terminate transfers — use the full <Link href="/docs/components/cross-border-transfers" className="text-primary hover:underline">CrossBorderTransferManager</Link>.</li>
          <li>You want the bundled country-adequacy lookup UI — also full only.</li>
          <li>You want server-side validation of new transfers — pair the full variant with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateTransfer</code> from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code>.</li>
        </ul>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">Lite vs Full managers</Link> — bundle-size comparison and decision rules.</li>
          <li><Link href="/docs/components/cross-border-transfers" className="text-primary hover:underline">CrossBorderTransferManager</Link> — the full read/write component.</li>
          <li><Link href="/docs/guides/cross-border-transfers" className="text-primary hover:underline">Cross-border transfers</Link> — NDPA Part VIII background and TIA workflow.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
