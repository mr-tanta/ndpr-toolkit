'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';

export default function DPIAQuestionnaireDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'DPIA Questionnaire — NDPA Toolkit Documentation',
    description: 'Interactive questionnaire for Data Protection Impact Assessments',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="DPIA Questionnaire"
      description="Interactive questionnaire for Data Protection Impact Assessments"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 gap-3">
        <Link href="/ndpr-demos/dpia" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
          View Demo →
        </Link>
        <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/dpia" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card transition">
          View Source
        </a>
      </div>

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The DPIA Questionnaire component provides an interactive form for conducting Data Protection Impact Assessments (DPIAs)
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). This component helps organizations identify and
          minimize data protection risks in their projects or systems.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-2">When to use a DPIA</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under the NDPA 2023, a DPIA is required when processing is likely to result in a high risk to the rights and freedoms of individuals.
            This includes systematic and extensive profiling, processing of special categories of data on a large scale, or systematic
            monitoring of public areas.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Installation</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Install the NDPR Toolkit package which includes the DPIA Questionnaire component:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">pnpm add @tantainnovative/ndpr-toolkit</code>
        </pre>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Import and use the DPIAQuestionnaire component in your React application:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

const dpiaQuestions = [
  {
    id: 'data_collection',
    question: 'What types of personal data will be collected?',
    options: [
      { value: 1, label: 'Basic contact information only' },
      { value: 2, label: 'Personal identifiers and contact information' },
      { value: 3, label: 'Sensitive personal data (health, biometric, etc.)' }
    ]
  },
  {
    id: 'data_volume',
    question: 'What is the volume of data being processed?',
    options: [
      { value: 1, label: 'Small scale (fewer than 100 data subjects)' },
      { value: 2, label: 'Medium scale (100-1000 data subjects)' },
      { value: 3, label: 'Large scale (more than 1000 data subjects)' }
    ]
  },
];

function MyDPIAForm() {
  const handleSubmit = (answers, projectName) => {
    console.log('Project Name:', projectName);
    console.log('DPIA Answers:', answers);
  };

  return (
    <div>
      <h1>Data Protection Impact Assessment</h1>
      <DPIAQuestionnaire
        questions={dpiaQuestions}
        onSubmit={handleSubmit}
      />
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>
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
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>questions</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIAQuestion[]</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Array of DPIA questions to display in the questionnaire</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onSubmit</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>(answers: Record&lt;string, number&gt;, projectName: string) =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback function when user submits the assessment</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>initialAnswers</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>Record&lt;string, number&gt;</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Initial answers for the questionnaire</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>initialProjectName</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Initial project name</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>className</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Additional CSS class names</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIAQuestion Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`type DPIAQuestion = {
  id: string;
  question: string;
  options: {
    value: number;
    label: string;
  }[];
  helpText?: string;
};`}</code>
        </pre>
      </section>

      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Examples</h2>

        <h3 className="text-xl font-bold text-foreground mb-4">Basic Example</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

const basicQuestions = [
  {
    id: 'q1',
    question: 'Does the project involve collecting personal data?',
    options: [
      { value: 1, label: 'No personal data collected' },
      { value: 2, label: 'Limited personal data collected' },
      { value: 3, label: 'Extensive personal data collected' }
    ]
  },
  {
    id: 'q2',
    question: 'Will the data be shared with third parties?',
    options: [
      { value: 1, label: 'No sharing with third parties' },
      { value: 2, label: 'Limited sharing with trusted partners' },
      { value: 3, label: 'Extensive sharing with multiple third parties' }
    ]
  }
];

function BasicDPIA() {
  return (
    <DPIAQuestionnaire
      questions={basicQuestions}
      onSubmit={(answers, projectName) => {
        console.log(answers, projectName);
      }}
    />
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mb-4">With Initial Values</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

function DPIAWithInitialValues() {
  const initialAnswers = { 'q1': 2, 'q2': 1 };

  return (
    <DPIAQuestionnaire
      questions={basicQuestions}
      initialAnswers={initialAnswers}
      initialProjectName="E-commerce Platform"
      onSubmit={(answers, projectName) => {
        console.log(answers, projectName);
      }}
    />
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mb-4">With Risk Calculation</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

function DPIAWithRiskCalculation() {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleSubmit = (answers, projectName) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const maxPossibleScore = Object.keys(answers).length * 3;
    const percentageScore = (totalScore / maxPossibleScore) * 100;

    setRiskScore(percentageScore);

    if (percentageScore < 40) {
      setRiskLevel('Low Risk');
      setRecommendations(['Regular review of data processing activities']);
    } else if (percentageScore < 70) {
      setRiskLevel('Medium Risk');
      setRecommendations([
        'Implement additional security measures',
        'Conduct regular staff training',
        'Review data retention policies'
      ]);
    } else {
      setRiskLevel('High Risk');
      setRecommendations([
        'Consult with the NDPC before proceeding',
        'Implement strict access controls',
        'Conduct comprehensive security audit',
        'Consider data minimization strategies',
        'Implement regular compliance monitoring'
      ]);
    }
  };

  return (
    <div>
      <DPIAQuestionnaire questions={comprehensiveQuestions} onSubmit={handleSubmit} />
      {riskScore > 0 && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2>DPIA Results: {riskLevel}</h2>
          <p>Risk Score: {riskScore.toFixed(1)}%</p>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section id="api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">API Reference</h2>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIAQuestion Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface DPIAQuestion {
  id: string;
  text: string;
  guidance?: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'scale';
  options?: Array<{
    value: string;
    label: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>;
  minValue?: number;
  maxValue?: number;
  required: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  showWhen?: Array<{
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIASection Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface DPIASection {
  id: string;
  title: string;
  description?: string;
  questions: DPIAQuestion[];
  order: number;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIARisk Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface DPIARisk {
  id: string;
  description: string;
  likelihood: number;
  impact: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  mitigationMeasures?: string[];
  mitigated: boolean;
  relatedQuestionIds: string[];
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIAResult Interface</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`export interface DPIAResult {
  id: string;
  title: string;
  processingDescription: string;
  startedAt: number;
  completedAt?: number;
  assessor: {
    name: string;
    role: string;
    email: string;
  };
  answers: Record<string, any>;
  risks: DPIARisk[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  canProceed: boolean;
  recommendations?: string[];
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">useDPIA Hook</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useDPIA } from '@tantainnovative/ndpr-toolkit';

const {
  dpias,          // Array of all DPIAs
  startDPIA,      // Function to start a new DPIA
  updateDPIA,     // Function to update an existing DPIA
  completeDPIA,   // Function to complete a DPIA
  getDPIAById,    // Function to get a DPIA by ID
  identifyRisks,  // Function to identify risks based on answers
  assessRisk,     // Function to assess a specific risk
  generateReport  // Function to generate a DPIA report
} = useDPIA();

// Start a new DPIA
const newDPIA = startDPIA({
  title: 'Customer Data Analytics Platform',
  processingDescription: 'Processing customer data for analytics and personalization',
  assessor: {
    name: 'Jane Smith',
    role: 'Data Protection Officer',
    email: 'jane@example.com'
  }
});

// Update DPIA with answers
updateDPIA(newDPIA.id, {
  answers: {
    'data-types': ['personal', 'behavioral'],
    'data-volume': 'large',
    'automated-processing': true,
    'sensitive-data': false
  }
});

// Identify risks and complete
const risks = identifyRisks(newDPIA.id);
completeDPIA(newDPIA.id, {
  risks,
  overallRiskLevel: 'medium',
  canProceed: true,
  recommendations: [
    'Implement data minimization practices',
    'Enhance access controls',
    'Conduct regular security audits'
  ]
});`}</code>
        </pre>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">Comprehensive Questions:</strong> Include questions that cover all aspects of data processing, including collection, storage, sharing, and deletion.
          </li>
          <li>
            <strong className="text-foreground">Risk Scoring:</strong> Implement a risk scoring system to help identify high-risk areas that need additional mitigation measures.
          </li>
          <li>
            <strong className="text-foreground">Documentation:</strong> Ensure the DPIA results are documented and stored for compliance purposes. The NDPA requires organizations to maintain records of processing activities.
          </li>
          <li>
            <strong className="text-foreground">Regular Reviews:</strong> DPIAs should be reviewed periodically, especially when there are changes to the processing activities.
          </li>
          <li>
            <strong className="text-foreground">Consultation:</strong> For high-risk processing, consider consulting with the NDPC or a data protection expert.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Accessibility</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The DPIAQuestionnaire component is built with accessibility in mind:
        </p>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
        </ul>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          To ensure maximum accessibility, make sure to provide clear and descriptive question text and help text where appropriate.
        </p>
      </section>

      <section id="help-resources" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          If you have questions about implementing the DPIA Questionnaire or need assistance with NDPA compliance, check out these resources:
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
