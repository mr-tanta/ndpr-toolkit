'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CrossBorderTransfersGuide() {
  return (
    <DocLayout
      title="Cross-Border Data Transfers"
      description="Guide to managing cross-border data transfers in compliance with NDPA 2023 Section 41"
    >
      <div className="flex mb-6 space-x-2">
        <Link
          href="/ndpr-demos/cross-border"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          View Demo
        </Link>
        <Link
          href="/docs/components/cross-border-transfers"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          Component Docs
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="mb-4">
          Under the Nigeria Data Protection Act 2023 (NDPA), transferring personal data outside Nigeria is subject to
          specific requirements. This guide walks you through the legal framework, the assessment process, and how to
          use the NDPR Toolkit to manage cross-border transfers compliantly.
        </p>
        <div className="bg-primary/10 p-4 rounded-xl border border-border">
          <h4 className="text-primary font-medium mb-2">Why This Matters</h4>
          <p className="text-muted-foreground text-sm mb-0">
            Many Nigerian businesses use international cloud services, payment processors, and SaaS platforms that process
            data outside Nigeria. Each of these transfers must comply with Sections 41-45 of the NDPA 2023.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Legal Requirements</h2>
        <p className="mb-4">
          The NDPA 2023 permits cross-border transfers of personal data only when one of the following conditions is met:
        </p>
        <ol className="list-decimal pl-6 space-y-3 text-foreground">
          <li>
            <strong>Adequacy Decision:</strong> The NDPC has determined that the destination country provides an
            adequate level of data protection.
          </li>
          <li>
            <strong>Appropriate Safeguards:</strong> The controller or processor has provided appropriate safeguards,
            which may include:
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Standard contractual clauses approved by the NDPC</li>
              <li>Binding corporate rules</li>
              <li>An approved code of conduct with binding commitments</li>
              <li>Certification mechanisms</li>
            </ul>
          </li>
          <li>
            <strong>Derogations:</strong> In limited circumstances, transfers may be made based on explicit consent,
            contractual necessity, public interest, legal claims, or vital interests.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Step-by-Step Assessment Process</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Map Your Data Flows</h3>
              <p className="text-muted-foreground text-sm">
                Identify all instances where personal data leaves Nigeria, including cloud hosting, analytics services,
                email providers, and third-party processors.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Check Adequacy Status</h3>
              <p className="text-muted-foreground text-sm">
                Verify whether the NDPC has issued an adequacy decision for the destination country. If yes, the transfer
                can proceed without additional safeguards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Select Transfer Mechanism</h3>
              <p className="text-muted-foreground text-sm">
                If no adequacy decision exists, choose and implement appropriate safeguards such as standard contractual
                clauses or binding corporate rules.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">4</div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Document the Transfer</h3>
              <p className="text-muted-foreground text-sm">
                Record all transfer details in your ROPA, including the destination, recipient, safeguards, and data categories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">5</div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Update Your Privacy Notice</h3>
              <p className="text-muted-foreground text-sm">
                Inform data subjects about cross-border transfers, including which countries receive their data and the
                safeguards in place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using the Cross-Border Transfer Component</h2>
        <p className="mb-4">
          The NDPR Toolkit provides components to automate much of this process:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground text-sm"><code>{`import {
  CrossBorderTransferManager,
  useCrossBorderTransfer,
  validateTransfer,
  assessTransferRisk,
} from '@tantainnovative/ndpr-toolkit';

function TransferAssessmentPage() {
  const { transfers, addTransfer, getSummary } = useCrossBorderTransfer();

  return (
    <div>
      <h1>Cross-Border Transfer Assessment</h1>
      <CrossBorderTransferManager
        transfers={transfers}
        onAddTransfer={addTransfer}
        summary={getSummary()}
      />
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Common Transfer Scenarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Scenario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Typical Mechanism</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Cloud hosting (AWS, GCP, Azure)</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Standard contractual clauses + data processing agreement</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">SaaS tools (Salesforce, HubSpot)</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Standard contractual clauses</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Intra-group transfers (multinational)</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Binding corporate rules</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground">Payment processing (Stripe, Paystack)</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Contractual necessity + standard contractual clauses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-2">Cross-Border Transfers Component</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Full API reference and component documentation.
            </p>
            <Link
              href="/docs/components/cross-border-transfers"
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
