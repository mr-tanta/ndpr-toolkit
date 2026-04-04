'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function BreachNotificationDocs() {
  return (
    <DocLayout
      title="Breach Notification System"
      description="NDPA 2023-compliant system for managing and reporting data breaches"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/breach-notification">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/tantainnovative/ndpr-toolkit/tree/main/src/components/breach-notification" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Breach Notification System provides a complete solution for detecting, managing, and reporting data breaches
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). It includes components for breach reporting,
          risk assessment, notification management, and regulatory reporting.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Breach Notification Requirements</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, organizations must report data breaches to the Nigeria Data Protection Commission (NDPC)
            within 72 hours of becoming aware of the breach. Organizations must also notify affected data subjects without undue delay.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Breach Notification components:
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
          The Breach Notification system includes several components that work together:
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">BreachReportForm</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A form for internal staff to report suspected data breaches, capturing essential details.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { BreachReportForm } from '@tantainnovative/ndpr-toolkit';

<BreachReportForm 
  onSubmit={handleSubmitBreachReport}
  categories={[
    { id: 'unauthorized-access', label: 'Unauthorized Access' },
    { id: 'data-loss', label: 'Data Loss' },
    { id: 'system-compromise', label: 'System Compromise' },
    { id: 'phishing', label: 'Phishing Attack' },
    { id: 'other', label: 'Other' }
  ]}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">BreachRiskAssessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A tool for assessing the risk level of a data breach and determining notification requirements.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { BreachRiskAssessment } from '@tantainnovative/ndpr-toolkit';

<BreachRiskAssessment 
  breachData={breachData}
  onComplete={handleRiskAssessmentComplete}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">BreachNotificationManager</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A dashboard for managing breach notifications, including tracking notification status and deadlines.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { BreachNotificationManager } from '@tantainnovative/ndpr-toolkit';

<BreachNotificationManager 
  breaches={breaches}
  onUpdateStatus={handleUpdateStatus}
  onSendNotification={handleSendNotification}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">RegulatoryReportGenerator</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A tool for generating NDPA-compliant breach notification reports for submission to the NDPC.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { RegulatoryReportGenerator } from '@tantainnovative/ndpr-toolkit';

<RegulatoryReportGenerator 
  breachData={breachData}
  organizationInfo={organizationInfo}
  onGenerate={handleGenerateReport}
/>`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement the Breach Notification system in your application:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState, useEffect } from 'react';
import { 
  BreachReportForm, 
  BreachRiskAssessment, 
  BreachNotificationManager,
  RegulatoryReportGenerator
} from '@tantainnovative/ndpr-toolkit';

// Define breach categories
const breachCategories = [
  { id: 'unauthorized-access', label: 'Unauthorized Access' },
  { id: 'data-loss', label: 'Data Loss' },
  { id: 'system-compromise', label: 'System Compromise' },
  { id: 'phishing', label: 'Phishing Attack' },
  { id: 'other', label: 'Other' }
];

// Organization information
const organizationInfo = {
  name: 'Example Company Ltd.',
  address: '123 Main Street, Lagos, Nigeria',
  dpoName: 'John Doe',
  dpoEmail: 'dpo@example.com',
  dpoPhone: '+234 123 456 7890'
};

// Sample breach service (replace with your actual data service)
const breachService = {
  breaches: [],
  
  reportBreach: (breachData) => {
    const newBreach = {
      ...breachData,
      id: \`breach-\${Date.now()}\`,
      status: 'reported',
      reportedAt: new Date(),
      riskAssessment: null,
      notifications: [],
      regulatoryReport: null
    };
    breachService.breaches.push(newBreach);
    return newBreach;
  },
  
  getBreaches: () => {
    return breachService.breaches;
  },
  
  getBreachById: (id) => {
    return breachService.breaches.find(breach => breach.id === id);
  },
  
  updateBreachStatus: (id, status) => {
    const breach = breachService.breaches.find(breach => breach.id === id);
    if (breach) {
      breach.status = status;
      breach.updatedAt = new Date();
    }
    return breach;
  },
  
  saveRiskAssessment: (id, assessment) => {
    const breach = breachService.breaches.find(breach => breach.id === id);
    if (breach) {
      breach.riskAssessment = assessment;
      breach.updatedAt = new Date();
      
      // Update status based on risk level
      if (assessment.riskLevel === 'high') {
        breach.status = 'high-risk';
      } else if (assessment.riskLevel === 'medium') {
        breach.status = 'medium-risk';
      } else {
        breach.status = 'low-risk';
      }
    }
    return breach;
  },
  
  recordNotification: (id, notification) => {
    const breach = breachService.breaches.find(breach => breach.id === id);
    if (breach) {
      breach.notifications.push({
        ...notification,
        id: \`notification-\${Date.now()}\`,
        sentAt: new Date()
      });
      breach.updatedAt = new Date();
      
      // Update status if all required notifications are sent
      if (breach.notifications.length >= breach.riskAssessment.requiredNotifications.length) {
        breach.status = 'notifications-complete';
      }
    }
    return breach;
  },
  
  saveRegulatoryReport: (id, report) => {
    const breach = breachService.breaches.find(breach => breach.id === id);
    if (breach) {
      breach.regulatoryReport = {
        ...report,
        generatedAt: new Date()
      };
      breach.status = 'report-generated';
      breach.updatedAt = new Date();
    }
    return breach;
  }
};

// Breach reporting form component
function BreachReportingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [currentBreach, setCurrentBreach] = useState(null);
  
  const handleSubmitBreachReport = (breachData) => {
    const newBreach = breachService.reportBreach(breachData);
    setCurrentBreach(newBreach);
    setSubmitted(true);
  };
  
  const handleRiskAssessmentComplete = (assessment) => {
    const updatedBreach = breachService.saveRiskAssessment(currentBreach.id, assessment);
    setCurrentBreach(updatedBreach);
  };
  
  return (
    <div>
      <h1>Data Breach Reporting</h1>
      
      {!submitted ? (
        <>
          <p>
            Use this form to report a suspected data breach. All breaches must be
            reported internally within 24 hours of discovery.
          </p>
          
          <BreachReportForm 
            onSubmit={handleSubmitBreachReport}
            categories={breachCategories}
          />
        </>
      ) : (
        <div>
          <h2>Breach Reported</h2>
          <p>
            The breach has been reported successfully. Reference number: <strong>{currentBreach.id}</strong>
          </p>
          
          <h3>Risk Assessment</h3>
          <p>
            Please complete the risk assessment to determine notification requirements.
          </p>
          
          <BreachRiskAssessment 
            breachData={currentBreach}
            onComplete={handleRiskAssessmentComplete}
          />
          
          {currentBreach.riskAssessment && (
            <div>
              <h3>Risk Assessment Complete</h3>
              <p>
                Risk Level: <strong>{currentBreach.riskAssessment.riskLevel}</strong>
              </p>
              <p>
                {currentBreach.riskAssessment.requiresNitdaNotification 
                  ? 'NDPC notification is required within 72 hours.'
                  : 'NDPC notification is not required.'}
              </p>
              <p>
                {currentBreach.riskAssessment.requiresDataSubjectNotification 
                  ? 'Data subject notification is required without undue delay.' 
                  : 'Data subject notification is not required.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Breach management dashboard component
function BreachManagementDashboard() {
  const [breaches, setBreaches] = useState([]);
  const [selectedBreach, setSelectedBreach] = useState(null);
  
  useEffect(() => {
    // Load breaches from service
    setBreaches(breachService.getBreaches());
  }, []);
  
  const handleUpdateStatus = (id, status) => {
    const updatedBreach = breachService.updateBreachStatus(id, status);
    setBreaches(breachService.getBreaches());
  };
  
  const handleSendNotification = (id, notification) => {
    const updatedBreach = breachService.recordNotification(id, notification);
    setBreaches(breachService.getBreaches());
  };
  
  const handleGenerateReport = (id, report) => {
    const updatedBreach = breachService.saveRegulatoryReport(id, report);
    setBreaches(breachService.getBreaches());
    setSelectedBreach(updatedBreach);
  };
  
  return (
    <div>
      <h1>Breach Management Dashboard</h1>
      
      <BreachNotificationManager 
        breaches={breaches}
        onUpdateStatus={handleUpdateStatus}
        onSendNotification={handleSendNotification}
        onSelectBreach={setSelectedBreach}
      />
      
      {selectedBreach && selectedBreach.riskAssessment && 
       selectedBreach.riskAssessment.requiresNitdaNotification && (
        <div>
          <h2>Regulatory Report Generator</h2>
          <p>
            Generate an NDPC breach notification report for submission.
          </p>
          
          <RegulatoryReportGenerator 
            breachData={selectedBreach}
            organizationInfo={organizationInfo}
            onGenerate={(report) => handleGenerateReport(selectedBreach.id, report)}
          />
        </div>
      )}
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="props" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Props</h2>
        
        <h3 className="text-xl font-bold mb-4">BreachReportForm Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Required</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>onSubmit</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>(data: BreachReport) =&gt; void</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yes</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback function when user submits a breach report</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>categories</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>{'{ id: string, label: string }[]'}</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yes</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of breach categories to display</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>initialValues</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>Partial&lt;BreachReport&gt;</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">No</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Initial values for the form fields</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">BreachReport Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type BreachReport = {
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
};`}</code></pre>
        </div>
      </section>

      <section id="72-hour-timeline" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">72-Hour Notification Timeline</h2>
        <p className="mb-4">
          The NDPA requires organizations to notify the NDPC of data breaches within 72 hours of becoming aware of the breach. 
          Here&apos;s a recommended timeline for handling breaches:
        </p>
        
        <div className="relative border-l-2 border-blue-500 pl-8 pb-8 space-y-10">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h3 className="text-xl font-bold">Hour 0-4: Initial Response</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              - Report the breach internally using the BreachReportForm<br />
              - Assemble the response team<br />
              - Begin containment measures<br />
              - Preserve evidence
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h3 className="text-xl font-bold">Hour 4-24: Risk Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              - Complete the BreachRiskAssessment<br />
              - Determine notification requirements<br />
              - Continue containment and investigation<br />
              - Begin preparing notification drafts
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h3 className="text-xl font-bold">Hour 24-48: Notification Preparation</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              - Use the RegulatoryReportGenerator to prepare NDPC notification<br />
              - Draft data subject notifications if required<br />
              - Review and approve notifications<br />
              - Continue investigation and remediation
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <h3 className="text-xl font-bold">Hour 48-72: Notification Submission</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              - Submit notification to NDPC<br />
              - Begin notifying affected data subjects if required<br />
              - Document all notification activities<br />
              - Continue remediation efforts
            </p>
          </div>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        
        <h3 className="text-xl font-bold mt-8 mb-4">BreachReport Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface BreachReport {
  /**
   * Unique identifier for the breach report
   */
  id: string;
  
  /**
   * Title/summary of the breach
   */
  title: string;
  
  /**
   * Detailed description of the breach
   */
  description: string;
  
  /**
   * Category of the breach
   */
  category: string;
  
  /**
   * Timestamp when the breach was discovered
   */
  discoveredAt: number;
  
  /**
   * Timestamp when the breach occurred (if known)
   */
  occurredAt?: number;
  
  /**
   * Timestamp when the breach was reported internally
   */
  reportedAt: number;
  
  /**
   * Person who reported the breach
   */
  reporter: {
    name: string;
    email: string;
    department: string;
    phone?: string;
  };
  
  /**
   * Systems or data affected by the breach
   */
  affectedSystems: string[];
  
  /**
   * Types of data involved in the breach
   */
  dataTypes: string[];
  
  /**
   * Estimated number of data subjects affected
   */
  estimatedAffectedSubjects?: number;
  
  /**
   * Whether the breach is ongoing or contained
   */
  status: 'ongoing' | 'contained' | 'resolved';
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">RiskAssessment Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface RiskAssessment {
  /**
   * Unique identifier for the risk assessment
   */
  id: string;
  
  /**
   * ID of the breach this assessment is for
   */
  breachId: string;
  
  /**
   * Timestamp when the assessment was conducted
   */
  assessedAt: number;
  
  /**
   * Person who conducted the assessment
   */
  assessor: {
    name: string;
    role: string;
    email: string;
  };
  
  /**
   * Confidentiality impact (1-5)
   */
  confidentialityImpact: number;
  
  /**
   * Integrity impact (1-5)
   */
  integrityImpact: number;
  
  /**
   * Availability impact (1-5)
   */
  availabilityImpact: number;
  
  /**
   * Likelihood of harm to data subjects (1-5)
   */
  harmLikelihood: number;
  
  /**
   * Severity of potential harm to data subjects (1-5)
   */
  harmSeverity: number;
  
  /**
   * Overall risk score
   */
  overallRiskScore: number;
  
  /**
   * Risk level based on the overall score
   */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Whether the breach is likely to result in a risk to the rights and freedoms of data subjects
   */
  risksToRightsAndFreedoms: boolean;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">NotificationRequirement Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface NotificationRequirement {
  /**
   * Whether NDPC notification is required
   */
  nitdaNotificationRequired: boolean;

  /**
   * Deadline for NDPC notification (72 hours from discovery)
   */
  nitdaNotificationDeadline: number;
  
  /**
   * Whether data subject notification is required
   */
  dataSubjectNotificationRequired: boolean;
  
  /**
   * Justification for the notification decision
   */
  justification: string;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">useBreach Hook</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`// Import the hook
import { useBreach } from '@tantainnovative/ndpr-toolkit';

// Use the hook in your component
const { 
  breaches,               // Array of all breach reports
  submitBreachReport,     // Function to submit a new breach report
  updateBreachReport,     // Function to update an existing breach report
  performRiskAssessment,  // Function to perform a risk assessment
  determineNotificationRequirements,  // Function to determine notification requirements
  generateRegulatoryReport,  // Function to generate a report for the NDPC
  getBreachById,          // Function to get a breach by ID
} = useBreach();

// Submit a new breach report
const newBreachReport = submitBreachReport({
  title: 'Unauthorized Database Access',
  description: 'An unauthorized IP address accessed our customer database.',
  category: 'unauthorized-access',
  discoveredAt: Date.now(),
  occurredAt: Date.now() - 3600000, // 1 hour ago
  reporter: {
    name: 'John Doe',
    email: 'john@example.com',
    department: 'IT Security',
    phone: '1234567890'
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
if (requirements.nitdaNotificationRequired) {
  const report = generateRegulatoryReport({
    breachId: newBreachReport.id,
    riskAssessmentId: riskAssessment.id
  });
}`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Breach Response Plan:</strong> Develop a comprehensive breach response plan that includes roles, responsibilities, and procedures.
          </li>
          <li>
            <strong>Regular Training:</strong> Conduct regular training for staff on breach identification, reporting, and response procedures.
          </li>
          <li>
            <strong>Documentation:</strong> Maintain detailed documentation of all breach-related activities, including containment, investigation, and notification.
          </li>
          <li>
            <strong>Testing:</strong> Regularly test your breach response procedures through tabletop exercises or simulations.
          </li>
          <li>
            <strong>Post-Breach Review:</strong> Conduct a thorough review after each breach to identify lessons learned and improve your response procedures.
          </li>
        </ul>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          If you have questions about implementing the Breach Notification system or need assistance with NDPA compliance, check out these resources:
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
