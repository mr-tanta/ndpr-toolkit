'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function LiteVsFullGuide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Lite vs Full Managers — NDPA Toolkit Documentation',
    description:
      'When to use the read-only Lite variants of LawfulBasisTracker, ROPAManager, and CrossBorderTransferManager, and how much you save on the JavaScript bundle.',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Lite vs Full Managers"
      description="Read-only Lite variants of the three Manager components — when to use them and what they save."
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex mb-6 space-x-2 flex-wrap gap-y-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          New in v3.8
        </span>
        <Link
          href="/docs/components/lawful-basis-tracker"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          Lawful Basis docs
        </Link>
        <Link
          href="/docs/components/ropa"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          ROPA docs
        </Link>
        <Link
          href="/docs/components/cross-border-transfers"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          Cross-Border docs
        </Link>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Version 3.8 of <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code> introduces
          three new <strong>Lite</strong> variants of the heavy Manager components: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LawfulBasisTrackerLite</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLite</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManagerLite</code>. Each one renders
          the same list-and-summary view as its Full counterpart, minus every write affordance — no Add, Edit,
          Archive, Delete, or CSV export. They are purpose-built for read-only surfaces.
        </p>
        <p className="mb-4 text-foreground">
          The Full components are unchanged. Lite is strictly additive: it ships under a new{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/lite</code> subpath alongside each feature module, so existing
          imports keep working exactly as before.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Who is this for?</h4>
          <ul className="list-disc pl-6 text-blue-700 dark:text-blue-300 text-sm mb-0 space-y-1">
            <li>Internal compliance dashboards where most users have view-only access.</li>
            <li>Customer-facing transparency pages that disclose processing activities or cross-border transfers.</li>
            <li>Audit or review pages where a separate workflow performs the writes.</li>
            <li>Embedded widgets — e.g. an &ldquo;active transfers&rdquo; tile on a home dashboard.</li>
          </ul>
        </div>
      </section>

      <section id="bundle-size" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Bundle size comparison</h2>
        <p className="mb-4 text-foreground">
          The heavier the Full component, the bigger the win from Lite. The cross-border manager is the standout
          — almost the entire Full bundle is the 624-row country adequacy dataset, which Lite does not import.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Full subpath</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Lite subpath</th>
                <th className="border border-border px-4 py-2 text-right font-semibold text-foreground">Full</th>
                <th className="border border-border px-4 py-2 text-right font-semibold text-foreground">Lite</th>
                <th className="border border-border px-4 py-2 text-right font-semibold text-foreground">Saved</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Lawful Basis</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/lawful-basis</code></td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/lawful-basis/lite</code></td>
                <td className="border border-border px-4 py-2 text-right text-foreground">36.7 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground">12.7 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground font-medium">65%</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Cross-Border</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/cross-border</code></td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/cross-border/lite</code></td>
                <td className="border border-border px-4 py-2 text-right text-foreground">53.3 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground">5.6 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground font-medium">89%</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/ropa</code></td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/ropa/lite</code></td>
                <td className="border border-border px-4 py-2 text-right text-foreground">36.9 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground">13.2 KB</td>
                <td className="border border-border px-4 py-2 text-right text-foreground font-medium">64%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mb-0">
          Sizes are minified and tree-shaken but <strong>pre-gzip</strong>. Gzipped delivery sizes are
          roughly 25&ndash;40% of these numbers.
        </p>
      </section>

      <section id="when-to-use" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When to use Lite</h2>
        <p className="mb-4 text-foreground">Reach for Lite when:</p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You are rendering a read-only dashboard, audit page, or compliance overview.</li>
          <li>The page is server-rendered and the viewing user cannot edit anyway (e.g. an executive summary).</li>
          <li>You are embedding a compliance widget on a homepage or layout shell where bundle weight matters.</li>
          <li>You are building a customer-facing transparency page disclosing transfers or processing activities.</li>
          <li>Write operations live in a separate admin route that loads the Full component on demand.</li>
        </ul>
        <p className="mb-4 text-foreground">Stick with the Full component when:</p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>The same page needs Add, Edit, Archive, or Delete.</li>
          <li>You rely on the built-in CSV export.</li>
          <li>You need the built-in detail view or validation handlers.</li>
        </ul>
      </section>

      <section id="side-by-side" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Side-by-side example</h2>
        <p className="mb-4 text-foreground">
          Compare the same Lawful Basis page written against the Full component and against the Lite variant.
          Lite drops all the write callbacks and surfaces one optional{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onActivityClick</code> for row interactivity.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium mb-2 text-foreground">Full — read + write</h4>
            <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
              <pre className="text-foreground text-sm"><code>{`import {
  LawfulBasisTracker,
  useLawfulBasis,
} from '@tantainnovative/ndpr-toolkit/lawful-basis';

export function LawfulBasisPage() {
  const {
    activities,
    addActivity,
    updateActivity,
    archiveActivity,
  } = useLawfulBasis();

  return (
    <LawfulBasisTracker
      activities={activities}
      onAddActivity={addActivity}
      onUpdateActivity={updateActivity}
      onArchiveActivity={archiveActivity}
    />
  );
}`}</code></pre>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-foreground">Lite — read-only</h4>
            <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
              <pre className="text-foreground text-sm"><code>{`import { LawfulBasisTrackerLite } from
  '@tantainnovative/ndpr-toolkit/lawful-basis/lite';
import { useLawfulBasis } from
  '@tantainnovative/ndpr-toolkit/hooks';

export function LawfulBasisOverview() {
  const { activities } = useLawfulBasis();

  return (
    <LawfulBasisTrackerLite
      activities={activities}
      onActivityClick={(a) =>
        router.push(\`/lawful-basis/\${a.id}\`)
      }
    />
  );
}`}</code></pre>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-0">
          The Lite version saves ~24 KB on this page alone — and the saving compounds across the three modules.
        </p>
      </section>

      <section id="per-module" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Per-module usage</h2>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Lawful Basis</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground text-sm"><code>{`import { LawfulBasisTrackerLite } from
  '@tantainnovative/ndpr-toolkit/lawful-basis/lite';
import type { ProcessingActivity } from
  '@tantainnovative/ndpr-toolkit';

export function LawfulBasisOverview({ activities }: {
  activities: ProcessingActivity[];
}) {
  return (
    <LawfulBasisTrackerLite
      activities={activities}
      onActivityClick={(a) => console.log('view', a.id)}
    />
  );
}`}</code></pre>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">ROPA</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground text-sm"><code>{`import { ROPAManagerLite } from
  '@tantainnovative/ndpr-toolkit/ropa/lite';
import type { ProcessingRecord } from
  '@tantainnovative/ndpr-toolkit';

export function ROPAOverview({ records }: {
  records: ProcessingRecord[];
}) {
  return (
    <ROPAManagerLite
      records={records}
      onRecordClick={(r) => console.log('view', r.id)}
    />
  );
}`}</code></pre>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Cross-Border Transfers</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground text-sm"><code>{`import { CrossBorderTransferManagerLite } from
  '@tantainnovative/ndpr-toolkit/cross-border/lite';
import type { CrossBorderTransfer } from
  '@tantainnovative/ndpr-toolkit';

export function TransfersOverview({ transfers }: {
  transfers: CrossBorderTransfer[];
}) {
  return (
    <CrossBorderTransferManagerLite
      transfers={transfers}
      onTransferClick={(t) => console.log('view', t.id)}
    />
  );
}`}</code></pre>
        </div>
      </section>

      <section id="migration" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Migration from Full to Lite</h2>
        <p className="mb-4 text-foreground">
          Migrating a read-only page is mechanical and isolated to the import statement and the prop set:
        </p>
        <ul className="list-disc pl-6 space-y-3 text-foreground mb-4">
          <li>
            <strong>Lawful Basis.</strong> Replace{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/lawful-basis&apos;</code> with{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/lawful-basis/lite&apos;</code>,
            drop{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onAddActivity</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onUpdateActivity</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onArchiveActivity</code> callbacks, and add{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onActivityClick</code> if you want row interactivity.
          </li>
          <li>
            <strong>ROPA.</strong> Replace{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/ropa&apos;</code> with{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/ropa/lite&apos;</code>,
            drop{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onAddRecord</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onUpdateRecord</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onArchiveRecord</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onExportCSV</code> callbacks, and add{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onRecordClick</code> if you want row interactivity.
          </li>
          <li>
            <strong>Cross-Border.</strong> Replace{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/cross-border&apos;</code> with{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">from &apos;@tantainnovative/ndpr-toolkit/cross-border/lite&apos;</code>,
            drop{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onAddTransfer</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onUpdateTransfer</code> /{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onTerminateTransfer</code> callbacks, and add{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onTransferClick</code> if you want row interactivity.
          </li>
        </ul>
        <p className="mb-4 text-foreground">
          The{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> prop and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot object are still
          supported on every Lite component. The slot list is shorter — only the slots actually used by the
          list-and-summary view are present.
        </p>
      </section>

      <section id="caveats" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Caveats</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong>No mutation.</strong> Lite components never call a util that mutates state. There is no
            built-in form, validation handler, modal, or CSV exporter. If you need any of those, render the
            Full component on the page that needs them — or load it lazily on user intent.
          </li>
          <li>
            <strong>Cross-border reads <code className="bg-muted px-1 py-0.5 rounded">adequacyStatus</code> directly.</strong>{' '}
            The Lite cross-border component displays <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">transfer.adequacyStatus</code>{' '}
            straight from each transfer record. It does <em>not</em> recompute adequacy by looking up the destination
            country in the bundled adequacy map — that map is the bulk of the Full component&apos;s 53 KB and is
            deliberately excluded. If your records contain stale adequacy data, the display will reflect that;
            keep the value fresh server-side (e.g. via{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateTransfer</code> from{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code>) before persisting.
          </li>
          <li>
            <strong>Type compatibility.</strong> Lite consumes the same{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ProcessingActivity</code>,{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ProcessingRecord</code>, and{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransfer</code> shapes
            as the Full versions — so swapping is safe at the type level.
          </li>
        </ul>
      </section>

      <section id="see-also" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">See also</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/components/lawful-basis-tracker" className="text-primary hover:underline">
              Lawful Basis Tracker component docs
            </Link>
          </li>
          <li>
            <Link href="/docs/components/ropa" className="text-primary hover:underline">
              ROPA component docs
            </Link>
          </li>
          <li>
            <Link href="/docs/components/cross-border-transfers" className="text-primary hover:underline">
              Cross-Border Transfers component docs
            </Link>
          </li>
          <li>
            <Link href="/docs/guides/server-rendering" className="text-primary hover:underline">
              Server-Side Rendering &amp; RSC
            </Link>{' '}
            — pairing Lite with <code className="bg-muted px-1 py-0.5 rounded">/server</code> validators.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
