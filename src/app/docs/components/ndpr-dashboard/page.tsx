'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function NDPRDashboardDocs() {
  return (
    <DocLayout
      title="NDPRDashboard"
      description="Read-only compliance dashboard. Visualises a ComplianceReport from getComplianceScore() with an overall ring, per-module cards, and a prioritised recommendations list."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code> is a presentational component for the toolkit&apos;s
          compliance scoring engine. Pass it a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceReport</code> — the typed object produced by
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> getComplianceScore(input)</code> — and it renders:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>An overall score ring (0–100) with a coloured rating badge (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">excellent</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">good</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">needs-work</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">critical</code>).</li>
          <li>A 2&times;4 grid of per-module cards (consent, DSR, DPIA, breach, policy, lawful basis, cross-border, ROPA) each with a score and gap count.</li>
          <li>A prioritised recommendations list, capped at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">maxRecommendations</code> (default 5).</li>
        </ul>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRDashboard, getComplianceScore } from '@tantainnovative/ndpr-toolkit';
import type { ComplianceInput } from '@tantainnovative/ndpr-toolkit';

const input: ComplianceInput = {
  consent: { hasBanner: true, settings: latestConsentSettings },
  dsr: { requests: dsrRequests },
  dpia: { results: dpiaResults },
  breach: { reports: breachReports },
  policy: { policy: privacyPolicy },
  lawfulBasis: { activities },
  crossBorder: { transfers },
  ropa: { records },
};

const report = getComplianceScore(input);

export default function CompliancePage() {
  return (
    <NDPRDashboard
      report={report}
      title="Acme Compliance Overview"
      showRecommendations
      maxRecommendations={5}
    />
  );
}`}</code>
        </pre>
      </section>

      <section id="preset" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Preset wrapper: NDPRComplianceDashboard</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          If you don&apos;t want to call <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> yourself, use the preset wrapper from
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> /presets</code>. It accepts the raw <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceInput</code>, computes the report
          internally, and delegates rendering to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code>:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRComplianceDashboard } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRComplianceDashboard
  input={{
    consent: { hasBanner: true, settings },
    dsr: { requests },
    // …other modules
  }}
  title="Compliance overview"
/>`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Same visual surface; the only difference is whether the score computation lives in the preset or in your code.
        </p>
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
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">report</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceReport</code></td>
                <td className="py-2"><strong>Required.</strong> The report object from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">title</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Dashboard heading. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;NDPA Compliance Dashboard&quot;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">showRecommendations</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Toggle the recommendations section. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">maxRecommendations</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">number</code></td>
                <td className="py-2">Cap on the rendered recommendations. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">5</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboardClassNames</code></td>
                <td className="py-2">Per-slot class overrides (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">root</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">header</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">scoreCircle</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">moduleCard</code>, etc.).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">Strip all default classes for a true blank slate.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="recommendations" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Recommendation shape</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Each <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Recommendation</code> carries enough context to drive a follow-up action: the NDPA
          section it traces back to, a priority bucket, and an effort estimate.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`interface Recommendation {
  module: string;                  // 'consent' | 'dsr' | ...
  key: string;
  label: string;                   // short title
  recommendation: string;          // body
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: EffortLevel;
  ndpaSection: string;             // e.g. 'NDPA s. 25'
}`}</code>
        </pre>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/compliance-score" className="text-primary hover:underline">Compliance score guide</Link> — what each module contributes, weighting, and how to back-fill missing modules.</li>
          <li><Link href="/docs/guides/presets" className="text-primary hover:underline">Zero-config presets</Link> — the preset wrapper and other one-line drop-ins.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
