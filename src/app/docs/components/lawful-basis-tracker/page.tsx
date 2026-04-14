'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

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
      <div className="flex mb-6 space-x-2 flex-wrap gap-y-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          New in v2.1
        </span>
        <Link
          href="/ndpr-demos/lawful-basis"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Demo
        </Link>
        <a
          href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/lawful-basis"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Source
        </a>
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
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">pnpm add @tantainnovative/ndpr-toolkit</code></pre>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Import from the main package:</p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit';

// Utility functions
import {
  validateProcessingActivity,
  getLawfulBasisDescription,
  assessComplianceGaps,
  generateLawfulBasisSummary,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Lawful Basis Tracker provides a component and hook for managing lawful basis records:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2 text-foreground">LawfulBasisTracker</h3>
            <p className="text-muted-foreground mb-4">
              A comprehensive component for tracking and documenting the lawful basis for each data processing activity.
              It provides a UI for adding, editing, and reviewing processing activities with their associated lawful basis.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit';

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
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">LawfulBasisTracker Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Prop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Default</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">processingActivity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">ProcessingActivity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Required</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">The processing activity to assess</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onComplete</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(result: LawfulBasisResult) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Required</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Called when the assessment is completed</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onSave</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(draft: Partial<LawfulBasisResult>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Called when a draft is saved</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">initialBasis</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">LawfulBasisType</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Pre-selected lawful basis for editing</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Lawful Basis Types</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`type LawfulBasisType =
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
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
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
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-2">GitHub Issues</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Report bugs or request features on our GitHub repository.
            </p>
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              View Issues
            </a>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-2">NDPA Resources</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Learn more about NDPA 2023 compliance requirements.
            </p>
            <a
              href="https://ndpc.gov.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              NDPC Website
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
