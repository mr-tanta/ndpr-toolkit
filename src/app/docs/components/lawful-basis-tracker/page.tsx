'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { LegalCitationBlock } from '@/components/docs/LegalCitationBlock';

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
      <LegalCitationBlock moduleId="lawful-basis" />

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
  const { activities, addActivity, updateActivity, archiveActivity } = useLawfulBasis();

  return (
    <LawfulBasisTracker
      activities={activities}
      onAdd={addActivity}
      onUpdate={updateActivity}
      onArchive={archiveActivity}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">activities</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">ProcessingActivity[]</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Required</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">List of processing activities to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onAdd</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(activity: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when a new activity is created</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onUpdate</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(id: string, updates: Partial<ProcessingActivity>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when an activity is updated</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onArchive</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(id: string) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when an activity is archived</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">title</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`"Lawful Basis Tracker"`}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Title displayed on the tracker</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">description</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">NDPA Section 25 default</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Description text displayed on the tracker</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">className</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Custom CSS class for the tracker container</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">buttonClassName</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Custom CSS class for buttons</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">showSummary</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">true</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Whether to show the compliance summary at the top</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">showComplianceGaps</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">true</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Whether to show compliance gap alerts</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">classNames</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">LawfulBasisTrackerClassNames</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Override class names for individual sections; takes priority over className / buttonClassName</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">unstyled</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">undefined</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">When true, all default styling is removed so consumers can style from scratch using classNames</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Lawful Basis Types</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`// The six lawful bases for processing personal data per NDPA Section 25(1)
type LawfulBasis =
  | 'consent'              // Section 25(1)(a)
  | 'contract'             // Section 25(1)(b)
  | 'legal_obligation'     // Section 25(1)(c)
  | 'vital_interests'      // Section 25(1)(d)
  | 'public_interest'      // Section 25(1)(e)
  | 'legitimate_interests'; // Section 25(1)(f)

interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  lawfulBasis: LawfulBasis;
  lawfulBasisJustification: string;
  dataCategories: string[];
  involvesSensitiveData: boolean;
  sensitiveDataCondition?: SensitiveDataCondition;
  dataSubjectCategories: string[];
  purposes: string[];
  retentionPeriod: string;
  retentionJustification?: string;
  recipients?: string[];
  crossBorderTransfer: boolean;
  createdAt: number;
  updatedAt: number;
  reviewDate?: number;
  status: 'active' | 'inactive' | 'under_review' | 'archived';
  dpoApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: number;
    notes?: string;
  };
}`}</code></pre>
      </section>

      <section id="lite-variant" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Lite variant (read-only)</h2>
        <p className="mb-4">
          For read-only surfaces such as dashboards and audit pages, use <code>LawfulBasisTrackerLite</code> from
          the new <code>/lawful-basis/lite</code> subpath. It renders the same list-and-summary view as the Full
          component without any Add, Edit, Archive, or CSV-export affordances — and ships at <strong>12.7 KB</strong> instead of
          36.7 KB (a 65% saving, minified and pre-gzip).
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4"><code className="text-sm font-mono text-foreground">{`import { LawfulBasisTrackerLite } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';

<LawfulBasisTrackerLite
  activities={activities}
  onActivityClick={(activity) => router.push(\`/lawful-basis/\${activity.id}\`)}
/>`}</code></pre>
        <p className="mb-0">
          See the{' '}
          <Link href="/docs/guides/lite-vs-full" className="text-primary hover:underline">
            Lite vs Full Managers guide
          </Link>{' '}
          for migration notes, side-by-side examples, and the full bundle-size table.
        </p>
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
