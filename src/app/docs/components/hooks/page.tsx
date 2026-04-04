'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function HooksDocs() {
  return (
    <DocLayout
      title="React Hooks"
      description="Custom React hooks for managing state and logic in NDPA-compliant applications"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/tantainnovative/ndpr-toolkit/tree/main/src/hooks" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The NDPR Toolkit provides a set of custom React hooks to help manage state and logic in your NDPA-compliant applications.
          These hooks encapsulate common functionality and make it easier to implement complex features.
        </p>
      </section>

      <section id="hooks" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Hooks</h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">useConsent</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A hook for managing consent state and preferences.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

function ConsentManager() {
  const { 
    consents,            // Current consent settings
    updateConsent,       // Function to update a specific consent
    saveConsents,        // Function to save all consents
    resetConsents,       // Function to reset consents to default
    hasConsented,        // Function to check if user has consented to a specific option
    isConsentRequired    // Function to check if consent is required
  } = useConsent();
  
  // Example usage
  return (
    <div>
      <h2>Consent Preferences</h2>
      <label>
        <input
          type="checkbox"
          checked={hasConsented('analytics')}
          onChange={(e) => updateConsent('analytics', e.target.checked)}
        />
        Analytics Cookies
      </label>
      <button onClick={() => saveConsents()}>Save Preferences</button>
    </div>
  );
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">useDSR</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A hook for managing Data Subject Rights (DSR) requests.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';

function DSRManager() {
  const { 
    requests,            // List of DSR requests
    submitRequest,       // Function to submit a new request
    updateRequest,       // Function to update an existing request
    getRequestById,      // Function to get a request by ID
    filterRequests       // Function to filter requests by criteria
  } = useDSR();
  
  // Example usage
  const handleSubmit = (formData) => {
    submitRequest({
      type: 'access',
      subject: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      description: formData.description
    });
  };
  
  return (
    <div>
      <h2>DSR Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.id}>
            {request.subject.name} - {request.type} - {request.status}
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">useDPIA</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A hook for managing Data Protection Impact Assessment (DPIA) state.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { useDPIA } from '@tantainnovative/ndpr-toolkit/hooks';

function DPIAManager() {
  const { 
    assessment,          // Current DPIA assessment
    currentStep,         // Current step in the DPIA process
    totalSteps,          // Total number of steps
    goToStep,            // Function to navigate to a specific step
    nextStep,            // Function to go to the next step
    prevStep,            // Function to go to the previous step
    updateAnswer,        // Function to update an answer
    calculateRisk,       // Function to calculate risk score
    generateReport       // Function to generate a DPIA report
  } = useDPIA();
  
  // Example usage
  return (
    <div>
      <h2>DPIA Questionnaire</h2>
      <p>Step {currentStep} of {totalSteps}</p>
      <button onClick={prevStep} disabled={currentStep === 1}>Previous</button>
      <button onClick={nextStep} disabled={currentStep === totalSteps}>Next</button>
      <button onClick={generateReport}>Generate Report</button>
    </div>
  );
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">useBreach</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A hook for managing data breach notifications and assessments.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { useBreach } from '@tantainnovative/ndpr-toolkit/hooks';

function BreachManager() {
  const { 
    breaches,            // List of breach reports
    currentBreach,       // Currently selected breach
    submitBreachReport,  // Function to submit a new breach report
    updateBreachStatus,  // Function to update breach status
    assessRisk,          // Function to assess breach risk
    generateReport       // Function to generate regulatory reports
  } = useBreach();
  
  // Example usage
  return (
    <div>
      <h2>Data Breach Management</h2>
      <ul>
        {breaches.map(breach => (
          <li key={breach.id}>
            {breach.title} - {breach.status} - Risk Level: {breach.riskLevel}
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">usePrivacyPolicy</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A hook for managing privacy policy generation and customization.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { usePrivacyPolicy } from '@tantainnovative/ndpr-toolkit/hooks';

function PrivacyPolicyManager() {
  const { 
    policy,                  // Current privacy policy
    selectedTemplate,        // Selected policy template
    organizationInfo,        // Organization information
    selectTemplate,          // Function to select a template
    updateOrganizationInfo,  // Function to update organization info
    toggleSection,           // Function to toggle a section on/off
    updateSectionContent,    // Function to update section content
    updateVariableValue,     // Function to update a variable value
    generatePolicy,          // Function to generate the policy
    getPolicyText,           // Function to get the policy text
    resetPolicy,             // Function to reset the policy
    isValid                  // Function to check if policy is valid
  } = usePrivacyPolicy();
  
  // Example usage
  return (
    <div>
      <h2>Privacy Policy Generator</h2>
      <button onClick={() => selectTemplate('standard')}>
        Use Standard Template
      </button>
      <input
        type="text"
        value={organizationInfo.name}
        onChange={(e) => updateOrganizationInfo('name', e.target.value)}
        placeholder="Organization Name"
      />
      <button onClick={generatePolicy} disabled={!isValid()}>
        Generate Policy
      </button>
      <div>
        <h3>Preview</h3>
        <div>{policy?.fullText}</div>
      </div>
    </div>
  );
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <ul>
            <li>
              <strong>Use hooks at the top level</strong> - Always use React hooks at the top level of your component, not inside loops, conditions, or nested functions.
            </li>
            <li>
              <strong>Combine with context</strong> - For global state management, consider using these hooks with React Context to share state across components.
            </li>
            <li>
              <strong>Customize storage options</strong> - Most hooks accept storage options to customize how data is persisted. Use this to implement your own storage mechanisms.
            </li>
            <li>
              <strong>Handle loading states</strong> - Check for loading states before rendering components that depend on data from hooks.
            </li>
          </ul>
        </div>
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Components</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Consent Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Components that work with the useConsent hook
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/consent-management">
                  View Components
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Data Subject Rights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Components that work with the useDSR hook
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/data-subject-rights">
                  View Components
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Components that work with the usePrivacyPolicy hook
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/privacy-policy-generator">
                  View Components
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
