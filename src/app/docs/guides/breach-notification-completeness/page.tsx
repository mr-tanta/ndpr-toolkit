'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function BreachNotificationCompletenessGuide() {
  return (
    <DocLayout
      title="Breach Notification Completeness"
      description="Check a breach report against NDPA 2023 Section 40 and NDPC GAID 2025 Article 33 — mandated content, the 72-hour deadline, and the data-subject communication duty"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What this covers</h2>
        <p className="mb-4 text-foreground">
          <strong>NDPA 2023 Section 40(2)</strong> requires a data controller to notify the NDPC within{' '}
          <strong>72 hours</strong> of becoming aware of a personal data breach that is likely to result in a risk to
          data subjects&apos; rights and freedoms. <strong>NDPC GAID 2025 Article 33(5)</strong> then enumerates the
          content that notification must include, and <strong>Section 40(3)</strong> adds a duty to communicate the
          breach to affected data subjects — in plain, clear language — where the risk is high.
        </p>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">assessBreachNotification()</code>{' '}
          checks a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">BreachReport</code>{' '}
          against those requirements: which mandated items are present, whether the 72-hour window is still open, and
          whether a data-subject communication is owed. It is a pure function with no React dependency, and ships as the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useBreachNotificationAssessment</code>{' '}
          hook for client UIs.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">A completeness aid, not legal advice</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The checker verifies that your breach record contains the information the NDPC expects and tracks the
            statutory clock. It does not decide whether a breach is notifiable or replace your DPO&apos;s judgement —
            verify against current NDPC guidance.
          </p>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using assessBreachNotification()</h2>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { assessBreachNotification } from '@tantainnovative/ndpr-toolkit/core';

const result = assessBreachNotification(breachReport, {
  asOf: Date.now(),
  assessment: riskAssessment,   // optional — high risk triggers the S.40(3) duty
  notification: regulatoryNotification, // optional — judges timeliness against sentAt
});

result.complete;                 // false until every mandated item is present
result.completeness;             // 0–100 across applicable items
result.missing;                  // labels of unsatisfied items
result.recommendations;          // actionable steps, each citing its provision`}</code></pre>
        </div>
      </section>

      <section id="content-checklist" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The content checklist</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">result.notificationToCommission</code>{' '}
          is an array of items, each with an <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">id</code>,{' '}
          a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">label</code>, the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">section</code> it derives from, and
          whether it is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">satisfied</code>:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-3 border-b border-border">Item</th>
                <th className="text-left p-3 border-b border-border">Source</th>
                <th className="text-left p-3 border-b border-border">BreachReport field</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr><td className="p-3 border-b border-border">Circumstances of the breach</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(a)</td><td className="p-3 border-b border-border"><code>description</code></td></tr>
              <tr><td className="p-3 border-b border-border">Date / time period</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(b)</td><td className="p-3 border-b border-border"><code>occurredAt</code></td></tr>
              <tr><td className="p-3 border-b border-border">Personal data involved</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(c)</td><td className="p-3 border-b border-border"><code>dataTypes</code></td></tr>
              <tr><td className="p-3 border-b border-border">Risk of harm</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(d)</td><td className="p-3 border-b border-border"><code>likelyConsequences</code></td></tr>
              <tr><td className="p-3 border-b border-border">Number at risk</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(e)</td><td className="p-3 border-b border-border"><code>estimatedAffectedSubjects</code></td></tr>
              <tr><td className="p-3 border-b border-border">Steps to reduce harm</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(f)</td><td className="p-3 border-b border-border"><code>mitigationMeasures</code></td></tr>
              <tr><td className="p-3 border-b border-border">Steps to notify subjects</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(g)</td><td className="p-3 border-b border-border"><code>initialActions</code></td></tr>
              <tr><td className="p-3 border-b border-border">Contact point</td><td className="p-3 border-b border-border">GAID 2025 Art. 33(5)(h)</td><td className="p-3 border-b border-border"><code>dpoContact</code></td></tr>
              <tr><td className="p-3 border-b border-border">Categories of data subjects</td><td className="p-3 border-b border-border">NDPA S. 40(2)</td><td className="p-3 border-b border-border"><code>dataSubjectCategories</code></td></tr>
              <tr><td className="p-3">Approximate record count</td><td className="p-3">NDPA S. 40(2)</td><td className="p-3"><code>approximateRecordCount</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="timing" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The 72-hour clock</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">result.timing</code> tracks the
          statutory window from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">discoveredAt</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`result.timing.deadline;                   // discoveredAt + 72h
result.timing.hoursRemaining;             // time left (negative once overdue)
result.timing.overdue;                    // true once the window has passed
result.timing.notified;                   // whether a notification was recorded
result.timing.requiresDelayJustification; // late filings must state the reason`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Pass <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">deadlineHours</code> to
          override the window. Where complete details aren&apos;t available within 72 hours, the NDPC permits phased
          reporting — the checker surfaces this in its recommendations rather than treating the filing as failed.
        </p>
      </section>

      <section id="high-risk" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">High-risk: communicating to data subjects</h2>
        <p className="mb-4 text-foreground">
          When the risk is high — set explicitly via{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ highRisk: true }`}</code> or
          derived from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">assessment.highRisksToRightsAndFreedoms</code>{' '}
          — <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dataSubjectCommunicationRequired</code>{' '}
          becomes <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code> and a second
          checklist (<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">dataSubjectCommunication</code>)
          covers the Section 40(3) communication: nature and context, likely consequences, safeguards and measures, and
          a contact point — all in plain, clear language. These items count toward{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">complete</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">completeness</code> when required.
        </p>
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 text-foreground space-y-2">
          <li>
            <Link href="/docs/guides/breach-notification-process" className="text-primary hover:underline">
              Breach Notification Process
            </Link>{' '}
            — the end-to-end workflow and components for capturing and reporting a breach.
          </li>
          <li>
            <Link href="/docs/guides/compliance-score" className="text-primary hover:underline">
              Compliance Score
            </Link>{' '}
            — scores your breach-readiness alongside the other seven NDPA modules.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
