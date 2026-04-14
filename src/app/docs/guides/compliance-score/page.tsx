'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ComplianceScoreGuide() {
  return (
    <DocLayout
      title="Compliance Score Engine"
      description="Measure and improve your NDPA 2023 compliance posture with the built-in scoring engine"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What the Compliance Score Engine Does</h2>
        <p className="mb-4 text-foreground">
          The compliance score engine analyses the state of all active toolkit modules and produces a numeric score
          from 0–100, a letter rating, per-module breakdowns, and prioritised recommendations. It gives your team an
          at-a-glance view of where you stand against the Nigeria Data Protection Act (NDPA) 2023 and highlights
          the highest-impact gaps to close.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Not a legal audit</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The score reflects the completeness of your <em>technical implementation</em> using the toolkit.
            It does not replace a formal Data Protection Impact Assessment or legal advice. Use it as a development
            health check, not a compliance certificate.
          </p>
        </div>
      </section>

      <section id="get-compliance-score" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using getComplianceScore()</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> is a pure function — pass it the current state of your modules and it
          returns a full compliance report synchronously. Import it from the main package:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { getComplianceScore } from '@tantainnovative/ndpr-toolkit';

const report = getComplianceScore({
  // Consent module state
  consent: {
    bannerImplemented: true,
    granularCategories: true,       // per-category opt-in/out
    withdrawalMechanism: true,      // preference centre exists
    consentRecordsStored: true,     // adapter persists records
    privacyPolicyLinked: true,
  },

  // Data Subject Rights module state
  dsr: {
    formImplemented: true,
    allRightsCovered: true,         // access, erasure, portability, etc.
    acknowledgementSent: false,     // no automated email yet
    processingTimeTracked: false,
  },

  // Breach notification module state
  breach: {
    formImplemented: true,
    timelineTracked: true,          // 72-hour countdown present
    ndpcNotificationProcess: false, // no NDPC submission workflow
  },

  // DPIA module state
  dpia: {
    questionnaireImplemented: true,
    riskMatrixPresent: true,
    highRiskProjectsAssessed: false,
  },

  // Privacy policy module state
  privacyPolicy: {
    pageExists: true,
    ndpaClausesPresent: true,
    lastUpdated: '2024-11-01',
  },

  // Lawful basis module state
  lawfulBasis: {
    trackerImplemented: true,
    allActivitiesRecorded: false,
  },

  // ROPA module state
  ropa: {
    registerExists: true,
    allActivitiesLogged: false,
  },

  // Cross-border transfers module state
  crossBorder: {
    transfersIdentified: false,
  },
});

console.log(report.score);        // 74
console.log(report.rating);       // 'B'
console.log(report.recommendations); // array of prioritised actions`}</code></pre>
        </div>
      </section>

      <section id="understanding-report" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Understanding the Report</h2>
        <p className="mb-4 text-foreground">
          The returned <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceReport</code> object has the following shape:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`interface ComplianceReport {
  /** Numeric score 0–100 */
  score: number;

  /** Letter grade: 'A' | 'B' | 'C' | 'D' | 'F' */
  rating: 'A' | 'B' | 'C' | 'D' | 'F';

  /** Per-module breakdown */
  modules: {
    [moduleName: string]: {
      score: number;           // 0–100 for this module
      weight: number;          // Contribution to overall score
      passed: string[];        // Checks that passed
      failed: string[];        // Checks that failed
      ndpaSection: string;     // Relevant NDPA 2023 section reference
    };
  };

  /** Ordered list of actions — highest impact first */
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    module: string;
    action: string;
    ndpaSection: string;
    estimatedScoreGain: number;
  }>;

  /** ISO timestamp of when the report was generated */
  generatedAt: string;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Rating thresholds</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Score</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Rating</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">90–100</td>
                <td className="border border-border px-4 py-2 font-bold text-green-600">A</td>
                <td className="border border-border px-4 py-2 text-foreground">Fully implemented — only minor gaps remain</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">75–89</td>
                <td className="border border-border px-4 py-2 font-bold text-blue-600">B</td>
                <td className="border border-border px-4 py-2 text-foreground">Mostly compliant — a few medium-priority items outstanding</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">60–74</td>
                <td className="border border-border px-4 py-2 font-bold text-yellow-600">C</td>
                <td className="border border-border px-4 py-2 text-foreground">Partial implementation — several notable gaps</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">40–59</td>
                <td className="border border-border px-4 py-2 font-bold text-orange-600">D</td>
                <td className="border border-border px-4 py-2 text-foreground">Significant gaps — high regulatory risk</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">0–39</td>
                <td className="border border-border px-4 py-2 font-bold text-red-600">F</td>
                <td className="border border-border px-4 py-2 text-foreground">Critical non-compliance — immediate action required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="module-weights" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Module Weights &amp; NDPA Section References</h2>
        <p className="mb-4 text-foreground">
          Weights reflect the relative emphasis each topic receives in the NDPA 2023 text and the
          Nigeria Data Protection Commission (NDPC) enforcement guidance.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Weight</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Primary NDPA Section</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Consent</td>
                <td className="border border-border px-4 py-2 text-foreground">25%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 25 — Lawful basis; Section 34 — Consent</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Data Subject Rights (DSR)</td>
                <td className="border border-border px-4 py-2 text-foreground">20%</td>
                <td className="border border-border px-4 py-2 text-foreground">Sections 35–40 — Data subject rights</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Breach Notification</td>
                <td className="border border-border px-4 py-2 text-foreground">15%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 40 — Breach notification obligations</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Privacy Policy</td>
                <td className="border border-border px-4 py-2 text-foreground">15%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 24 — Transparency and notice obligations</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">DPIA</td>
                <td className="border border-border px-4 py-2 text-foreground">10%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 29 — Data Protection Impact Assessments</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Lawful Basis Tracker</td>
                <td className="border border-border px-4 py-2 text-foreground">5%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 25 — Lawful basis for processing</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 text-foreground">5%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 44 — Records of processing activities</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Cross-Border Transfers</td>
                <td className="border border-border px-4 py-2 text-foreground">5%</td>
                <td className="border border-border px-4 py-2 text-foreground">Sections 43–44 — International data transfers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="use-compliance-score" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using the useComplianceScore() Hook</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useComplianceScore()</code> is the reactive version of <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code>.
          It re-computes the report whenever module state changes, making it suitable for a live compliance dashboard.
          Use it inside <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> — the hook reads module state from context automatically.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`'use client';

import { useComplianceScore } from '@tantainnovative/ndpr-toolkit';

export function ComplianceWidget() {
  const { score, rating, recommendations, modules } = useComplianceScore();

  return (
    <div className="p-6 rounded-xl border">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl font-bold">{score}</span>
        <span className="text-2xl font-semibold text-gray-500">/ 100</span>
        <span className={
          rating === 'A' ? 'text-green-600' :
          rating === 'B' ? 'text-blue-600' :
          rating === 'C' ? 'text-yellow-600' :
          'text-red-600'
        }>
          Rating: {rating}
        </span>
      </div>

      <h3 className="font-semibold mb-2">Top Recommendations</h3>
      <ul className="space-y-2">
        {recommendations.slice(0, 3).map((rec, i) => (
          <li key={i} className="text-sm">
            <span className="font-medium">[{rec.priority.toUpperCase()}]</span>{' '}
            {rec.action}{' '}
            <span className="text-gray-500">(+{rec.estimatedScoreGain} pts)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="ndpr-dashboard" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The NDPRDashboard Component</h2>
        <p className="mb-4 text-foreground">
          For teams that want a complete compliance overview without building a custom UI, the toolkit ships a
          ready-made <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code> component. It renders the compliance score gauge, module cards,
          recommendation list, and per-module drill-downs.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { NDPRDashboard } from '@tantainnovative/ndpr-toolkit';

// Must be rendered inside NDPRProvider
export default function ComplianceDashboardPage() {
  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">NDPA Compliance Dashboard</h1>
      <NDPRDashboard
        showModuleDetails       // expand per-module breakdown
        showRecommendations     // render the recommendations list
        onRecommendationClick={(rec) => {
          // Navigate to the relevant module page, e.g.:
          router.push(\`/docs/guides/\${rec.module}\`);
        }}
      />
    </main>
  );
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Embedding the dashboard in a restricted admin area</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app/(admin)/compliance/page.tsx
import { NDPRProvider, ndprPreset, NDPRDashboard } from '@tantainnovative/ndpr-toolkit';
import { requireAdmin } from '@/lib/auth';

export default async function CompliancePage() {
  await requireAdmin(); // your auth guard

  return (
    // Nest a local NDPRProvider if the root layout doesn't already have one
    <NDPRProvider preset={ndprPreset}>
      <NDPRDashboard showModuleDetails showRecommendations />
    </NDPRProvider>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="server-side" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Server-side Compliance Checks</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> has no browser dependencies — you can run it in a Node.js API route
          to generate reports server-side and persist them to a database or send them in a scheduled email:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app/api/compliance-report/route.ts
import { getComplianceScore } from '@tantainnovative/ndpr-toolkit';
import { getCurrentModuleState } from '@/lib/compliance-state';
import { NextResponse } from 'next/server';

export async function GET() {
  const moduleState = await getCurrentModuleState(); // fetch from your DB
  const report = getComplianceScore(moduleState);

  return NextResponse.json(report);
}`}</code></pre>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/managing-consent" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Managing Consent &rarr;
          </Link>
          <Link href="/docs/guides/data-subject-requests" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Handling Data Subject Requests &rarr;
          </Link>
          <Link href="/docs/guides/ndpr-compliance-checklist" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            NDPA Compliance Checklist &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
