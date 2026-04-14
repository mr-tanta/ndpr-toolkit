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
              <code className="text-sm text-foreground font-mono">{`import { DSRRequestForm, DSRType } from '@tantainnovative/ndpr-toolkit';

<DSRRequestForm
  onSubmit={handleSubmitRequest}
  requestTypes={[
    { id: 'access', label: 'Access my data' },
    { id: 'rectification', label: 'Correct my data' },
    { id: 'erasure', label: 'Delete my data' },
    { id: 'restriction', label: 'Restrict processing of my data' },
    { id: 'portability', label: 'Data portability' },
    { id: 'objection', label: 'Object to processing' }
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
  requestId="dsr-123456"
  onLookup={handleLookupRequest}
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
          <code className="text-sm text-foreground font-mono">{`import { useState, useEffect } from 'react';
import {
  DSRRequestForm,
  DSRDashboard,
  DSRTracker,
  useDSR,
  DSRType,
  DSRStatus
} from '@tantainnovative/ndpr-toolkit';

const requestTypes = [
  { id: 'access', label: 'Access my data' },
  { id: 'rectification', label: 'Correct my data' },
  { id: 'erasure', label: 'Delete my data' },
  { id: 'restriction', label: 'Restrict processing of my data' },
  { id: 'portability', label: 'Data portability' },
  { id: 'objection', label: 'Object to processing' }
];

function DSRPortal() {
  const [activeTab, setActiveTab] = useState('submit');
  const [trackingId, setTrackingId] = useState('');

  const {
    requests,
    submitRequest,
    updateRequest,
    deleteRequest,
    getRequestById
  } = useDSR();

  const handleSubmitRequest = (request) => {
    const newRequest = submitRequest({
      type: request.type,
      subject: {
        name: request.name,
        email: request.email,
        phone: request.phone
      },
      details: request.details
    });
    alert(\`Your request has been submitted. Your tracking ID is: \${newRequest.id}\`);
  };

  const handleLookupRequest = (id) => {
    return getRequestById(id);
  };

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('submit')}>Submit Request</button>
        <button onClick={() => setActiveTab('track')}>Track Request</button>
        <button onClick={() => setActiveTab('admin')}>Admin Dashboard</button>
      </nav>

      {activeTab === 'submit' && (
        <DSRRequestForm onSubmit={handleSubmitRequest} requestTypes={requestTypes} />
      )}

      {activeTab === 'track' && (
        <div>
          <h2>Track Your Request</h2>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter your tracking ID"
          />
          {trackingId && (
            <DSRTracker requestId={trackingId} onLookup={handleLookupRequest} />
          )}
        </div>
      )}

      {activeTab === 'admin' && (
        <DSRDashboard
          requests={requests}
          onUpdateRequest={updateRequest}
          onDeleteRequest={deleteRequest}
        />
      )}
    </div>
  );
}`}</code>
        </pre>
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
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(request: DSRFormData) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function when form is submitted</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">requestTypes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`Array<{id: string, label: string}>`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of request types to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Submit a Data Subject Rights Request&apos;</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Form title</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">&apos;Use this form to submit a request...&apos;</td>
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
          <code className="text-sm text-foreground font-mono">{`import { useDSR } from '@tantainnovative/ndpr-toolkit';

const {
  requests,                // Array of all DSR requests
  submitRequest,           // Function to submit a new request
  updateRequest,           // Function to update an existing request
  deleteRequest,           // Function to delete a request
  getRequestById,          // Function to get a request by ID
  filterRequestsByStatus,  // Function to filter requests by status
  filterRequestsByType     // Function to filter requests by type
} = useDSR();

// Submit a new request
const newRequest = submitRequest({
  type: 'access',
  subject: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890'
  },
  details: 'I would like to access all my personal data.'
});

// Update a request
updateRequest('request-id', {
  status: 'inProgress',
  assignedTo: 'data-officer@example.com'
});

// Filter requests
const pendingRequests = filterRequestsByStatus('pending');
const accessRequests = filterRequestsByType('access');`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DSRType Enum</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export type DSRType = 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';`}</code>
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
  additionalInfo?: Record<string, any>;
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
