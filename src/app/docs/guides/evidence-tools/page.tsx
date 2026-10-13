'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const code = 'bg-card border border-border px-1.5 py-0.5 rounded text-sm';

function Block({ children }: { children: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
      <pre className="text-foreground"><code>{children}</code></pre>
    </div>
  );
}

export default function EvidenceToolsGuide() {
  return (
    <DocLayout
      title="Evidence Tools"
      description="Derived data subjects, Nigerian PII scanning, Section 37 decision receipts, statutory collisions, schema-as-RoPA, and grievance notices. Pure functions from /server, plus CLI commands."
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Why these exist</h2>
        <p className="mb-4 text-foreground">
          The compliance score asks whether you <em>support</em> a right. Regulators and auditors ask what you actually
          did, on what grounds, and who signed it off. These tools turn self-attested booleans into derived, cited and
          reviewable records. Every one is a pure function with no React, exported from{' '}
          <code className={code}>/server</code>, <code className={code}>/core</code> and the package root.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Drafts, not decisions</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Nothing here files with the NDPC, sends to a data subject, or deletes data. Outputs that affect a person are
            drafts that a named reviewer must approve. Not legal advice.
          </p>
        </div>
      </section>

      <section id="derived-subjects" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Derived data subjects</h2>
        <p className="mb-4 text-foreground">
          <code className={code}>estimateDerivedDataSubjects</code> counts the guarantors, next of kin, referees,
          dependants and uploaded phone contacts you hold, and shows your declared DCPMI tier beside the tier you would
          reach if they were counted. It never blends the two. Multipliers are required inputs; there are no built-in
          defaults. Try it at <Link href="/how-many-data-subjects" className="text-primary hover:underline">/how-many-data-subjects</Link>.
        </p>
        <Block>{`const r = estimateDerivedDataSubjects({
  directSubjects: 900,
  relationships: [{ kind: 'guarantor', perDirectSubject: 2, coverage: 0.6 }],
});
r.tiers.declared.tier;    // 'OHL'
r.tiers.withDerived.tier; // 'EHL'

// npx ndpr dcpmi --direct 900 --relations guarantor:2:0.6 --revenue 500000000`}</Block>
        <p className="mb-4 text-foreground">
          <code className={code}>estimateStatutoryCeiling</code> returns the NDPA Section 48(4) maximum from a pinnable
          ruleset, always labelled as a ceiling and never a forecast.
        </p>
      </section>

      <section id="pii-scan" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Nigerian PII detection and ndpr scan</h2>
        <p className="mb-4 text-foreground">
          <code className={code}>detectNigerianPII</code> finds Nigerian mobile numbers, NIN/BVN-shaped numbers, NUBAN
          account numbers, Luhn-valid cards, CAC numbers, plates and emails. NIN and BVN cannot be told apart or proven by
          pattern, so they report low confidence unless nearby text names them. <code className={code}>validateNuban</code>{' '}
          applies the CBN check digit when you know the bank code. Redaction is masking, not anonymisation.
        </p>
        <Block>{`npx ndpr scan src --fail-on high          # pre-commit or CI gate, any stack
npx ndpr scan . --types national_id,nuban --json`}</Block>
      </section>

      <section id="decision-receipts" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Section 37 decision receipts</h2>
        <p className="mb-4 text-foreground">
          <code className={code}>issueDecisionReceipt</code> gives a person subject to a solely automated decision an
          8-character code to quote when asking for human review. You must state the legal basis; the toolkit never
          chooses it. The SMS never includes the outcome. <code className={code}>decisionContestRequest</code> turns a
          receipt into an <code className={code}>automated_decision_making</code> request in your normal DSR queue.
        </p>
      </section>

      <section id="collisions" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Statutory collisions</h2>
        <p className="mb-4 text-foreground">
          <code className={code}>resolveDsrOutcome</code> partitions a request&apos;s data categories into act now, hold
          (with an end date and cited grounds) and needs human review, and drafts the letter. Grounds come from a register
          of <code className={code}>StatutoryExceptionRow</code>s. Only rows marked <code className={code}>reviewed</code>,
          with a named reviewer, a verbatim quote and a source, can produce a hold. The two starter rows ship{' '}
          <code className={code}>unverified</code> and only route requests to a person.
        </p>
        <Block>{`const draft = resolveDsrOutcome(
  { id: 'dsr_1', type: 'erasure', sector: 'banking', dataCategories: ['marketing_preferences', 'kyc_identity'] },
  { register: myReviewedRegister, asOf: '2026-10-13' },
);
draft.proposed;        // 'partially_fulfil'
draft.requiresSignOff; // always true`}</Block>
        <p className="mb-4 text-foreground">
          <code className={code}>planRetention</code> returns per-record retain, review-for-deletion, statutory-hold or
          needs-review decisions. It never deletes.
        </p>
      </section>

      <section id="schema-ropa" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Schema-as-RoPA</h2>
        <p className="mb-4 text-foreground">
          Annotate personal-data columns once in your Prisma schema. The lint fails unannotated personal-looking fields and
          annotations missing a category, purpose, basis or retention period; it never infers them. The generator turns
          valid annotations into draft RoPA entries marked <code className={code}>asserted</code> for review.
        </p>
        <Block>{`/// @ndpr subject=customer purpose=kyc basis=legal_obligation retain=P5Y
model Customer {
  /// @ndpr category=identifier.bvn processor=smile-identity
  bvn String
  /// @ndpr none
  riskBand Int
}

// npx ndpr schema lint prisma/schema.prisma
// npx ndpr schema ropa prisma/schema.prisma --json`}</Block>
      </section>

      <section id="grievances" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Grievance notices</h2>
        <p className="mb-4 text-foreground">
          <code className={code}>composeGrievancePacket</code> writes a data subject&apos;s notice to a controller, modelled
          on the Standard Notice to Address Grievance in NDPC GAID 2025 Article 40 and Schedule 9, with the matching
          requests attached and renderings for email, WhatsApp and SMS. It needs only a name and a phone or email.{' '}
          <code className={code}>draftSection46Complaint</code> drafts a complaint to the Commission only after the
          decision date and only with the subject&apos;s confirmation. Try it at{' '}
          <Link href="/report-am" className="text-primary hover:underline">/report-am</Link>.
        </p>
      </section>
    </DocLayout>
  );
}
