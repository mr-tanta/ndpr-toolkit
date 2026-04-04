'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ROPADocs() {
  return (
    <DocLayout
      title="Records of Processing Activities (ROPA)"
      description="Maintain comprehensive records of all data processing activities as required by the NDPA 2023"
    >
      <div className="flex mb-6 space-x-2">
        <Badge variant="success" className="text-xs">New in v2.1</Badge>
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/ropa">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/ropa" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
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
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Import from the main package:</p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>{`import {
  ROPAManager,
  useROPA,
  validateProcessingRecord,
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The ROPA module includes three primary components:
        </p>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">ROPAManager</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A comprehensive dashboard for viewing, filtering, and managing all processing activity records. Supports
              search, categorisation, and bulk operations.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { ROPAManager } from '@tantainnovative/ndpr-toolkit';

<ROPAManager
  activities={processingActivities}
  onAdd={(activity) => console.log('Added:', activity)}
  onEdit={(activity) => console.log('Edited:', activity)}
  onDelete={(id) => console.log('Deleted:', id)}
  onExport={(format) => console.log('Exporting as:', format)}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">useROPA Hook</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A React hook for managing processing records, generating summaries, and exporting data.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { useROPA, exportROPAToCSV } from '@tantainnovative/ndpr-toolkit';

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
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">ProcessingActivity Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type ProcessingActivity = {
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
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
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
