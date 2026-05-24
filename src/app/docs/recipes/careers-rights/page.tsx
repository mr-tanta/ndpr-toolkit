'use client';

import Link from 'next/link';
import { DocLayout } from '../../components/DocLayout';

export default function CareersRightsRecipe() {
  return (
    <DocLayout
      title="Careers / Applicant Data Rights"
      description="NDPA-compliant handling of job applicant data — legitimate-interest basis, retention, erasure on request, automated CV-screening disclosure."
    >
      <p className="mb-6 text-base text-muted-foreground">
        Applicant data is one of the highest-risk processing activities Nigerian companies do — you collect CVs, government IDs (NIN), salary history, and sometimes do automated screening (Section 37). NDPC has flagged careers / HR data as a top audit area. The good news: the toolkit handles the pieces you actually need.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Lawful basis</h2>
      <p className="mb-4">
        For active applications, the lawful basis is usually <strong>contract steps under Section 25(1)(b)</strong> (the applicant initiated the process). For unsolicited CVs or talent-pool retention beyond the active role, use <strong>legitimate interest under Section 25(1)(f)</strong> — but you must complete a Legitimate Interest Assessment (LIA). The toolkit&apos;s lawful-basis tracker generates an LIA template:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`import { LawfulBasisTracker } from '@tantainnovative/ndpr-toolkit';

<LawfulBasisTracker
  defaultActivities={[
    {
      id: 'careers-active-application',
      name: 'Active job application processing',
      lawfulBasis: 'contract',
      lawfulBasisJustification:
        'Processing CV and contact details to evaluate the applicant for the role they applied to (Section 25(1)(b)).',
      retentionPeriod: '12 months from rejection or 6 years if hired (statutory employment record).',
    },
    {
      id: 'careers-talent-pool',
      name: 'Talent pool — retained for future roles',
      lawfulBasis: 'legitimate_interests',
      lawfulBasisJustification:
        'Maintain a pool of pre-screened candidates for future roles. LIA: balance between recruiter efficiency and applicant expectation. Applicants opted-in to inclusion.',
      retentionPeriod: '24 months from last application activity.',
    },
  ]}
/>`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Retention policy</h2>
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li><strong>Successful candidate</strong>: CV + interview notes become employment records, retained for at least 6 years post-employment (Labour Act + Tax obligations).</li>
        <li><strong>Rejected applicant, no talent-pool opt-in</strong>: delete CV + notes within 6 months of the role closing. Section 24(1)(e) — storage limitation.</li>
        <li><strong>Rejected applicant, talent-pool opt-in</strong>: keep up to 24 months, then ask for refresh consent before extending.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Right to erasure (Section 34(1)(d))</h2>
      <p className="mb-4">
        When a rejected applicant requests erasure, you must comply unless you have an active legal claim (e.g. an ongoing discrimination complaint). The DSR portal handles this:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets/dsr';

// Public-facing DSR portal for applicants
export default function ApplicantRightsPortal() {
  return (
    <NDPRSubjectRights
      submitTo="/api/applicants/dsr"
      submitOptions={{ credentials: 'same-origin' }}
      onSubmitError={({ error, response }) => {
        console.error('DSR submit failed', error, response?.status);
        alert('Submission failed. Please email dpo@example.com directly.');
      }}
    />
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Automated CV screening (Section 37)</h2>
      <p className="mb-4">
        If you use any ATS (Applicant Tracking System) with automated CV scoring, keyword filtering, or AI-based shortlisting, Section 37 kicks in. You must:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Disclose the automated processing exists (in your careers privacy notice)</li>
        <li>Explain &quot;meaningful information about the logic involved&quot; — what factors it weighs</li>
        <li>Provide a human-review path before any adverse decision (rejection)</li>
        <li>Offer the right to contest the decision</li>
      </ul>
      <p className="mt-4">A short careers-page disclosure is enough:</p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`<aside className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 mb-6">
  <strong>Automated screening notice (NDPA Section 37).</strong> We use an
  ATS that performs keyword matching on submitted CVs to surface candidates
  whose experience aligns with the role requirements. Final shortlist
  decisions are made by our recruiting team, not by the ATS. If you'd
  prefer manual review without automated pre-screening, mention this in
  your cover letter or email{' '}
  <a href="mailto:talent@example.com" className="underline">talent@example.com</a>.
</aside>`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Related</h2>
      <ul className="space-y-2">
        <li><Link href="/docs/components/lawful-basis-tracker" className="text-primary hover:underline">Lawful Basis Tracker — LIA template</Link></li>
        <li><Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">DSR portal — full API reference</Link></li>
        <li><Link href="/docs/recipes/admin-dsr-management" className="text-primary hover:underline">Admin DSR Management recipe (DPO-side workflow)</Link></li>
      </ul>
    </DocLayout>
  );
}
