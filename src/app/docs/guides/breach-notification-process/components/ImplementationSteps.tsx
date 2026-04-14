'use client';

export default function ImplementationSteps() {
  return (
    <section id="implementation-steps" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Implementation Steps</h2>
      <p className="mb-4">
        Implementing a comprehensive breach notification process involves several key components from the NDPR Toolkit.
        Here&apos;s how to set up each part of the process:
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-3">1. Breach Detection and Reporting</h3>
          <p className="mb-3">
            The first step is to implement a system for detecting and reporting potential data breaches. The NDPR Toolkit&apos;s
            BreachReportForm component provides a structured way for staff to report suspected breaches.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            <pre className="text-foreground text-sm"><code>{`import { BreachReportForm } from '@tantainnovative/ndpr-toolkit';

function BreachReportingPage() {
  const breachCategories = [
    { id: 'unauthorized-access', label: 'Unauthorized Access' },
    { id: 'data-loss', label: 'Data Loss' },
    { id: 'system-compromise', label: 'System Compromise' },
    { id: 'phishing', label: 'Phishing Attack' },
    { id: 'other', label: 'Other' }
  ];

  const handleSubmitReport = (reportData) => {
    // Save report to your backend
    console.log('Breach report submitted:', reportData);

    // Example: Send to backend API
    fetch('/api/breach-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
    .then(response => response.json())
    .then(data => {
      // Show confirmation to user with reference number
      setBreachId(data.id);
      setSubmitted(true);
    });
  };

  const [submitted, setSubmitted] = useState(false);
  const [breachId, setBreachId] = useState(null);

  return (
    <div>
      <h1>Report a Data Breach</h1>

      {!submitted ? (
        <>
          <p>
            Use this form to report a suspected data breach. All breaches must be
            reported internally within 24 hours of discovery.
          </p>

          <BreachReportForm
            onSubmit={handleSubmitReport}
            categories={breachCategories}
          />
        </>
      ) : (
        <div>
          <h2>Breach Reported</h2>
          <p>
            The breach has been reported successfully. Reference number: <strong>{breachId}</strong>
          </p>
          <p>
            The breach response team has been notified and will begin investigating immediately.
          </p>
        </div>
      )}
    </div>
  );
}`}</code></pre>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">2. Risk Assessment</h3>
          <p className="mb-3">
            Once a breach is reported, you need to assess the risk to determine if notification is required and to whom.
            The BreachRiskAssessment component guides users through this process.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            <pre className="text-foreground text-sm"><code>{`import { BreachRiskAssessment } from '@tantainnovative/ndpr-toolkit';

function RiskAssessmentPage({ breachData }) {
  const handleRiskAssessmentComplete = (assessment) => {
    // Save assessment to your backend
    console.log('Risk assessment completed:', assessment);

    // Example: Update breach record with assessment
    fetch(\`/api/breach-reports/\${breachData.id}/assessment\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    })
    .then(response => response.json())
    .then(data => {
      // Update UI based on assessment results
      setAssessmentComplete(true);
      setRequiresNotification(assessment.requiresNdpcNotification);
    });
  };

  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [requiresNotification, setRequiresNotification] = useState(false);

  return (
    <div>
      <h1>Breach Risk Assessment</h1>
      <p>Breach ID: {breachData.id}</p>

      {!assessmentComplete ? (
        <>
          <p>
            Complete this assessment to determine the risk level of the breach and whether
            notification to NDPC and/or data subjects is required.
          </p>

          <BreachRiskAssessment
            breachData={breachData}
            onComplete={handleRiskAssessmentComplete}
          />
        </>
      ) : (
        <div>
          <h2>Assessment Complete</h2>
          {requiresNotification ? (
            <p>
              This breach requires notification to NDPC within 72 hours. Please proceed
              to the notification preparation step.
            </p>
          ) : (
            <p>
              Based on the assessment, this breach does not require notification to NDPC.
              However, you should still document the breach and the actions taken.
            </p>
          )}
        </div>
      )}
    </div>
  );
}`}</code></pre>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">3. Notification Management</h3>
          <p className="mb-3">
            For breaches that require notification, you need a system to manage the notification process.
            The BreachNotificationManager component provides a dashboard for tracking notifications.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            <pre className="text-foreground text-sm"><code>{`import { BreachNotificationManager } from '@tantainnovative/ndpr-toolkit';

function NotificationManagementPage() {
  const [breaches, setBreaches] = useState([]);

  useEffect(() => {
    // Fetch breaches that require notification
    fetch('/api/breach-reports?requiresNotification=true')
      .then(response => response.json())
      .then(data => setBreaches(data));
  }, []);

  const handleUpdateStatus = (breachId, status) => {
    // Update breach status in your backend
    fetch(\`/api/breach-reports/\${breachId}/status\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    .then(response => response.json())
    .then(data => {
      // Update local state
      setBreaches(breaches.map(breach =>
        breach.id === breachId ? { ...breach, status } : breach
      ));
    });
  };

  const handleSendNotification = (breachId, notification) => {
    // Record notification in your backend
    fetch(\`/api/breach-reports/\${breachId}/notifications\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    })
    .then(response => response.json())
    .then(data => {
      // Update local state
      setBreaches(breaches.map(breach =>
        breach.id === breachId ? {
          ...breach,
          notifications: [...breach.notifications, data]
        } : breach
      ));
    });
  };

  return (
    <div>
      <h1>Breach Notification Management</h1>

      <BreachNotificationManager
        breaches={breaches}
        onUpdateStatus={handleUpdateStatus}
        onSendNotification={handleSendNotification}
      />
    </div>
  );
}`}</code></pre>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">4. Regulatory Report Generation</h3>
          <p className="mb-3">
            For breaches that require notification to NDPC, you need to prepare a formal report.
            The RegulatoryReportGenerator component helps create NDPA 2023-compliant breach notification reports.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            <pre className="text-foreground text-sm"><code>{`import { RegulatoryReportGenerator } from '@tantainnovative/ndpr-toolkit';

function ReportGenerationPage({ breachData }) {
  const organizationInfo = {
    name: 'Example Company Ltd.',
    address: '123 Main Street, Lagos, Nigeria',
    dpoName: 'John Doe',
    dpoEmail: 'dpo@example.com',
    dpoPhone: '+234 123 456 7890'
  };

  const handleGenerateReport = (report) => {
    // Save report to your backend
    console.log('Report generated:', report);

    // Example: Save report and update breach record
    fetch(\`/api/breach-reports/\${breachData.id}/regulatory-report\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    })
    .then(response => response.json())
    .then(data => {
      // Update UI to show report has been generated
      setReportGenerated(true);
    });
  };

  const [reportGenerated, setReportGenerated] = useState(false);

  return (
    <div>
      <h1>Generate NDPC Notification Report</h1>
      <p>Breach ID: {breachData.id}</p>

      {!reportGenerated ? (
        <>
          <p>
            Generate a NDPC breach notification report for submission. This report must be
            submitted within 72 hours of becoming aware of the breach.
          </p>

          <RegulatoryReportGenerator
            breachData={breachData}
            organizationInfo={organizationInfo}
            onGenerate={handleGenerateReport}
          />
        </>
      ) : (
        <div>
          <h2>Report Generated</h2>
          <p>
            The NDPC notification report has been generated successfully. Please review
            the report and submit it to NDPC as soon as possible.
          </p>
          <button>Download Report</button>
          <button>Submit to NDPC</button>
        </div>
      )}
    </div>
  );
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3">Putting It All Together</h3>
        <p className="mb-3">
          To implement a complete breach notification process, you need to integrate these components into a cohesive workflow.
          This typically involves:
        </p>
        <ul className="list-disc pl-6 mb-4 text-foreground">
          <li>Creating a breach response plan that defines roles, responsibilities, and procedures</li>
          <li>Implementing the NDPR Toolkit components as part of your breach response system</li>
          <li>Setting up automated notifications to alert the breach response team when a breach is reported</li>
          <li>Establishing clear escalation paths based on the risk assessment results</li>
          <li>Creating templates for common types of notifications to speed up the response process</li>
          <li>Regularly testing the breach response process through tabletop exercises or simulations</li>
        </ul>
        <p>
          The NDPR Toolkit provides all the necessary components to implement this workflow, but it&apos;s important to
          adapt it to your organization&apos;s specific needs and integrate it with your existing systems.
        </p>
      </div>
    </section>
  );
}
