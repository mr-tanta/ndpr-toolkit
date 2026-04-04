'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function LawfulBasisGuide() {
  return (
    <DocLayout
      title="Lawful Basis for Processing"
      description="Understanding and documenting lawful basis for processing personal data under NDPA 2023 Section 25"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/lawful-basis">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs/components/lawful-basis-tracker">
            Component Docs
          </Link>
        </Button>
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
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">1. Consent</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              The data subject has given clear, informed consent to the processing of their personal data for one or more
              specific purposes. Consent must be freely given, specific, informed, and unambiguous.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">2. Contractual Necessity</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Processing is necessary for the performance of a contract to which the data subject is a party, or in order
              to take steps at the request of the data subject prior to entering into a contract.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">3. Legal Obligation</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Processing is necessary for compliance with a legal obligation to which the controller is subject, such as
              tax reporting or anti-money laundering requirements.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">4. Vital Interests</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Processing is necessary to protect the vital interests of the data subject or another natural person,
              typically in life-or-death or emergency medical situations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">5. Public Interest</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Processing is necessary for the performance of a task carried out in the public interest or in the exercise
              of official authority vested in the controller.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">6. Legitimate Interests</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Processing is necessary for the legitimate interests of the controller or a third party, except where such
              interests are overridden by the rights and freedoms of the data subject. A balancing test is required.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How to Determine the Right Lawful Basis</h2>
        <ol className="list-decimal pl-6 space-y-3">
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
          The NDPR Toolkit provides the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">LawfulBasisTracker</code> component
          and <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">useLawfulBasis</code> hook
          to guide you through the assessment process:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit';

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
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scenario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likely Lawful Basis</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Processing an online order</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Contractual Necessity</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Needed to fulfil the contract</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Sending marketing emails</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Consent</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Opt-in required</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Tax record keeping</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Legal Obligation</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Required by Nigerian tax law</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Fraud prevention</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Legitimate Interests</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Requires balancing test</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Emergency contact in health crisis</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Vital Interests</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Narrow scope only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Lawful Basis Tracker Component</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Full API reference and component documentation.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/lawful-basis-tracker">
                  View Docs
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPC Website</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Official guidance from the Nigeria Data Protection Commission.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  Visit NDPC
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
