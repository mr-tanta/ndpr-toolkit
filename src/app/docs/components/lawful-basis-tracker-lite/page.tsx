'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { ProductionReadinessBlock } from '@/components/docs/ProductionReadinessBlock';

export default function LawfulBasisTrackerLiteDocs() {
  return (
    <DocLayout
      title="LawfulBasisTrackerLite"
      description="Read-only variant of LawfulBasisTracker. Renders the summary cards, compliance-gap alerts, and activity table — without the form, LIA workflow, or edit affordances. Significantly smaller bundle when all you need is a view."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LawfulBasisTrackerLite</code> is the display-only counterpart of
          <Link href="/docs/components/lawful-basis-tracker" className="text-primary hover:underline"> LawfulBasisTracker</Link>. It renders the same
          summary cards (total activities, sensitive-data count, cross-border count, pending approvals), the same
          compliance-gap alerts, and the same activity table — but the form, the legitimate-interest assessment, the
          field validation, and the write-path utilities are <strong>not</strong> bundled. Pure read.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Reach for it on dashboards, audit reports, and customer-facing transparency pages where users only need to
          inspect activities, not edit them. For the full read/write surface, use the regular
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> LawfulBasisTracker</code> from the same module.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { LawfulBasisTrackerLite } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';`}</code>
        </pre>
      </section>

      <ProductionReadinessBlock
        moduleName="LawfulBasisTrackerLite"
        importRows={[
          {
            packagePath: '@tantainnovative/ndpr-toolkit/lawful-basis/lite',
            exports: 'LawfulBasisTrackerLite',
            useCase: 'Read-only lawful-basis summaries, gap alerts, and activity tables.',
          },
          {
            packagePath: '@tantainnovative/ndpr-toolkit/lawful-basis',
            exports: 'LawfulBasisTracker, validateProcessingActivity',
            useCase: 'Full read/write manager and validation path for admins and privacy reviewers.',
          },
          {
            packagePath: '@tantainnovative/ndpr-recipes',
            exports: 'src/adapters/drizzle-lawful-basis.ts',
            useCase: 'Reference persistence adapter for records consumed by read-only views.',
          },
        ]}
        checklist={[
          'Feed lite views from approved lawful-basis records, not draft activities.',
          'Use onActivityClick only for detail pages the current user can access.',
          'Display pending approvals, sensitive-data flags, and cross-border indicators where relevant.',
          'Route edits, approvals, and LIA workflows to the full LawfulBasisTracker.',
          'Define whether the lite view is internal-only or safe for customer-facing transparency.',
        ]}
        backendNotes={[
          'Use the recipes adapter as the durable source for lawful-basis activities.',
          'Apply authorization before returning activities because lite UI does not enforce backend permissions.',
          'Return approved status and review metadata so dashboards do not imply draft records are final.',
          'Redact internal rationale before exposing activity summaries outside privacy/legal teams.',
        ]}
        testingNotes={[
          'Compare lite counts and gap alerts with the full manager and backend records.',
          'Check records with pending approval, sensitive data, cross-border transfers, and archived status.',
          'Verify keyboard row activation and no-op behavior when onActivityClick is omitted.',
          'Confirm users cannot fetch restricted rationale or approval details through linked routes.',
        ]}
        commonMistakes={[
          'Using lite pages for approval workflows instead of the full manager.',
          'Showing draft legal bases as approved production records.',
          'Treating hidden edit controls as authorization.',
          'Publishing internal legitimate-interest rationale without review or redaction.',
        ]}
      />

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { LawfulBasisTrackerLite } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';
import type { ProcessingActivity } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';

const activities: ProcessingActivity[] = [
  {
    id: 'act_001',
    name: 'Customer onboarding',
    description: 'KYC and account creation',
    lawfulBasis: 'contract',
    status: 'active',
    involvesSensitiveData: false,
    crossBorderTransfer: false,
    dpoApproval: { approved: true, approvedAt: Date.now(), approvedBy: 'DPO' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // ...remaining ProcessingActivity fields
  },
];

export default function ActivitiesPage() {
  return (
    <LawfulBasisTrackerLite
      activities={activities}
      showSummary
      showComplianceGaps
      onActivityClick={(a) => router.push(\`/activities/\${a.id}\`)}
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
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">activities</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ProcessingActivity[]</code></td>
                <td className="py-2"><strong>Required.</strong> Activities to display. Sorted by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">updatedAt</code> descending in the rendered table.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Header. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;Lawful Basis Tracker&quot;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">description</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Sub-header. Defaults to an NDPA Section 25 explainer.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showSummary</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the four-stat summary cards (total / sensitive / cross-border / pending). Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showComplianceGaps</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the high / medium severity gap alerts produced by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">assessComplianceGaps</code>. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onActivityClick</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`(activity: ProcessingActivity) => void`}</code></td>
                <td className="py-2">Optional row callback. When provided, each row becomes keyboard-accessible (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">role=&quot;button&quot;</code>, Enter / Space activates).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Extra class merged onto the root.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LawfulBasisTrackerLiteClassNames</code></td>
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

      <section id="when" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When NOT to use the Lite variant</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You need an admin to add, edit, or archive activities — use the full <Link href="/docs/components/lawful-basis-tracker" className="text-primary hover:underline">LawfulBasisTracker</Link>.</li>
          <li>You need the legitimate-interest assessment (LIA) flow — also full only.</li>
          <li>You want server-side validation of new activities — pair the full variant with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateProcessingActivity</code> from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code>.</li>
        </ul>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">Lite vs Full managers</Link> — bundle-size comparison and when each variant is the right call.</li>
          <li><Link href="/docs/components/lawful-basis-tracker" className="text-primary hover:underline">LawfulBasisTracker</Link> — the full read/write component.</li>
          <li><Link href="/docs/guides/lawful-basis" className="text-primary hover:underline">Lawful basis for processing</Link> — NDPA Section 25 background.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
