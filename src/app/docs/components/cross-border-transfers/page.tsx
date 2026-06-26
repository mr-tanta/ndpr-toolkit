'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { LegalCitationBlock } from '@/components/docs/LegalCitationBlock';

export default function CrossBorderTransfersDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Cross-Border Transfers — NDPA Toolkit Documentation',
    description: 'Manage and validate cross-border data transfers in compliance with NDPA 2023 Section 41',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Cross-Border Transfers"
      description="Manage and validate cross-border data transfers in compliance with NDPA 2023 Section 41"
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
          href="/ndpr-demos/cross-border"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Demo
        </Link>
        <a
          href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/cross-border"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Source
        </a>
      </div>
      <LegalCitationBlock moduleId="cross-border" />

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
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">pnpm add @tantainnovative/ndpr-toolkit</code></pre>
      </section>

      <section id="import" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Import</h2>
        <p className="mb-4">Import from the main package:</p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import {
  CrossBorderTransferManager,
  useCrossBorderTransfer,
  validateTransfer,
  assessTransferRisk,
  isNDPCApprovalRequired,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Cross-Border Transfers module includes two primary components:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2 text-foreground">CrossBorderTransferManager</h3>
            <p className="text-muted-foreground mb-4">
              A comprehensive component for assessing, documenting, and managing cross-border data transfers.
              It evaluates adequacy status of destination countries, identifies required safeguards, and
              helps maintain compliance records.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { CrossBorderTransferManager, useCrossBorderTransfer } from '@tantainnovative/ndpr-toolkit';

function TransferManagement() {
  const { transfers, addTransfer, getSummary } = useCrossBorderTransfer();

  return (
    <CrossBorderTransferManager
      transfers={transfers}
      onAdd={addTransfer}
      summary={getSummary()}
    />
  );
}`}</code></pre>
          </div>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-bold mt-8 mb-4">CrossBorderTransferManager Props</h3>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">transfers</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">CrossBorderTransfer[]</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Required</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">List of cross-border transfers to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onAdd</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(transfer: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">&mdash;</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when a new transfer is added</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onUpdate</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(id: string, updates: Partial<CrossBorderTransfer>) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">&mdash;</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when a transfer is updated</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">onArchive</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`(id: string) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">&mdash;</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Callback when a transfer is archived (NDPA prefers soft-delete over hard-delete)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">summary</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">CrossBorderSummary</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">&mdash;</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Compliance summary data (computed from transfers when omitted)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">title</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`"Cross-Border Data Transfer Manager"`}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Title displayed on the manager</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">description</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">NDPA Part VIII text</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Description text displayed on the manager</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">className</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`""`}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Custom CSS class for the manager container</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">buttonClassName</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`""`}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Custom CSS class for buttons</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">showSummary</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">true</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Whether to show the compliance summary section</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">showTIA</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">true</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Whether to show the Transfer Impact Assessment section in the form</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">classNames</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">CrossBorderTransferManagerClassNames</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">&mdash;</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Override class names for individual sections; takes priority over className / buttonClassName</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">unstyled</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">boolean</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">false</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">When true, removes all default styling so consumers can style from scratch using classNames</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Types</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`type TransferMechanism =
  | 'adequacy_decision'
  | 'standard_clauses'
  | 'binding_corporate_rules'
  | 'ndpc_authorization'
  | 'explicit_consent'
  | 'contract_performance'
  | 'public_interest'
  | 'legal_claims'
  | 'vital_interests';

type AdequacyStatus = 'adequate' | 'inadequate' | 'pending_review' | 'unknown';

interface CrossBorderTransfer {
  id: string;
  destinationCountry: string;
  destinationCountryCode?: string;
  adequacyStatus: AdequacyStatus;
  transferMechanism: TransferMechanism;
  dataCategories: string[];
  includesSensitiveData: boolean;
  estimatedDataSubjects?: number;
  recipientOrganization: string;
  recipientContact: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  purpose: string;
  safeguards: string[];
  riskAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  ndpcApproval?: {
    required: boolean;
    applied: boolean;
    approved?: boolean;
    referenceNumber?: string;
    appliedAt?: number;
    approvedAt?: number;
  };
  tiaCompleted: boolean;
  tiaReference?: string;
  frequency: 'one_time' | 'periodic' | 'continuous';
  startDate: number;
  endDate?: number;
  status: 'active' | 'suspended' | 'terminated' | 'pending_approval';
  createdAt: number;
  updatedAt: number;
  reviewDate?: number;
}

interface CrossBorderSummary {
  totalActiveTransfers: number;
  byMechanism: Record<TransferMechanism, number>;
  byAdequacy: Record<AdequacyStatus, number>;
  pendingApproval: CrossBorderTransfer[];
  dueForReview: CrossBorderTransfer[];
  missingTIA: CrossBorderTransfer[];
  highRiskTransfers: CrossBorderTransfer[];
  lastUpdated: number;
}`}</code></pre>
      </section>

      <section id="lite-variant" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Lite variant (read-only)</h2>
        <p className="mb-4">
          For read-only transfer surfaces such as compliance dashboards and transparency pages, use{' '}
          <code>CrossBorderTransferManagerLite</code> from the new <code>/cross-border/lite</code> subpath. It
          renders the same transfer list and summary as the Full component, with no Add, Edit, or Terminate
          affordances and — crucially — without importing the 624-row country adequacy dataset. It ships at{' '}
          <strong>5.6 KB</strong> instead of 53.3 KB (an 89% saving, minified and pre-gzip). Lite reads{' '}
          <code>transfer.adequacyStatus</code> directly from each record rather than recomputing it.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4"><code className="text-sm font-mono text-foreground">{`import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';

<CrossBorderTransferManagerLite
  transfers={transfers}
  onTransferClick={(transfer) => router.push(\`/cross-border/\${transfer.id}\`)}
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
