'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function BreachNotificationDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Breach Notification System — NDPA Toolkit Documentation',
    description: 'NDPA 2023-compliant system for managing and reporting data breaches',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Breach Notification System"
      description="NDPA 2023-compliant system for managing and reporting data breaches"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 gap-3">
        <Link href="/ndpr-demos/breach" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
          View Demo →
        </Link>
        <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/src/components/breach-notification" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card transition">
          View Source
        </a>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Breach Notification System provides a complete solution for detecting, managing, and reporting data breaches
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes components for breach reporting,
          risk assessment, notification management, and regulatory reporting.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-2">NDPA Breach Notification Requirements</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under the NDPA 2023, organizations must report data breaches to the Nigeria Data Protection Commission (NDPC)
            within 72 hours of becoming aware of the breach. Organizations must also notify affected data subjects without undue delay.
          </p>
        </div>
      </section>

      <section id="v3-quick-start" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">v3 Quick Start</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          v3 introduces zero-config presets, compound components for custom layouts, and a StorageAdapter pattern
          so you can plug in any persistence backend without touching component internals.
        </p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Zero-config preset</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`// Drop in a fully-working breach report form with NDPA defaults
import { NDPRBreachReport } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRBreachReport />`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Compound components for custom layouts</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { Breach } from '@tantainnovative/ndpr-toolkit/breach';

<Breach.Provider categories={categories}>
  <Breach.ReportForm />
</Breach.Provider>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Hook with adapter</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { useBreach } from '@tantainnovative/ndpr-toolkit/hooks';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// The adapter prop accepts any StorageAdapter for custom persistence
// (server-side DB, REST API, localStorage, etc.)
const breach = useBreach({ categories, adapter: apiAdapter('/api/breaches') });`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="installation" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Installation</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Install the NDPR Toolkit package which includes the Breach Notification components:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">pnpm add @tantainnovative/ndpr-toolkit</code>
        </pre>
      </section>

      <section id="components" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Components</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Breach Notification system includes several components that work together:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">BreachReportForm</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A form for internal staff to report suspected data breaches, capturing essential details.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { BreachReportForm } from '@tantainnovative/ndpr-toolkit';

<BreachReportForm
  onSubmit={handleSubmitBreachReport}
  categories={[
    { id: 'unauthorized-access', label: 'Unauthorized Access' },
    { id: 'data-loss', label: 'Data Loss' },
    { id: 'system-compromise', label: 'System Compromise' },
    { id: 'phishing', label: 'Phishing Attack' },
    { id: 'other', label: 'Other' }
  ]}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">BreachRiskAssessment</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A tool for assessing the risk level of a data breach and determining notification requirements.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { BreachRiskAssessment } from '@tantainnovative/ndpr-toolkit';

<BreachRiskAssessment
  breachData={breachData}
  onComplete={handleRiskAssessmentComplete}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">BreachNotificationManager</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A dashboard for managing breach notifications, including tracking notification status and deadlines.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { BreachNotificationManager } from '@tantainnovative/ndpr-toolkit';

<BreachNotificationManager
  breaches={breaches}
  onUpdateStatus={handleUpdateStatus}
  onSendNotification={handleSendNotification}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">RegulatoryReportGenerator</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A tool for generating NDPA-compliant breach notification reports for submission to the NDPC.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { RegulatoryReportGenerator } from '@tantainnovative/ndpr-toolkit';

<RegulatoryReportGenerator
  breachData={breachData}
  organizationInfo={organizationInfo}
  onGenerate={handleGenerateReport}
/>`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Here&apos;s a complete example of how to implement the Breach Notification system in your application:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useState, useEffect } from 'react';
import {
  BreachReportForm,
  BreachRiskAssessment,
  BreachNotificationManager,
  RegulatoryReportGenerator
} from '@tantainnovative/ndpr-toolkit';

const breachCategories = [
  { id: 'unauthorized-access', label: 'Unauthorized Access' },
  { id: 'data-loss', label: 'Data Loss' },
  { id: 'system-compromise', label: 'System Compromise' },
  { id: 'phishing', label: 'Phishing Attack' },
  { id: 'other', label: 'Other' }
];

const organizationInfo = {
  name: 'Example Company Ltd.',
  address: '123 Main Street, Lagos, Nigeria',
  dpoName: 'John Doe',
  dpoEmail: 'dpo@example.com',
  dpoPhone: '+234 123 456 7890'
};

function BreachReportingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [currentBreach, setCurrentBreach] = useState(null);

  const handleSubmitBreachReport = (breachData) => {
    const newBreach = {
      ...breachData,
      id: \`breach-\${Date.now()}\`,
      status: 'reported',
      reportedAt: new Date()
    };
    setCurrentBreach(newBreach);
    setSubmitted(true);
  };

  return (
    <div>
      {!submitted ? (
        <BreachReportForm onSubmit={handleSubmitBreachReport} categories={breachCategories} />
      ) : (
        <div>
          <p>Breach reference: <strong>{currentBreach.id}</strong></p>
          <BreachRiskAssessment
            breachData={currentBreach}
            onComplete={(assessment) => setCurrentBreach({ ...currentBreach, riskAssessment: assessment })}
          />
        </div>
      )}
    </div>
  );
}

function BreachManagementDashboard() {
  const [breaches, setBreaches] = useState([]);
  const [selectedBreach, setSelectedBreach] = useState(null);

  return (
    <div>
      <BreachNotificationManager
        breaches={breaches}
        onUpdateStatus={(id, status) => console.log(id, status)}
        onSendNotification={(id, notification) => console.log(id, notification)}
        onSelectBreach={setSelectedBreach}
      />
      {selectedBreach?.riskAssessment?.requiresNdpcNotification && (
        <RegulatoryReportGenerator
          breachData={selectedBreach}
          organizationInfo={organizationInfo}
          onGenerate={(report) => console.log(report)}
        />
      )}
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>

        <h3 className="text-xl font-bold text-foreground mb-4">BreachReportForm Props</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Required</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onSubmit</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>(data: BreachReport) =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function when user submits a breach report</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>categories</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>{'{ id: string, label: string }[]'}</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of breach categories to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>initialValues</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>Partial&lt;BreachReport&gt;</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Initial values for the form fields</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">BreachReport Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`type BreachReport = {
  id?: string;
  title: string;
  category: string;
  description: string;
  discoveredAt: Date;
  reportedBy: {
    name: string;
    email: string;
    department: string;
  };
  affectedSystems: string[];
  affectedDataTypes: string[];
  estimatedImpact: string;
  initialActions: string;
  status?: string;
  reportedAt?: Date;
  updatedAt?: Date;
};`}</code>
        </pre>
      </section>

      <section id="72-hour-timeline" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">72-Hour Notification Timeline</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          The NDPA requires organizations to notify the NDPC of data breaches within 72 hours of becoming aware of the breach.
          Here&apos;s a recommended timeline for handling breaches:
        </p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</span>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Hour 0–4: Initial Response</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Report the breach internally using the BreachReportForm. Assemble the response team, begin containment measures, and preserve evidence.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</span>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Hour 4–24: Risk Assessment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Complete the BreachRiskAssessment. Determine notification requirements, continue containment and investigation, and begin preparing notification drafts.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</span>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Hour 24–48: Notification Preparation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use the RegulatoryReportGenerator to prepare NDPC notification. Draft data subject notifications if required, review and approve, and continue investigation.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</span>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Hour 48–72: Notification Submission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Submit notification to NDPC. Begin notifying affected data subjects if required, document all notification activities, and continue remediation efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">API Reference</h2>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">BreachReport Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface BreachReport {
  id: string;
  title: string;
  description: string;
  category: string;
  discoveredAt: number;
  occurredAt?: number;
  reportedAt: number;
  reporter: {
    name: string;
    email: string;
    department: string;
    phone?: string;
  };
  affectedSystems: string[];
  dataTypes: string[];
  estimatedAffectedSubjects?: number;
  status: 'ongoing' | 'contained' | 'resolved';
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">RiskAssessment Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface RiskAssessment {
  id: string;
  breachId: string;
  assessedAt: number;
  assessor: {
    name: string;
    role: string;
    email: string;
  };
  confidentialityImpact: number;
  integrityImpact: number;
  availabilityImpact: number;
  harmLikelihood: number;
  harmSeverity: number;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risksToRightsAndFreedoms: boolean;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">NotificationRequirement Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface NotificationRequirement {
  ndpcNotificationRequired: boolean;
  ndpcNotificationDeadline: number;
  dataSubjectNotificationRequired: boolean;
  justification: string;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">useBreach Hook</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useBreach } from '@tantainnovative/ndpr-toolkit';

const {
  breaches,
  submitBreachReport,
  updateBreachReport,
  performRiskAssessment,
  determineNotificationRequirements,
  generateRegulatoryReport,
  getBreachById,
} = useBreach();

// Submit a new breach report
const newBreachReport = submitBreachReport({
  title: 'Unauthorized Database Access',
  description: 'An unauthorized IP address accessed our customer database.',
  category: 'unauthorized-access',
  discoveredAt: Date.now(),
  reporter: {
    name: 'John Doe',
    email: 'john@example.com',
    department: 'IT Security'
  },
  affectedSystems: ['customer-database'],
  dataTypes: ['personal-information', 'contact-details'],
  estimatedAffectedSubjects: 500,
  status: 'contained'
});

// Perform a risk assessment
const riskAssessment = performRiskAssessment({
  breachId: newBreachReport.id,
  assessor: {
    name: 'Jane Smith',
    role: 'Data Protection Officer',
    email: 'jane@example.com'
  },
  confidentialityImpact: 4,
  integrityImpact: 3,
  availabilityImpact: 2,
  harmLikelihood: 3,
  harmSeverity: 4
});

// Determine notification requirements
const requirements = determineNotificationRequirements({
  breachId: newBreachReport.id,
  riskAssessmentId: riskAssessment.id
});

// Generate a regulatory report for the NDPC
if (requirements.ndpcNotificationRequired) {
  const report = generateRegulatoryReport({
    breachId: newBreachReport.id,
    riskAssessmentId: riskAssessment.id
  });
}`}</code>
        </pre>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">Breach Response Plan:</strong> Develop a comprehensive breach response plan that includes roles, responsibilities, and procedures.
          </li>
          <li>
            <strong className="text-foreground">Regular Training:</strong> Conduct regular training for staff on breach identification, reporting, and response procedures.
          </li>
          <li>
            <strong className="text-foreground">Documentation:</strong> Maintain detailed documentation of all breach-related activities, including containment, investigation, and notification.
          </li>
          <li>
            <strong className="text-foreground">Testing:</strong> Regularly test your breach response procedures through tabletop exercises or simulations.
          </li>
          <li>
            <strong className="text-foreground">Post-Breach Review:</strong> Conduct a thorough review after each breach to identify lessons learned and improve your response procedures.
          </li>
        </ul>
      </section>

      <section id="help-resources" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          If you have questions about implementing the Breach Notification system or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">GitHub Issues</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Report bugs or request features on our GitHub repository.
            </p>
            <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              View Issues
            </a>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">NDPA Resources</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Learn more about NDPA 2023 compliance requirements.
            </p>
            <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              NDPA Framework
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
