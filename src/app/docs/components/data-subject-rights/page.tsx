'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function DataSubjectRightsDocs() {
  return (
    <DocLayout
      title="Data Subject Rights Portal"
      description="NDPA 2023-compliant portal for managing data subject rights requests"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/demo/data-subject-rights">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/tantainnovative/ndpr-toolkit/tree/main/src/components/data-subject-rights" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Data Subject Rights Portal provides a complete solution for handling data subject access requests (DSARs)
          and other rights requests in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes a request
          submission form, admin dashboard for managing requests, and a tracking system for data subjects.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Data Subject Rights</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, data subjects have several rights, including the right to access their personal data,
            right to rectification, right to erasure, right to restrict processing, right to data portability, and
            right to object to processing. Organizations must respond to these requests within 30 days.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Data Subject Rights components:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>npm install @tantainnovative/ndpr-toolkit</code></pre>
        </div>
        <p>
          Or if you&apos;re using yarn:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>yarn add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Data Subject Rights system includes several components that work together:
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">DSRRequestForm</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A form for data subjects to submit rights requests, with support for different request types.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { DSRRequestForm, DSRType } from '@tantainnovative/ndpr-toolkit';

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
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">DSRDashboard</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              An admin dashboard for managing and responding to data subject rights requests.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { DSRDashboard } from '@tantainnovative/ndpr-toolkit';

<DSRDashboard 
  requests={dsrRequests}
  onUpdateRequest={handleUpdateRequest}
  onDeleteRequest={handleDeleteRequest}
  onAssignRequest={handleAssignRequest}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">DSRTracker</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A component for data subjects to track the status of their requests.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { DSRTracker } from '@tantainnovative/ndpr-toolkit';

<DSRTracker 
  requestId="dsr-123456"
  onLookup={handleLookupRequest}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">BreachReportForm</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A form for reporting data breaches, which is a requirement under the NDPA.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { BreachReportForm } from '@tantainnovative/ndpr-toolkit';

<BreachReportForm 
  onSubmit={handleSubmitBreachReport}
  formDescription="Report a data breach that has occurred within your organization."
  recipientEmail="dpo@example.com"
/>`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement the Data Subject Rights system in your application:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState, useEffect } from 'react';
import { 
  DSRRequestForm, 
  DSRDashboard, 
  DSRTracker,
  useDSR,
  DSRType,
  DSRStatus
} from '@tantainnovative/ndpr-toolkit';

// Define your request types
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
    
    // Show the tracking ID to the user
    alert(\`Your request has been submitted. Your tracking ID is: \${newRequest.id}\`);
  };
  
  const handleLookupRequest = (id) => {
    const request = getRequestById(id);
    return request;
  };
  
  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('submit')}>Submit Request</button>
        <button onClick={() => setActiveTab('track')}>Track Request</button>
        <button onClick={() => setActiveTab('admin')}>Admin Dashboard</button>
      </nav>
      
      {activeTab === 'submit' && (
        <DSRRequestForm 
          onSubmit={handleSubmitRequest}
          requestTypes={requestTypes}
        />
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
          <button onClick={() => setActiveTab('tracking')}>Track</button>
          
          {activeTab === 'tracking' && trackingId && (
            <DSRTracker 
              requestId={trackingId}
              onLookup={handleLookupRequest}
            />
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
}`}</code></pre>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        
        <h3 className="text-xl font-bold mt-8 mb-4">DSRRequestForm Props</h3>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onSubmit</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(request: DSRFormData) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback function when form is submitted</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">requestTypes</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`Array<{id: string, label: string}>`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of request types to display</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">title</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;Submit a Data Subject Rights Request&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Form title</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">description</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;Use this form to submit a request...&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Form description</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">submitButtonText</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&apos;Submit Request&apos;</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Text for the submit button</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">useDSR Hook</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`// Import the hook
import { useDSR } from '@tantainnovative/ndpr-toolkit';

// Use the hook in your component
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

// Get a request by ID
const request = getRequestById('request-id');

// Filter requests
const pendingRequests = filterRequestsByStatus('pending');
const accessRequests = filterRequestsByType('access');`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DSRType Enum</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export type DSRType = 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DSRStatus Enum</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export type DSRStatus = 'pending' | 'awaitingVerification' | 'inProgress' | 'completed' | 'rejected';`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DSRRequest Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface DSRRequest {
  /**
   * Unique identifier for the request
   */
  id: string;
  
  /**
   * Type of request
   */
  type: DSRType;
  
  /**
   * Current status of the request
   */
  status: DSRStatus;
  
  /**
   * Timestamp when the request was submitted
   */
  createdAt: number;
  
  /**
   * Timestamp when the request was last updated
   */
  updatedAt: number;
  
  /**
   * Timestamp when the request was completed (if applicable)
   */
  completedAt?: number;
  
  /**
   * Timestamp when the identity was verified (if applicable)
   */
  verifiedAt?: number;
  
  /**
   * Due date for responding to the request (timestamp)
   */
  dueDate?: number;
  
  /**
   * Description or details of the request
   */
  description?: string;
  
  /**
   * Data subject information
   */
  subject: {
    /**
     * Name of the data subject
     */
    name: string;
    
    /**
     * Email address of the data subject
     */
    email: string;
    
    /**
     * Phone number of the data subject (optional)
     */
    phone?: string;
    
    /**
     * Identifier used to verify the data subject's identity (optional)
     */
    identifierValue?: string;
    
    /**
     * Type of identifier used (e.g., "email", "account", "customer_id") (optional)
     */
    identifierType?: string;
  };
  
  /**
   * Additional information provided by the data subject
   */
  additionalInfo?: Record<string, any>;
  
  /**
   * Notes added by staff processing the request
   */
  internalNotes?: Array<{
    timestamp: number;
    author: string;
    note: string;
  }>;
}`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Verification Process:</strong> Implement a verification process to confirm the identity of the data subject making the request.
          </li>
          <li>
            <strong>Response Timeframe:</strong> The NDPA requires organizations to respond to DSARs within 30 days. Ensure your process allows for timely responses.
          </li>
          <li>
            <strong>Complete Responses:</strong> Provide complete information in response to access requests, including what data you hold, howit&apos;s used, whoit&apos;s shared with, and its source.
          </li>
          <li>
            <strong>Record Keeping:</strong> Maintain records of all DSARs and your responses to them. The DSRDashboard component helps with this.
          </li>
          <li>
            <strong>Staff Training:</strong> Ensure staff handling DSARs are trained on the requirements of the NDPA and your internal processes.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
        <p className="mb-4">
          The Data Subject Rights components are built with accessibility in mind:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
          <li>Error messages are announced to screen readers</li>
        </ul>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          If you have questions about implementing the Data Subject Rights system or need assistance with NDPA compliance, check out these resources:
        </p>
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
                  NDPA Framework
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
