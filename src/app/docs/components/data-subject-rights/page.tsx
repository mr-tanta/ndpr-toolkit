'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

export default function DataSubjectRightsDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Data Subject Rights Portal — NDPA Toolkit Documentation',
    description: 'NDPA 2023-compliant portal for managing data subject rights requests',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Data Subject Rights Portal"
      description="NDPA 2023-compliant portal for managing data subject rights requests"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 gap-3">
        <Link href="/ndpr-demos/dsr" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
          View Demo →
        </Link>
        <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/src/components/data-subject-rights" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card transition">
          View Source
        </a>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Data Subject Rights Portal provides a complete solution for handling data subject access requests (DSARs)
          and other rights requests in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes a request
          submission form, admin dashboard for managing requests, and a tracking system for data subjects.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-2">NDPA Data Subject Rights</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under the NDPA 2023, data subjects have several rights, including the right to access their personal data,
            right to rectification, right to erasure, right to restrict processing, right to data portability, and
            right to object to processing. Organizations must respond to these requests within 30 days.
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
              <code className="text-sm text-foreground font-mono">{`// Drop in a fully-working DSR portal with NDPA defaults
import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRSubjectRights />`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Compound components for custom layouts</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { DSR } from '@tantainnovative/ndpr-toolkit/dsr';

<DSR.Provider requestTypes={types}>
  <DSR.Form />
  <DSR.Dashboard />
</DSR.Provider>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Hook with adapter</h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-foreground font-mono">{`import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// The adapter prop accepts any StorageAdapter for custom persistence
// (server-side DB, REST API, localStorage, etc.)
const dsr = useDSR({ requestTypes: types, adapter: apiAdapter('/api/dsr') });`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="installation" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Installation</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Install the NDPR Toolkit package which includes the Data Subject Rights components:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">pnpm add @tantainnovative/ndpr-toolkit</code>
        </pre>
      </section>

      <section id="components" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Components</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Data Subject Rights system includes several components that work together:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">DSRRequestForm</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A form for data subjects to submit rights requests, with support for different request types.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { DSRRequestForm } from '@tantainnovative/ndpr-toolkit';

<DSRRequestForm
  onSubmit={handleSubmitRequest}
  requestTypes={[
    { id: 'access', name: 'Access my data', description: 'Request a copy of your personal data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
    { id: 'rectification', name: 'Correct my data', description: 'Request correction of inaccurate data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
    { id: 'erasure', name: 'Delete my data', description: 'Request deletion of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
    { id: 'restriction', name: 'Restrict processing of my data', description: 'Request restriction of processing', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
    { id: 'portability', name: 'Data portability', description: 'Request your data in a portable format', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
    { id: 'objection', name: 'Object to processing', description: 'Object to processing of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false }
  ]}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">DSRDashboard</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              An admin dashboard for managing and responding to data subject rights requests.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { DSRDashboard } from '@tantainnovative/ndpr-toolkit';

<DSRDashboard
  requests={dsrRequests}
  onUpdateRequest={handleUpdateRequest}
  onDeleteRequest={handleDeleteRequest}
  onAssignRequest={handleAssignRequest}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">DSRTracker</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A component for data subjects to track the status of their requests.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { DSRTracker } from '@tantainnovative/ndpr-toolkit';

<DSRTracker
  requests={dsrRequests}
  onSelectRequest={handleSelectRequest}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">BreachReportForm</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A form for reporting data breaches, which is a requirement under the NDPA. See also the dedicated{' '}
              <Link href="/docs/components/breach-notification" className="text-primary underline underline-offset-2 hover:opacity-80 transition">Breach Notification</Link> documentation.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { BreachReportForm } from '@tantainnovative/ndpr-toolkit';

<BreachReportForm
  onSubmit={handleSubmitBreachReport}
  formDescription="Report a data breach that has occurred within your organization."
  recipientEmail="dpo@example.com"
/>`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Here&apos;s a complete example of how to implement the Data Subject Rights system in your application:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useState } from 'react';
import {
  DSRRequestForm,
  DSRDashboard,
  DSRTracker,
  useDSR
} from '@tantainnovative/ndpr-toolkit';

const requestTypes = [
  { id: 'access', name: 'Access my data', description: 'Request a copy of your personal data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'rectification', name: 'Correct my data', description: 'Request correction of inaccurate data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'erasure', name: 'Delete my data', description: 'Request deletion of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'restriction', name: 'Restrict processing of my data', description: 'Request restriction of processing', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'portability', name: 'Data portability', description: 'Request your data in a portable format', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'objection', name: 'Object to processing', description: 'Object to processing of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false }
];

function DSRPortal() {
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedId, setSelectedId] = useState('');

  const {
    requests,
    submitRequest,
    updateRequest,
    getRequest,
  } = useDSR({ requestTypes });

  // DSRRequestForm calls onSubmit with a DSRFormSubmission
  const handleSubmitRequest = (submission) => {
    const newRequest = submitRequest({
      type: submission.requestType,
      subject: {
        name: submission.dataSubject.fullName,
        email: submission.dataSubject.email,
        phone: submission.dataSubject.phone,
        identifierType: submission.dataSubject.identifierType,
        identifierValue: submission.dataSubject.identifierValue
      },
      additionalInfo: submission.additionalInfo
    });
    alert(\`Your request has been submitted. Your tracking ID is: \${newRequest.id}\`);
  };

  const handleSelectRequest = (id) => {
    setSelectedId(id);
    const request = getRequest(id);
    console.log('Selected request:', request);
  };

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('submit')}>Submit Request</button>
        <button onClick={() => setActiveTab('track')}>Track Requests</button>
        <button onClick={() => setActiveTab('admin')}>Admin Dashboard</button>
      </nav>

      {activeTab === 'submit' && (
        <DSRRequestForm onSubmit={handleSubmitRequest} requestTypes={requestTypes} />
      )}

      {activeTab === 'track' && (
        <DSRTracker requests={requests} onSelectRequest={handleSelectRequest} />
      )}

      {activeTab === 'admin' && (
        <DSRDashboard
          requests={requests}
          onUpdateRequest={updateRequest}
        />
      )}
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section id="submission-payload" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Submission payload contract</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          When you pass a <code className="text-foreground font-mono text-sm">submitTo</code> URL to{' '}
          <code className="text-foreground font-mono text-sm">NDPRSubjectRights</code>, the toolkit POSTs the
          form data to your backend as JSON. This section is the canonical request and response shape so
          backend implementers don&apos;t have to read the component source.
        </p>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Request</h3>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-6 mb-4">
          <li><strong className="text-foreground">Method:</strong> <code className="font-mono text-sm">POST</code></li>
          <li><strong className="text-foreground">Content-Type:</strong> <code className="font-mono text-sm">application/json</code></li>
          <li><strong className="text-foreground">Credentials:</strong> <code className="font-mono text-sm">same-origin</code> by default</li>
          <li><strong className="text-foreground">Body:</strong> <code className="font-mono text-sm">JSON.stringify(DSRFormSubmission)</code></li>
        </ul>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Use <code className="text-foreground font-mono text-sm">submitOptions</code> on the component to
          override <code className="font-mono text-sm">credentials</code> or add custom headers (e.g.{' '}
          <code className="font-mono text-sm">X-CSRF-Token</code>). For full control over retries, error
          hooks, or non-fetch transports, build an <code className="font-mono text-sm">apiAdapter</code>{' '}
          and pass it via <code className="font-mono text-sm">adapter</code> instead.
        </p>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Request body</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`/**
 * Represents the data submitted by the DSR request form.
 */
export interface DSRFormSubmission {
  /** The selected request type identifier */
  requestType: string;
  /** Data subject personal information */
  dataSubject: {
    fullName: string;
    email: string;
    phone?: string;
    identifierType: string;
    identifierValue: string;
  };
  /** Additional information provided for the selected request type */
  additionalInfo?: Record<string, string | number | boolean | null>;
  /** Timestamp (ms) when the form was submitted */
  submittedAt: number;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Example payload</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`{
  "requestType": "access",
  "dataSubject": {
    "fullName": "Adaeze Okafor",
    "email": "adaeze.okafor@example.ng",
    "phone": "+2348012345678",
    "identifierType": "nin",
    "identifierValue": "12345678901"
  },
  "additionalInfo": {
    "dataCategories": "account, billing, marketing",
    "preferredFormat": "json",
    "verifiedOwner": true
  },
  "submittedAt": 1748131200000
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Recommended response shape</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The toolkit doesn&apos;t mandate a specific response, but the convention below lets the client
          show a confirmation page, email a receipt, or poll for status. <code className="font-mono text-sm">onSubmitSuccess</code>{' '}
          parses the body as JSON and passes it through as <code className="font-mono text-sm">body: unknown</code>,
          so any shape works — this is the one the rest of the toolkit expects.
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface DSRSubmissionResponse {
  /** Server-generated tracking ID returned to the data subject. */
  referenceId: string;
  /** Lifecycle stage of the request immediately after acceptance. */
  status?: 'received' | 'processing' | 'completed';
  /** ISO-8601 timestamp the data subject can expect a final response by. */
  estimatedCompletionAt?: string;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Example backend handler (Next.js App Router)</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// app/api/dsr/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const submission = body as {
    requestType?: string;
    dataSubject?: { fullName?: string; email?: string; identifierValue?: string };
    submittedAt?: number;
  };

  if (
    !submission?.requestType ||
    !submission.dataSubject?.fullName ||
    !submission.dataSubject?.email ||
    !submission.dataSubject?.identifierValue ||
    typeof submission.submittedAt !== 'number'
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 });
  }

  const referenceId = 'DSR-' + Date.now().toString(36);
  // await persistDSR(referenceId, submission);

  return NextResponse.json({ referenceId, status: 'received' }, { status: 201 });
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Client-side handling</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Use the <code className="text-foreground font-mono text-sm">onSubmitSuccess</code> and{' '}
          <code className="text-foreground font-mono text-sm">onSubmitError</code> props on{' '}
          <code className="text-foreground font-mono text-sm">NDPRSubjectRights</code> to react to the
          response on the client. <code className="font-mono text-sm">onSubmitSuccess</code> parses the
          response body as JSON before invoking your callback, so you can read{' '}
          <code className="font-mono text-sm">referenceId</code> straight off{' '}
          <code className="font-mono text-sm">body</code> (typed <code className="font-mono text-sm">unknown</code> —
          narrow it before use). See the <a href="#api" className="text-primary hover:underline">API Reference</a>{' '}
          below for the full prop list.
        </p>
      </section>

      <section id="api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">API Reference</h2>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DSRRequestForm Props</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Prop</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Default</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onSubmit</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(submission: DSRFormSubmission) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function when form is submitted</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">requestTypes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`RequestType[]`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of request types ({`{ id, name, description, estimatedCompletionTime, requiresAdditionalInfo, additionalFields? }`})</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Submit a Data Subject Request&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Form title</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Use this form to exercise your rights under the NDPA...&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Form description</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">submitButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Submit Request&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the submit button</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">useDSR Hook</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';

// requestTypes is required: RequestType[] ({ id, name, description, estimatedCompletionTime, requiresAdditionalInfo })
const {
  requests,             // Array of all DSR requests
  submitRequest,        // Submit a new request
  updateRequest,        // Update an existing request
  getRequest,           // Get a request by id
  getRequestsByStatus,  // Filter requests by status
  getRequestsByType,    // Filter requests by type
  getRequestType,       // Get a request type definition by id
  formatRequest,        // Format a request for display/submission
  clearRequests,        // Clear all requests
  isLoading,            // Loading state for async adapters
} = useDSR({ requestTypes });

// Submit a new request. The hook assigns id, status, createdAt, updatedAt, dueDate.
const newRequest = submitRequest({
  type: 'access',
  subject: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890'
  },
  description: 'I would like to access all my personal data.'
});

// Update a request
updateRequest('request-id', {
  status: 'inProgress'
});

// Look up and filter requests
const request = getRequest('request-id');
const pendingRequests = getRequestsByStatus('pending');
const accessRequests = getRequestsByType('access');`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DSRType Enum</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export type DSRType =
  | 'information'
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'portability'
  | 'objection'
  | 'automated_decision_making'
  | 'withdraw_consent';`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DSRStatus Enum</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export type DSRStatus = 'pending' | 'awaitingVerification' | 'inProgress' | 'completed' | 'rejected';`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DSRRequest Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface DSRRequest {
  id: string;
  type: DSRType;
  status: DSRStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  verifiedAt?: number;
  dueDate?: number;
  description?: string;
  subject: {
    name: string;
    email: string;
    phone?: string;
    identifierValue?: string;
    identifierType?: string;
  };
  additionalInfo?: Record<string, string | number | boolean | null>;
  internalNotes?: Array<{
    timestamp: number;
    author: string;
    note: string;
  }>;
}`}</code>
        </pre>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">Verification Process:</strong> Implement a verification process to confirm the identity of the data subject making the request.
          </li>
          <li>
            <strong className="text-foreground">Response Timeframe:</strong> The NDPA requires organizations to respond to DSARs within 30 days. Ensure your process allows for timely responses.
          </li>
          <li>
            <strong className="text-foreground">Complete Responses:</strong> Provide complete information in response to access requests, including what data you hold, how it&apos;s used, who it&apos;s shared with, and its source.
          </li>
          <li>
            <strong className="text-foreground">Record Keeping:</strong> Maintain records of all DSARs and your responses to them. The DSRDashboard component helps with this.
          </li>
          <li>
            <strong className="text-foreground">Staff Training:</strong> Ensure staff handling DSARs are trained on the requirements of the NDPA and your internal processes.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Accessibility</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Data Subject Rights components are built with accessibility in mind:
        </p>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
          <li>Error messages are announced to screen readers</li>
        </ul>
      </section>

      <section id="help-resources" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          If you have questions about implementing the Data Subject Rights system or need assistance with NDPA compliance, check out these resources:
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
