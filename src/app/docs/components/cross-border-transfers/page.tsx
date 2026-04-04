'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function CrossBorderTransfersDocs() {
  return (
    <DocLayout
      title="Cross-Border Transfers"
      description="Manage and validate cross-border data transfers in compliance with NDPA 2023 Section 41"
    >
      <div className="flex mb-6 space-x-2">
        <Badge variant="success" className="text-xs">New in v2.1</Badge>
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/cross-border">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/tantainnovative/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/cross-border" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>

      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Cross-Border Transfers component provides tools for assessing, documenting, and managing the transfer
          of personal data outside Nigeria. Under the NDPA 2023, transferring personal data to another country requires
          that adequate safeguards are in place.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Section 41 &mdash; Transfer of Personal Data</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            The NDPA 2023 permits the transfer of personal data to a foreign country only where the NDPC has determined
            that the country or territory ensures an adequate level of protection, or where appropriate safeguards have
            been provided by the controller or processor, including binding corporate rules, standard contractual clauses,
            or an approved code of conduct.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Cross-Border Transfer components:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>npm install @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Use the per-module import for optimal tree-shaking:</p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>{`// Per-module import (recommended)
import {
  CrossBorderTransferAssessment,
  TransferMechanismSelector,
} from '@tantainnovative/ndpr-toolkit/cross-border';

// Or from the main package
import {
  CrossBorderTransferAssessment,
  TransferMechanismSelector,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Cross-Border Transfers module includes two primary components:
        </p>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">CrossBorderTransferAssessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A step-by-step assessment form that evaluates whether a proposed cross-border transfer meets the
              requirements of the NDPA 2023. It checks adequacy status of the destination country, identifies
              required safeguards, and generates a compliance report.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { CrossBorderTransferAssessment } from '@tantainnovative/ndpr-toolkit/cross-border';

<CrossBorderTransferAssessment
  transfer={{
    id: 'transfer-001',
    destinationCountry: 'United Kingdom',
    dataCategories: ['customer names', 'email addresses'],
    purpose: 'Cloud hosting and data processing',
    recipient: 'Cloud Service Provider Ltd',
  }}
  onComplete={(result) => {
    console.log('Assessment result:', result);
    console.log('Transfer permitted:', result.isPermitted);
    console.log('Required safeguards:', result.safeguards);
  }}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">TransferMechanismSelector</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Helps users select the appropriate transfer mechanism (e.g., adequacy decision, standard contractual clauses,
              binding corporate rules) based on the transfer context and destination.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { TransferMechanismSelector } from '@tantainnovative/ndpr-toolkit/cross-border';

<TransferMechanismSelector
  destinationCountry="Germany"
  onSelect={(mechanism) => {
    console.log('Selected mechanism:', mechanism.type);
    console.log('Requirements:', mechanism.requirements);
  }}
/>`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">CrossBorderTransferAssessment Props</h3>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">transfer</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">TransferDetails</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Details of the proposed data transfer</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onComplete</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(result: TransferAssessmentResult) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Called when the assessment is completed</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">showRecommendations</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether to show safeguard recommendations</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Types</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type TransferDetails = {
  id: string;
  destinationCountry: string;
  dataCategories: string[];
  purpose: string;
  recipient: string;
  recipientType?: 'controller' | 'processor';
};

type TransferMechanism =
  | 'adequacy_decision'
  | 'standard_contractual_clauses'
  | 'binding_corporate_rules'
  | 'code_of_conduct'
  | 'certification'
  | 'explicit_consent'
  | 'contractual_necessity';

type TransferAssessmentResult = {
  transferId: string;
  isPermitted: boolean;
  mechanism: TransferMechanism;
  safeguards: string[];
  risks: string[];
  assessedAt: string;
};`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Assess First:</strong> Always complete a transfer assessment before initiating any cross-border data transfer.
          </li>
          <li>
            <strong>Document Safeguards:</strong> Keep records of all safeguards implemented for each transfer, including signed contractual clauses.
          </li>
          <li>
            <strong>Monitor Adequacy:</strong> Regularly check whether destination countries maintain their adequacy status with the NDPC.
          </li>
          <li>
            <strong>Data Minimisation:</strong> Only transfer the minimum personal data necessary for the stated purpose.
          </li>
          <li>
            <strong>Inform Data Subjects:</strong> Your privacy policy should clearly state which countries data may be transferred to and why.
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
                <a href="https://github.com/tantainnovative/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer">
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
