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
          from 0–100, a rating, per-module breakdowns, and prioritised recommendations. It gives your team an
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
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> is a pure function — pass it a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceInput</code> object describing your current
          implementation state and it returns a full{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceReport</code> synchronously. Import it from the main package:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { getComplianceScore } from '@tantainnovative/ndpr-toolkit';

const report = getComplianceScore({
  // Consent module
  consent: {
    hasConsentMechanism: true,       // affirmative consent collected before processing
    hasPurposeSpecification: true,   // purpose communicated at point of consent
    hasWithdrawalMechanism: true,    // data subjects can withdraw consent
    hasMinorProtection: false,       // age-verification / parental-consent not yet implemented
    consentRecordsRetained: true,    // consent records persisted
  },

  // Data Subject Rights module
  dsr: {
    hasRequestMechanism: true,       // formal channel exists for DSR submissions
    supportsAccess: true,            // right of access honoured
    supportsRectification: true,     // right to rectification honoured
    supportsErasure: false,          // erasure workflow not yet implemented
    supportsPortability: false,      // portability not yet implemented
    supportsObjection: false,        // right to object not yet implemented
    responseTimelineDays: 14,        // max days to respond (must be ≤ 30)
  },

  // Data Protection Impact Assessment module
  dpia: {
    conductedForHighRisk: true,      // DPIA conducted before high-risk processing
    documentedRisks: true,           // risks to data subjects documented
    mitigationMeasures: false,       // mitigation measures not yet documented
  },

  // Breach notification module
  breach: {
    hasNotificationProcess: true,    // documented breach response process exists
    notifiesWithin72Hours: true,     // NDPC notified within 72 hours of discovery
    hasRiskAssessment: false,        // per-breach risk assessment not yet performed
    hasRecordKeeping: true,          // breach register maintained
  },

  // Privacy policy module
  policy: {
    hasPrivacyPolicy: true,          // privacy policy exists
    isPubliclyAccessible: true,      // policy is reachable on website/app
    lastUpdated: '2024-11-01',       // ISO date — >13 months old counts as a gap
    coversAllSections: true,         // all NDPA-mandated disclosures present
  },

  // Lawful basis module
  lawfulBasis: {
    documentedForAllProcessing: true,             // lawful basis recorded for every activity
    hasLegitimateInterestAssessment: false,        // LIA not yet completed
  },

  // Cross-border transfers module
  crossBorder: {
    hasTransferMechanisms: true,     // SCCs / BCRs / adequacy decisions in place
    adequacyAssessed: true,          // destination-country adequacy reviewed
    ndpcApprovalObtained: false,     // NDPC approval pending
  },

  // Records of Processing Activities module
  ropa: {
    maintained: true,                // ROPA exists and is maintained
    includesAllProcessing: false,    // not all activities captured yet
    lastReviewed: '2024-10-15',      // ISO date — >6 months old counts as a gap
  },
});

console.log(report.score);        // e.g. 68
console.log(report.rating);       // 'needs-work'
console.log(report.recommendations); // array of prioritised Recommendation objects`}</code></pre>
        </div>
      </section>

      <section id="compliance-input" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">ComplianceInput Reference</h2>
        <p className="mb-4 text-foreground">
          The full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceInput</code> interface — every field and its type:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`interface ComplianceInput {
  consent: {
    hasConsentMechanism: boolean;
    hasPurposeSpecification: boolean;
    hasWithdrawalMechanism: boolean;
    hasMinorProtection: boolean;
    consentRecordsRetained: boolean;
  };
  dsr: {
    hasRequestMechanism: boolean;
    supportsAccess: boolean;
    supportsRectification: boolean;
    supportsErasure: boolean;
    supportsPortability: boolean;
    supportsObjection: boolean;
    /** Max response time in days — values > 30 count as a gap */
    responseTimelineDays: number;
  };
  dpia: {
    conductedForHighRisk: boolean;
    documentedRisks: boolean;
    mitigationMeasures: boolean;
  };
  breach: {
    hasNotificationProcess: boolean;
    notifiesWithin72Hours: boolean;
    hasRiskAssessment: boolean;
    hasRecordKeeping: boolean;
  };
  policy: {
    hasPrivacyPolicy: boolean;
    isPubliclyAccessible: boolean;
    /** ISO date string (YYYY-MM-DD) — > 13 months old counts as a gap */
    lastUpdated: string;
    coversAllSections: boolean;
  };
  lawfulBasis: {
    documentedForAllProcessing: boolean;
    hasLegitimateInterestAssessment: boolean;
  };
  crossBorder: {
    hasTransferMechanisms: boolean;
    adequacyAssessed: boolean;
    ndpcApprovalObtained: boolean;
  };
  ropa: {
    maintained: boolean;
    includesAllProcessing: boolean;
    /** ISO date string (YYYY-MM-DD) — > 6 months old counts as a gap */
    lastReviewed: string;
  };
}`}</code></pre>
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

  /** Rating bucket */
  rating: 'excellent' | 'good' | 'needs-work' | 'critical';

  /** Per-module breakdown keyed by module name */
  modules: Record<string, {
    name: string;           // e.g. "consent"
    score: number;          // 0–100 for this module
    maxScore: number;       // always 100
    weightedScore: number;  // weighted contribution to the overall score
    ndpaSections: string[]; // NDPA sections this module maps to
    gaps: string[];         // human-readable list of failing checks
  }>;

  /** Recommendations sorted by priority (critical first) */
  recommendations: Array<{
    module: string;
    key: string;
    label: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    recommendation: string;
    ndpaSection: string;
  }>;

  /** Top-level regulatory references */
  regulatoryReferences: Array<{
    section: string;
    title: string;
    url?: string;
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
                <td className="border border-border px-4 py-2 font-bold text-green-600">excellent</td>
                <td className="border border-border px-4 py-2 text-foreground">Fully implemented — only minor gaps remain</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">70–89</td>
                <td className="border border-border px-4 py-2 font-bold text-blue-600">good</td>
                <td className="border border-border px-4 py-2 text-foreground">Mostly compliant — a few medium-priority items outstanding</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">40–69</td>
                <td className="border border-border px-4 py-2 font-bold text-yellow-600">needs-work</td>
                <td className="border border-border px-4 py-2 text-foreground">Partial implementation — several notable gaps</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">0–39</td>
                <td className="border border-border px-4 py-2 font-bold text-red-600">critical</td>
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
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Primary NDPA Sections</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Consent</td>
                <td className="border border-border px-4 py-2 text-foreground">20%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 25, Section 26</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Data Subject Rights (DSR)</td>
                <td className="border border-border px-4 py-2 text-foreground">15%</td>
                <td className="border border-border px-4 py-2 text-foreground">Sections 34–39</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Breach Notification</td>
                <td className="border border-border px-4 py-2 text-foreground">15%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 40</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Privacy Policy</td>
                <td className="border border-border px-4 py-2 text-foreground">12%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 29</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">DPIA</td>
                <td className="border border-border px-4 py-2 text-foreground">12%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 28</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Lawful Basis</td>
                <td className="border border-border px-4 py-2 text-foreground">10%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 25(1)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Cross-Border Transfers</td>
                <td className="border border-border px-4 py-2 text-foreground">8%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 43, Section 44</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">ROPA</td>
                <td className="border border-border px-4 py-2 text-foreground">8%</td>
                <td className="border border-border px-4 py-2 text-foreground">Section 30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="use-compliance-score" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using the useComplianceScore() Hook</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useComplianceScore()</code> is the reactive version of{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code>.
          It memoises the report and re-computes it whenever the input changes, making it ideal for a live compliance dashboard.
          It requires a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'{ input }'}</code> argument — it does <strong>not</strong> read
          state from context automatically.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`'use client';

import { useState } from 'react';
import { useComplianceScore } from '@tantainnovative/ndpr-toolkit';
import type { ComplianceInput } from '@tantainnovative/ndpr-toolkit';

const initialInput: ComplianceInput = {
  consent: {
    hasConsentMechanism: true,
    hasPurposeSpecification: true,
    hasWithdrawalMechanism: true,
    hasMinorProtection: false,
    consentRecordsRetained: true,
  },
  dsr: {
    hasRequestMechanism: true,
    supportsAccess: true,
    supportsRectification: true,
    supportsErasure: false,
    supportsPortability: false,
    supportsObjection: false,
    responseTimelineDays: 14,
  },
  dpia: {
    conductedForHighRisk: true,
    documentedRisks: true,
    mitigationMeasures: false,
  },
  breach: {
    hasNotificationProcess: true,
    notifiesWithin72Hours: true,
    hasRiskAssessment: false,
    hasRecordKeeping: true,
  },
  policy: {
    hasPrivacyPolicy: true,
    isPubliclyAccessible: true,
    lastUpdated: '2024-11-01',
    coversAllSections: true,
  },
  lawfulBasis: {
    documentedForAllProcessing: true,
    hasLegitimateInterestAssessment: false,
  },
  crossBorder: {
    hasTransferMechanisms: true,
    adequacyAssessed: true,
    ndpcApprovalObtained: false,
  },
  ropa: {
    maintained: true,
    includesAllProcessing: false,
    lastReviewed: '2024-10-15',
  },
};

export function ComplianceWidget() {
  const [input] = useState<ComplianceInput>(initialInput);

  // Pass { input } — the hook does NOT read from context
  const report = useComplianceScore({ input });
  const { score, rating, recommendations, modules } = report;

  const ratingColor =
    rating === 'excellent' ? 'text-green-600' :
    rating === 'good'      ? 'text-blue-600' :
    rating === 'needs-work'? 'text-yellow-600' :
                             'text-red-600';

  return (
    <div className="p-6 rounded-xl border">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl font-bold">{score}</span>
        <span className="text-2xl font-semibold text-gray-500">/ 100</span>
        <span className={ratingColor}>
          {rating}
        </span>
      </div>

      <h3 className="font-semibold mb-2">Top Recommendations</h3>
      <ul className="space-y-2">
        {recommendations.slice(0, 3).map((rec) => (
          <li key={rec.key} className="text-sm">
            <span className="font-medium">[{rec.priority.toUpperCase()}]</span>{' '}
            {rec.recommendation}{' '}
            <span className="text-gray-500">({rec.ndpaSection})</span>
          </li>
        ))}
      </ul>

      <h3 className="font-semibold mt-4 mb-2">Module Scores</h3>
      <ul className="space-y-1">
        {Object.values(modules).map((mod) => (
          <li key={mod.name} className="text-sm flex justify-between">
            <span className="capitalize">{mod.name}</span>
            <span>{mod.score}/100</span>
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
          ready-made <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code> component. It renders a score ring, per-module cards with
          progress bars, and a prioritised recommendations list — all driven by a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceReport</code> you pass in as a prop.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Props</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`interface NDPRDashboardProps {
  /** Compliance report produced by getComplianceScore() — required */
  report: ComplianceReport;

  /** Dashboard heading. Defaults to "NDPA Compliance Dashboard" */
  title?: string;

  /** Show/hide the recommendations list. Defaults to true */
  showRecommendations?: boolean;

  /** Maximum number of recommendations to render. Defaults to 5 */
  maxRecommendations?: number;

  /** Per-section class name overrides for custom styling */
  classNames?: NDPRDashboardClassNames;

  /** Strip all default classes so you can style from scratch */
  unstyled?: boolean;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Basic usage</h3>
        <p className="mb-4 text-foreground">
          Call <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> with your{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ComplianceInput</code>, then pass the resulting report to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`'use client';

import { getComplianceScore, NDPRDashboard } from '@tantainnovative/ndpr-toolkit';

const report = getComplianceScore({
  consent: {
    hasConsentMechanism: true,
    hasPurposeSpecification: true,
    hasWithdrawalMechanism: true,
    hasMinorProtection: false,
    consentRecordsRetained: true,
  },
  dsr: {
    hasRequestMechanism: true,
    supportsAccess: true,
    supportsRectification: true,
    supportsErasure: false,
    supportsPortability: false,
    supportsObjection: false,
    responseTimelineDays: 14,
  },
  dpia: {
    conductedForHighRisk: true,
    documentedRisks: true,
    mitigationMeasures: false,
  },
  breach: {
    hasNotificationProcess: true,
    notifiesWithin72Hours: true,
    hasRiskAssessment: false,
    hasRecordKeeping: true,
  },
  policy: {
    hasPrivacyPolicy: true,
    isPubliclyAccessible: true,
    lastUpdated: '2024-11-01',
    coversAllSections: true,
  },
  lawfulBasis: {
    documentedForAllProcessing: true,
    hasLegitimateInterestAssessment: false,
  },
  crossBorder: {
    hasTransferMechanisms: true,
    adequacyAssessed: true,
    ndpcApprovalObtained: false,
  },
  ropa: {
    maintained: true,
    includesAllProcessing: false,
    lastReviewed: '2024-10-15',
  },
});

export default function ComplianceDashboardPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <NDPRDashboard report={report} />
    </main>
  );
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Controlling what renders</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Hide recommendations and change the title
<NDPRDashboard
  report={report}
  title="Q2 Compliance Review"
  showRecommendations={false}
/>

// Show at most 3 recommendations
<NDPRDashboard
  report={report}
  maxRecommendations={3}
/>`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Custom styling with classNames</h3>
        <p className="mb-4 text-foreground">
          Every visual section accepts a class name override via the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> prop. Pass{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> to strip all defaults and style from scratch:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`<NDPRDashboard
  report={report}
  classNames={{
    root: 'bg-card border border-border rounded-2xl p-8',
    moduleCard: 'bg-muted rounded-lg p-4',
    recommendationItem: 'border border-border rounded-lg p-3',
  }}
/>`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Live dashboard with useComplianceScore()</h3>
        <p className="mb-4 text-foreground">
          Pair <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code> with{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useComplianceScore()</code> for a dashboard that re-renders whenever
          your input state changes. Remember to pass <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'{ input }'}</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`'use client';

import { useState } from 'react';
import { useComplianceScore, NDPRDashboard } from '@tantainnovative/ndpr-toolkit';
import type { ComplianceInput } from '@tantainnovative/ndpr-toolkit';

export function LiveComplianceDashboard({ input }: { input: ComplianceInput }) {
  // Must pass { input } — the hook does not read from context
  const report = useComplianceScore({ input });

  return <NDPRDashboard report={report} />;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Preset: NDPRComplianceDashboard</h3>
        <p className="mb-4 text-foreground">
          The presets package ships <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRComplianceDashboard</code>, which combines{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">getComplianceScore()</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDashboard</code> into a single drop-in component — ideal for
          admin dashboards:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { NDPRComplianceDashboard } from '@tantainnovative/ndpr-toolkit/presets';

// Pass your ComplianceInput directly — no need to call getComplianceScore() yourself
<NDPRComplianceDashboard input={complianceInput} />`}</code></pre>
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
import type { ComplianceInput } from '@tantainnovative/ndpr-toolkit';
import { getCurrentModuleState } from '@/lib/compliance-state';
import { NextResponse } from 'next/server';

export async function GET() {
  // fetch your saved ComplianceInput from DB — must match the ComplianceInput shape
  const input: ComplianceInput = await getCurrentModuleState();
  const report = getComplianceScore(input);

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
