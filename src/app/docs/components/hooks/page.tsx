'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

export default function HooksDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'React Hooks — NDPA Toolkit Documentation',
    description: 'Custom React hooks for managing state and logic in NDPA-compliant applications',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="React Hooks"
      description="Custom React hooks for managing state and logic in NDPA-compliant applications"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 space-x-2">
        <a
          href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/src/hooks"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          View Source
        </a>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The NDPR Toolkit provides a set of custom React hooks to help manage state and logic in your NDPA-compliant applications.
          These hooks encapsulate common functionality and make it easier to implement complex features.
        </p>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes all hooks:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        <p className="mb-4">
          Import hooks from the main package:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import {
  useConsent,
  useDSR,
  useDPIA,
  useBreach,
  usePrivacyPolicy,
  useLawfulBasis,
  useCrossBorderTransfer,
  useROPA,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
      </section>

      <section id="hooks" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Hooks</h2>
        
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">useConsent</h3>
            <p className="text-muted-foreground mb-4">
              A hook for managing consent state and preferences.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useConsent } from '@tantainnovative/ndpr-toolkit';

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

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">useDSR</h3>
            <p className="text-muted-foreground mb-4">
              A hook for managing Data Subject Rights (DSR) requests.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useDSR } from '@tantainnovative/ndpr-toolkit';

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

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">useDPIA</h3>
            <p className="text-muted-foreground mb-4">
              A hook for managing Data Protection Impact Assessment (DPIA) state.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useDPIA } from '@tantainnovative/ndpr-toolkit';

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

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">useBreach</h3>
            <p className="text-muted-foreground mb-4">
              A hook for managing data breach notifications and assessments.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useBreach } from '@tantainnovative/ndpr-toolkit';

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

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">useDefaultPrivacyPolicy</h3>
            <p className="text-muted-foreground mb-4">
              The recommended hook for the common case: generates an NDPA-compliant policy from your{' '}
              <code className="bg-muted px-1 py-0.5 rounded">orgInfo</code> automatically. Returns a non-null{' '}
              <code className="bg-muted px-1 py-0.5 rounded">policy</code> on the first useful render with{' '}
              <code className="bg-muted px-1 py-0.5 rounded">autoGenerate: true</code> (the default, added in v3.4.0).
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { useDefaultPrivacyPolicy, PolicyPage } from '@tantainnovative/ndpr-toolkit';

function PrivacyPage() {
  const { policy } = useDefaultPrivacyPolicy({
    orgInfo: {
      name: 'Acme Nigeria Ltd',
      email: 'privacy@acme.ng',
      website: 'https://acme.ng',
      address: '12 Marina, Lagos',
    },
  });

  return policy ? <PolicyPage policy={policy} /> : null;
}`}</code></pre>

            <p className="text-muted-foreground mb-2 mt-4">Options:</p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground mb-4 space-y-1">
              <li><code className="bg-muted px-1 py-0.5 rounded">orgInfo</code> — name / email / website / address / industry / dpoName / dpoEmail. Maps directly to template variables.</li>
              <li><code className="bg-muted px-1 py-0.5 rounded">autoGenerate</code> — defaults to <code className="bg-muted px-1 py-0.5 rounded">true</code>. Set <code className="bg-muted px-1 py-0.5 rounded">false</code> to retain manual control via <code className="bg-muted px-1 py-0.5 rounded">selectTemplate</code> / <code className="bg-muted px-1 py-0.5 rounded">generatePolicy</code>.</li>
              <li><code className="bg-muted px-1 py-0.5 rounded">persist</code> — defaults to <code className="bg-muted px-1 py-0.5 rounded">true</code> (writes to localStorage). Pass <code className="bg-muted px-1 py-0.5 rounded">false</code> for an in-memory no-op adapter. <em>Renamed from <code className="bg-muted px-1 py-0.5 rounded">useLocalStorage</code> in v3.5.0; the old name still works as a deprecated alias and will be removed in 4.0.</em></li>
              <li><code className="bg-muted px-1 py-0.5 rounded">adapter</code> — pluggable storage adapter. Takes precedence over <code className="bg-muted px-1 py-0.5 rounded">persist</code>.</li>
            </ul>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">usePrivacyPolicy</h3>
            <p className="text-muted-foreground mb-4">
              The lower-level hook for managing privacy policy generation and customization. Use this when
              you need explicit control over template selection, variable values, and section toggling — for
              example when building a policy editor UI. For the common drop-in case prefer{' '}
              <code className="bg-muted px-1 py-0.5 rounded">useDefaultPrivacyPolicy</code> above.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6"><code className="text-sm font-mono text-foreground">{`import { usePrivacyPolicy } from '@tantainnovative/ndpr-toolkit';

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
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
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
      </section>

      <section id="related" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Related Components</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Consent Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Components that work with the useConsent hook
            </p>
            <Link
              href="/docs/components/consent-management"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              View Components
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Data Subject Rights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Components that work with the useDSR hook
            </p>
            <Link
              href="/docs/components/data-subject-rights"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              View Components
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Privacy Policy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Components that work with the usePrivacyPolicy hook
            </p>
            <Link
              href="/docs/components/privacy-policy-generator"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              View Components
            </Link>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
