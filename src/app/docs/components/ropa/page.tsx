'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

export default function ROPADocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Records of Processing Activities (ROPA) — NDPA Toolkit Documentation',
    description: 'Maintain comprehensive records of all data processing activities as required by the NDPA 2023',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Records of Processing Activities (ROPA)"
      description="Maintain comprehensive records of all data processing activities as required by the NDPA 2023"
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
          href="/ndpr-demos/ropa"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Demo
        </Link>
        <a
          href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/ropa"
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
          The ROPA (Records of Processing Activities) component helps organisations create, maintain, and
          manage a register of all personal data processing activities. This is a key accountability requirement
          under the Nigeria Data Protection Act 2023 (NDPA).
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA 2023 &mdash; Record Keeping Obligations</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            The NDPA 2023 requires data controllers and processors to maintain records of processing activities
            under their responsibility. These records must include the purposes of processing, categories of data
            subjects and personal data, recipients, cross-border transfers, retention periods, and a description of
            technical and organisational security measures.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the ROPA components:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">pnpm add @tantainnovative/ndpr-toolkit</code></pre>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Import from the main package:</p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import {
  ROPAManager,
  useROPA,
  validateProcessingRecord,
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The ROPA module includes three primary components:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2 text-foreground">ROPAManager</h3>
            <p className="text-muted-foreground mb-4">
              A comprehensive dashboard for viewing, filtering, and managing all processing activity records. Supports
              search, categorisation, and bulk operations.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { ROPAManager } from '@tantainnovative/ndpr-toolkit';

<ROPAManager
  activities={processingActivities}
  onAdd={(activity) => console.log('Added:', activity)}
  onEdit={(activity) => console.log('Edited:', activity)}
  onDelete={(id) => console.log('Deleted:', id)}
  onExport={(format) => console.log('Exporting as:', format)}
/>`}</code></pre>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2 text-foreground">useROPA Hook</h3>
            <p className="text-muted-foreground mb-4">
              A React hook for managing processing records, generating summaries, and exporting data.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useROPA, exportROPAToCSV } from '@tantainnovative/ndpr-toolkit';

function ProcessingRecords() {
  const { ropa, addRecord, getSummary } = useROPA({
    initialData: {
      id: 'ropa-1',
      organizationName: 'Your Company Ltd',
      organizationContact: 'dpo@yourcompany.com',
      organizationAddress: 'Lagos, Nigeria',
      records: [],
      lastUpdated: Date.now(),
      version: '1.0',
    },
  });

  return (
    <div>
      <ROPAManager
        records={ropa.records}
        onAddRecord={addRecord}
        summary={getSummary()}
      />
      <button onClick={() => exportROPAToCSV(ropa.records)}>
        Export to CSV
      </button>
    </div>
  );
}`}</code></pre>
          </div>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">ProcessingActivity Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`type ProcessingActivity = {
  id: string;
  name: string;
  description: string;
  purpose: string;
  lawfulBasis: LawfulBasisType;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  crossBorderTransfers?: {
    country: string;
    safeguards: string;
  }[];
  retentionPeriod: string;
  securityMeasures: string[];
  dpiaConducted: boolean;
  status: 'active' | 'inactive' | 'under_review';
  createdAt: string;
  updatedAt: string;
};

type ROPAManagerProps = {
  activities: ProcessingActivity[];
  onAdd: (activity: ProcessingActivity) => void;
  onEdit: (activity: ProcessingActivity) => void;
  onDelete: (id: string) => void;
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
  filterCategories?: string[];
};`}</code></pre>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <strong>Comprehensive Coverage:</strong> Record every processing activity, including those handled by third-party processors.
          </li>
          <li>
            <strong>Regular Updates:</strong> Review and update your ROPA at least quarterly, or whenever a new processing activity is introduced.
          </li>
          <li>
            <strong>Link to DPIA:</strong> Cross-reference processing activities with any Data Protection Impact Assessments that have been conducted.
          </li>
          <li>
            <strong>Include Retention Periods:</strong> Clearly document how long data is retained for each activity and the basis for that period.
          </li>
          <li>
            <strong>Audit Trail:</strong> Maintain a history of changes to each record for accountability purposes.
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
