'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function AuditCliGuide() {
  return (
    <DocLayout
      title="Compliance Audit CLI"
      description="Run an NDPA 2023 compliance audit from the command line or CI with the ndpr binary"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What the audit CLI does</h2>
        <p className="mb-4 text-foreground">
          The package ships an <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr</code>{' '}
          binary. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr audit</code> scores a
          compliance config against the toolkit&apos;s engine — the{' '}
          <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">compliance score</Link>{' '}
          plus the GAID 2025{' '}
          <Link href="/docs/guides/dcpmi-registration" className="text-primary hover:underline">DCPMI</Link>,
          Compliance Audit Returns, and{' '}
          <Link href="/docs/guides/breach-notification-completeness" className="text-primary hover:underline">breach-notification</Link>{' '}
          checks — and <strong>exits non-zero when the audit fails</strong>. Drop it into CI as a compliance gate.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">A development gate, not a legal audit</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The CLI measures the completeness of your declared compliance posture. It does not replace a Data Protection
            Impact Assessment or legal advice — verify against current NDPC guidance.
          </p>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# with the toolkit installed, the \`ndpr\` bin is on your PATH:
npx ndpr audit --init        # writes ndpr.audit.json
npx ndpr audit               # run the audit (exit 1 on failure)
npx ndpr audit --min-score 80
npx ndpr audit --config compliance/ndpr.json
npx ndpr audit --json        # machine-readable result

# standalone (no install), use the scoped package name:
npx @tantainnovative/ndpr-toolkit audit --init`}</code></pre>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Flag</th>
                <th className="text-left p-3 border-b border-border">Effect</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr><td className="p-3 border-b border-border"><code>--config &lt;path&gt;</code></td><td className="p-3 border-b border-border">Path to the config (default <code>./ndpr.audit.json</code> or <code>./ndpr.config.json</code>)</td></tr>
              <tr><td className="p-3 border-b border-border"><code>--min-score &lt;n&gt;</code></td><td className="p-3 border-b border-border">Minimum overall compliance score to pass (default 70)</td></tr>
              <tr><td className="p-3 border-b border-border"><code>--json</code></td><td className="p-3 border-b border-border">Emit the full <code>NdprAuditResult</code> as JSON</td></tr>
              <tr><td className="p-3 border-b border-border"><code>--init</code></td><td className="p-3 border-b border-border">Write a starter <code>ndpr.audit.json</code> and exit</td></tr>
              <tr><td className="p-3"><code>--no-color</code></td><td className="p-3">Disable coloured output</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="config" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The config file</h2>
        <p className="mb-4 text-foreground">
          The config is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ minScore?, compliance, dcpmi?, car?, breaches? }`}</code>.
          Only <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">compliance</code> is required;
          the rest enable the corresponding GAID 2025 checks.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`{
  "minScore": 80,
  "compliance": {
    "consent": { "hasConsentMechanism": true, "hasPurposeSpecification": true, "hasWithdrawalMechanism": true, "hasMinorProtection": false, "consentRecordsRetained": true },
    "dsr": { "hasRequestMechanism": true, "supportsAccess": true, "supportsRectification": true, "supportsErasure": false, "supportsPortability": false, "supportsObjection": false, "responseTimelineDays": 30 },
    "dpia": { "conductedForHighRisk": true, "documentedRisks": true, "mitigationMeasures": true },
    "breach": { "hasNotificationProcess": true, "notifiesWithin72Hours": true, "hasRiskAssessment": true, "hasRecordKeeping": true },
    "policy": { "hasPrivacyPolicy": true, "isPubliclyAccessible": true, "lastUpdated": "2026-01-01", "coversAllSections": true },
    "lawfulBasis": { "documentedForAllProcessing": true, "hasLegitimateInterestAssessment": false },
    "crossBorder": { "hasTransferMechanisms": true, "adequacyAssessed": true, "ndpcApprovalObtained": false },
    "ropa": { "maintained": true, "includesAllProcessing": true, "lastReviewed": "2026-01-01" }
  },
  "dcpmi": { "dataSubjectsInSixMonths": 6200 },
  "car": { "commencementDate": "2025-01-15" }
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Critical NDPA gaps and overdue breach notifications <strong>hard-fail</strong> the audit; high-priority gaps
          and approaching CAR deadlines produce warnings.
        </p>
      </section>

      <section id="ci" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">In CI</h2>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# .github/workflows/compliance.yml
name: NDPA compliance
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22 }
      - run: npx ndpr audit --min-score 80`}</code></pre>
        </div>
      </section>

      <section id="programmatic" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Programmatic API</h2>
        <p className="mb-4 text-foreground">
          The same logic is exposed as pure, React-free functions from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/server</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { runNdprAudit, formatNdprAuditReport } from '@tantainnovative/ndpr-toolkit/server';

const result = runNdprAudit({ compliance, dcpmi, car, breaches }, { minScore: 80 });
if (!result.passed) {
  console.error(formatNdprAuditReport(result));
  process.exit(1);
}`}</code></pre>
        </div>
      </section>
    </DocLayout>
  );
}
