'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function LawfulBasisGuide() {
  return (
    <DocLayout
      title="Lawful Basis for Processing"
      description="Understanding and documenting lawful basis for processing personal data under NDPA 2023 Section 25"
    >
      <div className="flex mb-6 space-x-2">
        <Link
          href="/ndpr-demos/lawful-basis"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          View Demo
        </Link>
        <Link
          href="/docs/components/lawful-basis-tracker"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          Component Docs
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="mb-4">
          The Nigeria Data Protection Act 2023 (NDPA) requires that every processing of personal data must be based on
          a valid lawful basis. This guide explains the six lawful bases available under the NDPA, how to determine
          which basis applies, and how to use the NDPR Toolkit to document your decisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The Six Lawful Bases Under NDPA 2023</h2>
        <p className="mb-4">Section 25 of the NDPA 2023 establishes six lawful bases for processing personal data:</p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">1. Consent</h3>
            <p className="text-muted-foreground text-sm">
              The data subject has given clear, informed consent to the processing of their personal data for one or more
              specific purposes. Consent must be freely given, specific, informed, and unambiguous.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">2. Contractual Necessity</h3>
            <p className="text-muted-foreground text-sm">
              Processing is necessary for the performance of a contract to which the data subject is a party, or in order
              to take steps at the request of the data subject prior to entering into a contract.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">3. Legal Obligation</h3>
            <p className="text-muted-foreground text-sm">
              Processing is necessary for compliance with a legal obligation to which the controller is subject, such as
              tax reporting or anti-money laundering requirements.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">4. Vital Interests</h3>
            <p className="text-muted-foreground text-sm">
              Processing is necessary to protect the vital interests of the data subject or another natural person,
              typically in life-or-death or emergency medical situations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">5. Public Interest</h3>
            <p className="text-muted-foreground text-sm">
              Processing is necessary for the performance of a task carried out in the public interest or in the exercise
              of official authority vested in the controller.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2 text-foreground">6. Legitimate Interests</h3>
            <p className="text-muted-foreground text-sm">
              Processing is necessary for the legitimate interests of the controller or a third party, except where such
              interests are overridden by the rights and freedoms of the data subject. A balancing test is required.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How to Determine the Right Lawful Basis</h2>
        <ol className="list-decimal pl-6 space-y-3 text-foreground">
          <li>
            <strong>Identify the purpose:</strong> Clearly define why you need to process the personal data.
          </li>
          <li>
            <strong>Consider the context:</strong> Look at the nature of the data, the relationship with the data subject,
            and the expectations of the data subject.
          </li>
          <li>
            <strong>Evaluate each basis:</strong> Work through the six lawful bases and identify which one genuinely applies.
            Do not simply default to consent if another basis is more appropriate.
          </li>
          <li>
            <strong>Document your decision:</strong> Record the chosen lawful basis and your reasoning using the Lawful Basis Tracker component.
          </li>
          <li>
            <strong>Inform data subjects:</strong> Include the lawful basis in your privacy notice for each processing purpose.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using the Lawful Basis Tracker</h2>
        <p className="mb-4">
          The NDPR Toolkit provides the <code className="bg-card border border-border px-1 py-0.5 rounded text-sm text-foreground">LawfulBasisTracker</code> component
          and <code className="bg-card border border-border px-1 py-0.5 rounded text-sm text-foreground">useLawfulBasis</code> hook
          to guide you through the assessment process:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground text-sm"><code>{`import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit';

function LawfulBasisPage() {
  const { activities, addActivity, getSummary } = useLawfulBasis();

  return (
    <LawfulBasisTracker
      activities={activities}
      onAddActivity={addActivity}
      summary={getSummary()}
    />
  );
}`}</code></pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Common Scenarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Scenario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Likely Lawful Basis</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Processing an online order</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Contractual Necessity</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Needed to fulfil the contract</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Sending marketing emails</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Consent</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Opt-in required</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Tax record keeping</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Legal Obligation</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Required by Nigerian tax law</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Fraud prevention</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Legitimate Interests</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Requires balancing test</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Emergency contact in health crisis</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Vital Interests</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Narrow scope only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-2">Lawful Basis Tracker Component</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Full API reference and component documentation.
            </p>
            <Link
              href="/docs/components/lawful-basis-tracker"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
            >
              View Docs
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-2">NDPC Website</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Official guidance from the Nigeria Data Protection Commission.
            </p>
            <a
              href="https://ndpc.gov.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
            >
              Visit NDPC
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
