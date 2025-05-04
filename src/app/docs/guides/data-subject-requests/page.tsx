'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function DataSubjectRequestsGuide() {
  return (
    <DocLayout
      title="Handling Data Subject Requests"
      description="Best practices for handling data subject rights requests with the NDPR Toolkit"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/demo/data-subject-rights">
            View DSR Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs/components/data-subject-rights">
            DSR Component Docs
          </Link>
        </Button>
      </div>
      
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="mb-4">
          The Nigeria Data Protection Regulation (NDPR) grants individuals (data subjects) specific rights regarding their personal data. 
          Organizations must have processes in place to receive, verify, and respond to these requests within the timeframes 
          specified by the regulation. This guide will help you implement a comprehensive system for handling data subject 
          requests using the NDPR Toolkit.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPR Data Subject Rights</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPR, data subjects have the following rights:
          </p>
          <ul className="list-disc pl-6 mt-2 text-blue-700 dark:text-blue-300 text-sm">
            <li><strong>Right of Access:</strong> To obtain confirmation of whether their data is being processed and access to that data</li>
            <li><strong>Right to Rectification:</strong> To have inaccurate personal data corrected</li>
            <li><strong>Right to Erasure:</strong> To have their personal data deleted in certain circumstances</li>
            <li><strong>Right to Restrict Processing:</strong> To limit how their data is used</li>
            <li><strong>Right to Data Portability:</strong> To receive their data in a structured, commonly used format</li>
            <li><strong>Right to Object:</strong> To object to certain types of processing, such as direct marketing</li>
          </ul>
        </div>
      </section>

      <section id="dsr-process" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The Data Subject Request Process</h2>
        <p className="mb-4">
          A complete data subject request (DSR) system covers the entire lifecycle of a request, from submission to resolution. 
          The NDPR Toolkit provides components for each stage of this process:
        </p>
        
        <div className="relative border-l-2 border-blue-500 pl-8 pb-8 space-y-10">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h3 className="text-xl font-bold">Request Submission</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              The first step is providing a way for data subjects to submit their requests. The NDPR Toolkit's DSRRequestForm 
              component is designed for this purpose.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DSRRequestForm } from '@tantainnovative/ndpr-toolkit';

function DSRSubmissionPage() {
  const requestTypes = [
    { id: 'access', label: 'Access my data' },
    { id: 'rectification', label: 'Correct my data' },
    { id: 'erasure', label: 'Delete my data' },
    { id: 'restriction', label: 'Restrict processing of my data' },
    { id: 'portability', label: 'Data portability' },
    { id: 'objection', label: 'Object to processing' }
  ];

  const handleSubmitRequest = (requestData) => {
    // Save request to your backend
    console.log('Request submitted:', requestData);
    
    // Example: Send to backend API
    fetch('/api/dsr-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
      // Show confirmation to user with reference number
      setRequestId(data.id);
      setSubmitted(true);
    });
  };

  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);

  return (
    <div>
      <h1>Submit a Data Subject Request</h1>
      
      {!submitted ? (
        <>
          <p>
            Use this form to exercise your rights under the Nigeria Data Protection Regulation (NDPR).
            We will respond to your request within 30 days.
          </p>
          
          <DSRRequestForm 
            onSubmit={handleSubmitRequest}
            requestTypes={requestTypes}
          />
        </>
      ) : (
        <div>
          <h2>Request Submitted</h2>
          <p>
            Your request has been submitted successfully. Your reference number is: <strong>{requestId}</strong>
          </p>
          <p>
            We will process your request and respond within 30 days. You can check the status of your request
            using your reference number.
          </p>
        </div>
      )}
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h3 className="text-xl font-bold">Identity Verification</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Before processing a request, you must verify the identity of the data subject to ensure they are who they claim to be. 
              The NDPR Toolkit provides utilities for identity verification.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                The level of identity verification should be proportionate to the sensitivity of the data and the potential 
                harm that could result from unauthorized access. For example, requests for access to highly sensitive data 
                may require more stringent verification than requests to update contact information.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h3 className="text-xl font-bold">Request Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Once the identity of the data subject has been verified, you need to assess the request to determine what action is required. 
              This includes identifying what data is involved, what systems it's stored in, and what actions need to be taken.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DSRAssessment } from '@tantainnovative/ndpr-toolkit';

function AssessRequest({ request }) {
  const handleAssessment = (assessment) => {
    // Save assessment to your backend
    console.log('Assessment completed:', assessment);
    
    // Example: Update request with assessment
    fetch(\`/api/dsr-requests/\${request.id}/assessment\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    });
  };

  return (
    <div>
      <h2>Assess Request</h2>
      <p>Request ID: {request.id}</p>
      <p>Request Type: {request.type}</p>
      
      <DSRAssessment
        request={request}
        onComplete={handleAssessment}
        dataSystems={[
          { id: 'crm', name: 'CRM System' },
          { id: 'marketing', name: 'Marketing Platform' },
          { id: 'analytics', name: 'Analytics Tools' },
          { id: 'email', name: 'Email System' },
          { id: 'billing', name: 'Billing System' }
        ]}
      />
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <h3 className="text-xl font-bold">Request Fulfillment</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Based on the assessment, you need to fulfill the request by taking the appropriate action, such as providing a copy of the data, 
              correcting inaccurate data, or deleting data. The NDPR Toolkit provides utilities for common fulfillment actions.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                For complex requests that involve multiple systems or departments, consider using a workflow management system 
                to track the progress of the request and ensure all necessary actions are taken.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">5</span>
            </div>
            <h3 className="text-xl font-bold">Response to Data Subject</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Once the request has been fulfilled, you need to respond to the data subject with the outcome of their request. 
              The NDPR Toolkit provides templates for common response types.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DSRResponse } from '@tantainnovative/ndpr-toolkit';

function GenerateResponse({ request, assessment, fulfillment }) {
  const handleGenerateResponse = (response) => {
    // Save response to your backend
    console.log('Response generated:', response);
    
    // Example: Send response to data subject
    fetch(\`/api/dsr-requests/\${request.id}/response\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });
  };

  return (
    <div>
      <h2>Generate Response</h2>
      <p>Request ID: {request.id}</p>
      <p>Request Type: {request.type}</p>
      
      <DSRResponse
        request={request}
        assessment={assessment}
        fulfillment={fulfillment}
        onGenerate={handleGenerateResponse}
        responseTypes={[
          'email',
          'letter',
          'portal'
        ]}
      />
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">6</span>
            </div>
            <h3 className="text-xl font-bold">Record Keeping</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              For compliance purposes, you must maintain records of all data subject requests and your responses to them. 
              The NDPR Toolkit provides utilities for maintaining detailed request records.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                Your record-keeping system should include the date of the request, the type of request, the actions taken, 
                the date of the response, and any supporting documentation. This information may be needed to demonstrate 
                compliance with the NDPR.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="admin-dashboard" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Administrative Dashboard</h2>
        <p className="mb-4">
          To efficiently manage data subject requests, you need an administrative dashboard that provides an overview of all requests 
          and their status. The NDPR Toolkit's DSRDashboard component is designed for this purpose.
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { DSRDashboard } from '@tantainnovative/ndpr-toolkit';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    // Fetch requests from your backend
    fetch('/api/dsr-requests')
      .then(response => response.json())
      .then(data => setRequests(data));
  }, []);
  
  const handleUpdateStatus = (requestId, status) => {
    // Update request status in your backend
    fetch(\`/api/dsr-requests/\${requestId}/status\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    .then(response => response.json())
    .then(data => {
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));
    });
  };
  
  const handleAssignRequest = (requestId, assignee) => {
    // Assign request to staff member in your backend
    fetch(\`/api/dsr-requests/\${requestId}/assign\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignee }),
    })
    .then(response => response.json())
    .then(data => {
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, assignedTo: assignee } : request
      ));
    });
  };
  
  const handleAddNote = (requestId, note) => {
    // Add note to request in your backend
    fetch(\`/api/dsr-requests/\${requestId}/notes\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    })
    .then(response => response.json())
    .then(data => {
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { 
          ...request, 
          notes: [...request.notes, data] 
        } : request
      ));
    });
  };

  return (
    <div>
      <h1>DSR Admin Dashboard</h1>
      
      <DSRDashboard 
        requests={requests}
        onUpdateStatus={handleUpdateStatus}
        onAssignRequest={handleAssignRequest}
        onAddNote={handleAddNote}
        staff={[
          { id: 'john', name: 'John Doe' },
          { id: 'jane', name: 'Jane Smith' },
          { id: 'bob', name: 'Bob Johnson' }
        ]}
        statuses={[
          { id: 'pending', label: 'Pending', color: 'yellow' },
          { id: 'verifying', label: 'Verifying Identity', color: 'blue' },
          { id: 'processing', label: 'Processing', color: 'purple' },
          { id: 'completed', label: 'Completed', color: 'green' },
          { id: 'rejected', label: 'Rejected', color: 'red' }
        ]}
      />
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="request-tracking" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Request Tracking for Data Subjects</h2>
        <p className="mb-4">
          Data subjects should be able to track the status of their requests. The NDPR Toolkit's DSRTracker component 
          provides a user interface for this purpose.
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { DSRTracker } from '@tantainnovative/ndpr-toolkit';

function RequestTrackingPage() {
  const [requestId, setRequestId] = useState('');
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  
  const handleTrackRequest = () => {
    // Fetch request status from your backend
    fetch(\`/api/dsr-requests/track?id=\${requestId}&email=\${email}\`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Request not found or email does not match');
        }
        return response.json();
      })
      .then(data => {
        setRequest(data);
        setError(null);
      })
      .catch(err => {
        setRequest(null);
        setError(err.message);
      });
  };

  return (
    <div>
      <h1>Track Your Request</h1>
      <p>
        Enter your request reference number and the email address you used to submit the request.
      </p>
      
      <div className="form-group">
        <label htmlFor="requestId">Request Reference Number</label>
        <input
          type="text"
          id="requestId"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <button onClick={handleTrackRequest}>Track Request</button>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {request && (
        <DSRTracker 
          request={request}
          statusDescriptions={{
            'pending': 'Your request has been received and is awaiting review.',
            'verifying': 'We are verifying your identity to process your request.',
            'processing': 'Your request is being processed.',
            'completed': 'Your request has been completed.',
            'rejected': 'Your request has been rejected. Please see the notes for more information.'
          }}
        />
      )}
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Clear Request Process</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Make it easy for data subjects to submit requests by providing a clear, accessible process. 
                Include information about what to expect and how long the process will take.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Robust Identity Verification</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Implement appropriate identity verification measures to ensure you're providing data to the right person. 
                This is crucial for preventing unauthorized access to personal data.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Timely Responses</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                The NDPR requires organizations to respond to data subject requests within 30 days. 
                Implement processes and systems that enable you to meet this deadline.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Comprehensive Data Mapping</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Maintain a comprehensive map of where personal data is stored in your organization. 
                This will help you quickly locate and retrieve data when responding to access requests.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Staff Training</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Ensure that staff who handle data subject requests are trained on the NDPR requirements 
                and your organization's processes. This includes understanding the different types of requests 
                and how to respond to them.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Detailed Record Keeping</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Maintain detailed records of all data subject requests and your responses to them. 
                This is essential for demonstrating compliance with the NDPR.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="handling-specific-requests" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Handling Specific Types of Requests</h2>
        
        <h3 className="text-xl font-bold mb-4">Access Requests</h3>
        <p className="mb-4">
          When handling access requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Locate all personal data you hold about the data subject</li>
          <li>Provide a copy of the data in a commonly used electronic format</li>
          <li>Include information about the purposes of processing, categories of data, recipients, retention periods, and data subject rights</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-4">Rectification Requests</h3>
        <p className="mb-4">
          When handling rectification requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Verify the accuracy of the new data provided</li>
          <li>Update the data in all systems where it's stored</li>
          <li>Inform any third parties with whom you've shared the data about the correction</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-4">Erasure Requests</h3>
        <p className="mb-4">
          When handling erasure requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Determine if one of the grounds for erasure applies</li>
          <li>Delete the data from all systems where it's stored</li>
          <li>Inform any third parties with whom you've shared the data about the erasure</li>
          <li>Implement technical measures to ensure the data is permanently deleted</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-4">Restriction Requests</h3>
        <p className="mb-4">
          When handling restriction requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Determine if one of the grounds for restriction applies</li>
          <li>Implement technical measures to restrict processing of the data</li>
          <li>Inform any third parties with whom you've shared the data about the restriction</li>
          <li>Inform the data subject before lifting the restriction</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-4">Portability Requests</h3>
        <p className="mb-4">
          When handling portability requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Extract the data in a structured, commonly used, machine-readable format</li>
          <li>Provide the data directly to the data subject or to another controller if requested and technically feasible</li>
          <li>Ensure the data includes only personal data provided by the data subject</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-4">Objection Requests</h3>
        <p className="mb-4">
          When handling objection requests, you should:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Verify the identity of the data subject</li>
          <li>Stop processing the data unless you can demonstrate compelling legitimate grounds that override the interests of the data subject</li>
          <li>Inform the data subject of your decision and their right to complain to the supervisory authority</li>
        </ul>
      </section>

      <section id="resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPR Implementation Framework</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Official guidance on implementing the NDPR, including data subject rights requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://nitda.gov.ng/wp-content/uploads/2020/01/NDPR-Implementation-Framework.pdf" target="_blank" rel="noopener noreferrer">
                  View Framework
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">DSR Component Documentation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Technical documentation for the Data Subject Rights components.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/data-subject-rights">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
