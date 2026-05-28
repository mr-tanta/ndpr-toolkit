'use client';

import { DocLayout } from '@/components/docs/DocLayout';

export default function MigratingFrom41To50Guide() {
  return (
    <DocLayout
      title="Migrating from 4.1.x to 5.0.0"
      description="Four breaking changes — all aliased and dev-warned in 4.1.0. If your 4.1.x dev console is clean, your 5.0 upgrade is a one-line bump."
    >
      <section id="tldr" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">TL;DR</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          5.0 closes the deprecation window opened by 4.1.0. Every removal here was already deprecated and dev-warned a minor release ago, so the upgrade path is:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>On 4.1.x, run your dev server. Any deprecated prop, callback, or function fires a one-shot <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">[ndpr-toolkit/&lt;module&gt;]</code> warning in the console.</li>
          <li>Fix each warning at its callsite.</li>
          <li>Bump to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^5.0.0</code>.</li>
        </ol>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`pnpm up @tantainnovative/ndpr-toolkit@^5.0.0
# or
bun add @tantainnovative/ndpr-toolkit@^5.0.0
# or
npm install @tantainnovative/ndpr-toolkit@^5.0.0`}</code>
        </pre>
        <p className="text-foreground leading-relaxed">
          If you skipped 4.1, read the 4.1 release notes first — every removal here had a one-minor window where both shapes worked, but a 4.0 → 5.0 jump means making the changes blind.
        </p>
      </section>

      <section id="changes" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The breaking changes</h2>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Uniform list-manager callbacks: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onAdd</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onUpdate</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onArchive</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The three list-manager components and the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useROPA</code> hook each had module-specific callback names. 4.1 added uniform <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onAdd</code>/<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onUpdate</code>/<code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onArchive</code> names alongside the legacy ones. 5.0 drops the legacy names entirely.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Component / Hook</th>
                <th className="text-left py-2 pr-4 font-semibold">Removed (4.x)</th>
                <th className="text-left py-2 font-semibold">Use instead (5.0)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>LawfulBasisTracker</code></td>
                <td className="py-2 pr-4"><code>onAddActivity</code> / <code>onUpdateActivity</code> / <code>onArchiveActivity</code></td>
                <td className="py-2"><code>onAdd</code> / <code>onUpdate</code> / <code>onArchive</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>CrossBorderTransferManager</code></td>
                <td className="py-2 pr-4"><code>onAddTransfer</code> / <code>onUpdateTransfer</code> / <code>onRemoveTransfer</code></td>
                <td className="py-2"><code>onAdd</code> / <code>onUpdate</code> / <code>onArchive</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>ROPAManager</code></td>
                <td className="py-2 pr-4"><code>onAddRecord</code> / <code>onUpdateRecord</code> / <code>onArchiveRecord</code></td>
                <td className="py-2"><code>onAdd</code> / <code>onUpdate</code> / <code>onArchive</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>useROPA</code> options</td>
                <td className="py-2 pr-4"><code>onRecordAdd</code> / <code>onRecordUpdate</code> / <code>onRecordArchive</code></td>
                <td className="py-2"><code>onAdd</code> / <code>onUpdate</code> / <code>onArchive</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (4.x)
<LawfulBasisTracker
  activities={activities}
  onAddActivity={handleAdd}
  onUpdateActivity={handleUpdate}
  onArchiveActivity={handleArchive}
/>

// After (5.0)
<LawfulBasisTracker
  activities={activities}
  onAdd={handleAdd}
  onUpdate={handleUpdate}
  onArchive={handleArchive}
/>`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Note: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">CrossBorderTransferManager</code>&apos;s legacy callback was <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onRemoveTransfer</code> but the canonical name is <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onArchive</code> — the NDPA prefers soft-delete with audit trails over hard removal, and the new name matches what the component actually does.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">2. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRDPIA</code>: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete(answers)</code> → <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onResult(result)</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The 4.x <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onComplete</code> callback fired with just the raw answer map, throwing away the computed risk assessment. The new <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">onResult</code> receives the full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DPIAResult</code> — overall risk level, can-proceed verdict, conclusion, recommendations — so consumers can branch on outcome without re-running the assessment.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (4.x)
<NDPRDPIA
  sections={sections}
  onComplete={(answers) => {
    // had to re-run assessDPIARisk() yourself to get risk score
    const result = assessDPIARisk(answers);
    if (result.overallRiskLevel === 'high') notifyDpo(result);
  }}
/>

// After (5.0)
<NDPRDPIA
  sections={sections}
  onResult={(result) => {
    if (result.overallRiskLevel === 'high') notifyDpo(result);
    // result.answers, result.overallRiskLevel, result.canProceed,
    // result.conclusion, result.recommendations all available
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">3. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLite</code>: <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">records</code> → <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ropa</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManagerLite</code> previously took a flat <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">records: ProcessingRecord[]</code>. The full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ROPAManager</code> takes a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ropa: RecordOfProcessingActivities</code> object (records + metadata). 5.0 unifies the API on the richer shape.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (4.x)
<ROPAManagerLite records={records} />

// After (5.0)
<ROPAManagerLite
  ropa={{
    records,
    lastUpdated: Date.now(),
    version: '1.0',
    // ...other RecordOfProcessingActivities metadata
  }}
/>`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Validators return structured errors, not English strings</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Four validator functions were renamed to drop the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">Structured</code> suffix and their legacy string-returning counterparts were removed. The new shape returns <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`{ valid; errors: Array<{ field, code, message }>; data? }`}</code> — locale-independent and switch-able on stable codes.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Removed (4.x)</th>
                <th className="text-left py-2 font-semibold">Use instead (5.0)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>validateConsent</code></td>
                <td className="py-2"><code>validateConsentStructured</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>validateConsentOptions</code></td>
                <td className="py-2"><code>validateConsentOptionsStructured</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>validateDsrSubmission</code></td>
                <td className="py-2"><code>validateDsrSubmissionStructured</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>formatDSRRequest</code></td>
                <td className="py-2"><code>formatDSRRequestStructured</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (4.x) — Next.js Route Handler
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';

export async function POST(req: Request) {
  const { valid, errors, data } = validateDsrSubmission(await req.json());
  if (!valid) {
    // errors is Record<string, string> of English messages
    return Response.json({ errors }, { status: 422 });
  }
  await dsrStore.create(data);
  return Response.json({ ok: true }, { status: 201 });
}

// After (5.0)
import { validateDsrSubmissionStructured } from '@tantainnovative/ndpr-toolkit/server';

export async function POST(req: Request) {
  const { valid, errors, data } = validateDsrSubmissionStructured(await req.json());
  if (!valid) {
    // errors is Array<{ field, code, message }> — switch on \`code\`
    return Response.json({ errors }, { status: 422 });
  }
  await dsrStore.create(data);
  return Response.json({ ok: true }, { status: 201 });
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          The error <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">code</code> values are stable and locale-independent — branch on them in client code instead of regex-matching English. Each validator&apos;s complete list of emitted codes is documented in its JSDoc.
        </p>
      </section>

      <section id="not-changing" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What hasn&apos;t changed</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>Peer dependency range: still <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">react ^18 || ^19</code>.</li>
          <li>Subpath exports: all 22 still resolve in ESM + CJS + TS.</li>
          <li>Locales: same seven shipped (en, yo, ig, ha, pcm, ar, fr).</li>
          <li>The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code> / <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRThemeProvider</code> APIs.</li>
          <li>The cookie / localStorage / api / memory adapter contracts.</li>
          <li>The Lite variant set (consent, lawful-basis, cross-border, ROPA).</li>
        </ul>
      </section>

      <section id="upgrade-checklist" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Upgrade checklist</h2>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>Pin to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^4.1.0</code> if you&apos;re not already.</li>
          <li>Run your test suite and dev server. Watch the console for <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">[ndpr-toolkit/...]</code> deprecation warnings.</li>
          <li>For each warning, fix the callsite using the tables above.</li>
          <li>Re-run tests until the console is clean.</li>
          <li>Bump to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">^5.0.0</code>.</li>
          <li>Re-run tests one more time.</li>
        </ol>
        <p className="text-foreground leading-relaxed">
          Stuck? Open an issue at <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" className="text-primary hover:underline">github.com/mr-tanta/ndpr-toolkit/issues</a>.
        </p>
      </section>
    </DocLayout>
  );
}
