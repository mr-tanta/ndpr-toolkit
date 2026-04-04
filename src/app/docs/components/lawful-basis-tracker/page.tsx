'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LawfulBasisTrackerDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Lawful Basis Tracker — NDPA Toolkit Documentation',
    description: 'Track and document the lawful basis for every data processing activity under NDPA 2023',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Lawful Basis Tracker"
      description="Track and document the lawful basis for every data processing activity under NDPA 2023"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 space-x-2">
        <Badge variant="success" className="text-xs">New in v2.1</Badge>
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/lawful-basis">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/lawful-basis" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>

      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Lawful Basis Tracker component helps organisations identify, document, and maintain records of the lawful basis
          for each data processing activity. Under the Nigeria Data Protection Act 2023 (NDPA), every processing of personal
          data must be grounded in a valid lawful basis as defined in Section 25.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Section 25 &mdash; Lawful Basis for Processing</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            The NDPA 2023 requires that personal data shall only be processed if at least one of the following applies:
            consent of the data subject, performance of a contract, compliance with a legal obligation, protection of vital interests,
            performance of a task carried out in the public interest, or legitimate interests of the controller (subject to the rights of the data subject).
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Lawful Basis Tracker components:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Import from the main package:</p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>{`import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit';

// Utility functions
import {
  validateProcessingActivity,
  getLawfulBasisDescription,
  assessComplianceGaps,
  generateLawfulBasisSummary,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Lawful Basis Tracker provides a component and hook for managing lawful basis records:
        </p>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">LawfulBasisTracker</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A comprehensive component for tracking and documenting the lawful basis for each data processing activity.
              It provides a UI for adding, editing, and reviewing processing activities with their associated lawful basis.
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
          </div>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">LawfulBasisTracker Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">processingActivity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">ProcessingActivity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">The processing activity to assess</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onComplete</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(result: LawfulBasisResult) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Called when the assessment is completed</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onSave</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(draft: Partial<LawfulBasisResult>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Called when a draft is saved</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">initialBasis</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">LawfulBasisType</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Pre-selected lawful basis for editing</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Lawful Basis Types</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type LawfulBasisType =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interest'
  | 'public_interest'
  | 'legitimate_interest';

type ProcessingActivity = {
  id: string;
  name: string;
  description: string;
  dataCategories: string[];
  dataSubjects?: string[];
  purpose?: string;
};

type LawfulBasisResult = {
  activityId: string;
  basis: LawfulBasisType;
  justification: string;
  assessedAt: string;
  reviewer?: string;
  notes?: string;
};`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Assess Before Processing:</strong> Determine and document the lawful basis before starting any new processing activity.
          </li>
          <li>
            <strong>Review Regularly:</strong> Periodically review lawful basis assessments, especially when the nature of processing changes.
          </li>
          <li>
            <strong>Be Specific:</strong> Do not rely on a blanket lawful basis for all activities; each processing purpose should have its own documented basis.
          </li>
          <li>
            <strong>Consent as Last Resort:</strong> Where another lawful basis applies, consider using it instead of consent, as consent can be withdrawn at any time.
          </li>
          <li>
            <strong>Keep Records:</strong> Maintain audit trails of all assessments for regulatory accountability under the NDPA.
          </li>
        </ul>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">GitHub Issues</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Report bugs or request features on our GitHub repository.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer">
                  View Issues
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA Resources</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Learn more about NDPA 2023 compliance requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  NDPC Website
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
