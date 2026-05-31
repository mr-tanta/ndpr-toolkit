'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function DCPMIRegistrationGuide() {
  return (
    <DocLayout
      title="DCPMI Registration & Compliance Audit Returns"
      description="Classify Data Controllers/Processors of Major Importance and schedule NDPC Compliance Audit Returns under GAID 2025"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What this covers</h2>
        <p className="mb-4 text-foreground">
          The NDPC <strong>General Application and Implementation Directive (GAID) 2025</strong> requires organisations
          that qualify as a <strong>Data Controller/Processor of Major Importance (DCPMI)</strong> to register with the
          Commission and pay an annual fee tied to their tier. <strong>UHL and EHL</strong> organisations register once
          and file <strong>Compliance Audit Returns (CAR)</strong> — an initial audit within 15 months of commencing
          processing, then an annual return; <strong>OHL</strong> organisations renew their registration annually instead.
        </p>
        <p className="mb-4 text-foreground">
          The toolkit ships two pure utilities for this regime —{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classifyDCPMI()</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">generateComplianceAuditReturn()</code>{' '}
          — plus the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDCPMI</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useComplianceAuditReturn</code> hooks.
          They carry no React dependency, so they run equally well in a Server Action, a route handler, or a scheduled job.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Not legal advice</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            These utilities compute registration tiers and filing dates from the September 2025 GAID baseline. The NDPC
            revises classification metrics and extends filing deadlines — always verify against current NDPC guidance
            before relying on the output. Thresholds, fees, and deadlines are all configurable for this reason.
          </p>
        </div>
      </section>

      <section id="classify-dcpmi" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Classifying a DCPMI</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classifyDCPMI()</code> takes the
          number of distinct data subjects processed in the relevant six-month window and returns the tier, the annual
          registration fee, and the filing obligations:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { classifyDCPMI } from '@tantainnovative/ndpr-toolkit/core';

const result = classifyDCPMI({ dataSubjectsInSixMonths: 6200 });

result.tier;                                // "UHL"
result.isDCPMI;                             // true
result.annualFeeNGN;                        // 250000
result.registration.required;              // true
result.registration.renewsAnnually;        // false — UHL/EHL register once, file CAR yearly
result.compliance.auditReturnsAnnual;      // true
result.compliance.initialAuditWithinMonths; // 15
result.dataSubjectsConsidered;             // 6200`}</code></pre>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Tiers (September 2025 GAID baseline)</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Tier</th>
                <th className="text-left p-3 border-b border-border">Data subjects / 6 months</th>
                <th className="text-left p-3 border-b border-border">Annual fee (₦)</th>
                <th className="text-left p-3 border-b border-border">Registration</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr>
                <td className="p-3 border-b border-border font-medium">UHL — Ultra High Level</td>
                <td className="p-3 border-b border-border">more than 5,000</td>
                <td className="p-3 border-b border-border">250,000</td>
                <td className="p-3 border-b border-border">Register once + CAR annually</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border font-medium">EHL — Extra High Level</td>
                <td className="p-3 border-b border-border">1,000 – 5,000</td>
                <td className="p-3 border-b border-border">100,000</td>
                <td className="p-3 border-b border-border">Register once + CAR annually</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border font-medium">OHL — Ordinary High Level</td>
                <td className="p-3 border-b border-border">200 – 999</td>
                <td className="p-3 border-b border-border">10,000</td>
                <td className="p-3 border-b border-border">Renews annually</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">below 200</td>
                <td className="p-3">—</td>
                <td className="p-3">—</td>
                <td className="p-3">Not a DCPMI by volume</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          Boundaries resolve so that the 1,000 mark is EHL (OHL is 200–999) and UHL is strictly greater than 5,000
          (5,000 itself is EHL). For an organisation the Commission has separately listed as a DCPMI below the volume
          tiers, pass <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ isDesignated: true }`}</code> —
          it resolves to the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;listed&apos;</code> tier with a
          note to confirm the applicable fee with the NDPC.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Overriding thresholds and fees</h3>
        <p className="mb-4 text-foreground">
          Treat the defaults as the September 2025 baseline, not a constant. Pass overrides as the metrics evolve:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`classifyDCPMI(
  { dataSubjectsInSixMonths: 3000 },
  {
    thresholds: { ohl: 200, ehl: 1000, uhl: 5000 },
    fees: { UHL: 250000, EHL: 100000, OHL: 10000 },
  },
);`}</code></pre>
        </div>
      </section>

      <section id="compliance-audit-returns" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Scheduling Compliance Audit Returns</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">generateComplianceAuditReturn()</code>{' '}
          derives the CAR schedule for a DCPMI: the initial-audit due date (commencement + 15 months) and the next
          annual filing deadline relative to a reference date. The NDPC baseline deadline is 31 March, filed via the{' '}
          <strong>NDPC Information Management Portal (NIMP)</strong>.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { generateComplianceAuditReturn } from '@tantainnovative/ndpr-toolkit/core';

const car = generateComplianceAuditReturn({
  commencementDate: '2025-01-15',
  asOf: '2026-03-21',
  tier: 'UHL',
});

car.applicable;                       // true
car.schedule.initialAuditDueDate;     // "2026-04-15"  (commencement + 15 months)
car.schedule.nextFilingDeadline;      // "2026-03-31"
car.schedule.filingYear;              // 2026
car.status.daysUntilNextDeadline;     // 10
car.status.initialAuditDue;           // false
car.notes;                            // GAID/NIMP guidance strings`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Once <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">asOf</code> passes the
          deadline, the schedule rolls to the next year automatically. Omit{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">asOf</code> to evaluate against
          today, and omit <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">tier</code> to
          assume the organisation is in scope.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Deadline overrides</h3>
        <p className="mb-4 text-foreground">
          NDPC deadlines shift — the 2026 filing was extended to 30 May. Supply per-year overrides so your schedule
          tracks the current notice:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`generateComplianceAuditReturn(
  { commencementDate: '2025-01-15', asOf: '2026-04-01', tier: 'UHL' },
  { deadlineOverrides: { 2026: '2026-05-30' } },
).schedule.nextFilingDeadline;        // "2026-05-30"`}</code></pre>
        </div>
      </section>

      <section id="hooks" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">React hooks</h2>
        <p className="mb-4 text-foreground">
          For client UIs, both utilities ship as memoised hooks from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/hooks</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { useDCPMI, useComplianceAuditReturn } from '@tantainnovative/ndpr-toolkit/hooks';

function RegistrationStatus() {
  const dcpmi = useDCPMI({ dataSubjectsInSixMonths: 6200 });
  const car = useComplianceAuditReturn({
    commencementDate: '2025-01-15',
    tier: dcpmi.tier,
  });

  return (
    <dl>
      <dt>Tier</dt><dd>{dcpmi.tier}</dd>
      <dt>Annual fee</dt><dd>₦{dcpmi.annualFeeNGN.toLocaleString()}</dd>
      <dt>Next CAR deadline</dt><dd>{car.schedule.nextFilingDeadline}</dd>
    </dl>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 text-foreground space-y-2">
          <li>
            <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">
              Compliance Score
            </Link>{' '}
            — score your technical posture across all 8 NDPA modules; pair it with the CAR schedule when preparing an audit.
          </li>
          <li>
            <Link href="/docs/guides/ndpr-compliance-checklist" className="text-primary hover:underline">
              NDPA 2023 Compliance Checklist
            </Link>{' '}
            — the broader obligations a DCPMI must evidence.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
