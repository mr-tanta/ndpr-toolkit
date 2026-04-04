'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function DPIAQuestionnaireDocs() {
  return (
    <DocLayout
      title="DPIA Questionnaire"
      description="Interactive questionnaire for Data Protection Impact Assessments"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/dpia">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/dpia" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The DPIA Questionnaire component provides an interactive form for conducting Data Protection Impact Assessments (DPIAs)
          in compliance with the Nigeria Data Protection Act 2023 (NDPA). This component helps organizations identify and
          minimize data protection risks in their projects or systems.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">When to use a DPIA</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, a DPIA is required when processing is likely to result in a high risk to the rights and freedoms of individuals. 
            This includes systematic and extensive profiling, processing of special categories of data on a large scale, or systematic 
            monitoring of public areas.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the DPIA Questionnaire component:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          Import and use the DPIAQuestionnaire component in your React application:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

// Define your DPIA questions
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
  // Add more questions as needed
];

function MyDPIAForm() {
  const handleSubmit = (answers, projectName) => {
    console.log('Project Name:', projectName);
    console.log('DPIA Answers:', answers);
    
    // Calculate risk score or send to your backend
    // ...
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
}`}</code></pre>
        </div>
      </section>

      <section id="props" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Props</h2>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>questions</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>DPIAQuestion[]</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yes</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of DPIA questions to display in the questionnaire</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>onSubmit</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>(answers: Record&lt;string, number&gt;, projectName: string) =&gt; void</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Yes</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback function when user submits the assessment</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>initialAnswers</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>Record&lt;string, number&gt;</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">No</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Initial answers for the questionnaire</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>initialProjectName</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>string</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">No</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Initial project name</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>className</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><code>string</code></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">No</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Additional CSS class names</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-6 mb-4">DPIAQuestion Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type DPIAQuestion = {
  id: string;
  question: string;
  options: {
    value: number;
    label: string;
  }[];
  helpText?: string;
};`}</code></pre>
        </div>
      </section>

      <section id="examples" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Examples</h2>
        
        <h3 className="text-xl font-bold mb-4">Basic Example</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-6">
          <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

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
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mb-4">With Initial Values</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-6">
          <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

function DPIAWithInitialValues() {
  const initialAnswers = {
    'q1': 2,
    'q2': 1
  };

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
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mb-4">With Risk Calculation</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

function DPIAWithRiskCalculation() {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleSubmit = (answers, projectName) => {
    // Calculate total risk score
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const maxPossibleScore = Object.keys(answers).length * 3; // Assuming max value per question is 3
    const percentageScore = (totalScore / maxPossibleScore) * 100;
    
    setRiskScore(percentageScore);
    
    // Determine risk level
    let level = '';
    let recs = [];
    
    if (percentageScore < 40) {
      level = 'Low Risk';
      recs = ['Regular review of data processing activities'];
    } else if (percentageScore < 70) {
      level = 'Medium Risk';
      recs = [
        'Implement additional security measures',
        'Conduct regular staff training',
        'Review data retention policies'
      ];
    } else {
      level = 'High Risk';
      recs = [
        'Consult with the NDPC before proceeding',
        'Implement strict access controls',
        'Conduct comprehensive security audit',
        'Consider data minimization strategies',
        'Implement regular compliance monitoring'
      ];
    }
    
    setRiskLevel(level);
    setRecommendations(recs);
  };

  return (
    <div>
      <DPIAQuestionnaire 
        questions={comprehensiveQuestions}
        onSubmit={handleSubmit}
      />
      
      {riskScore > 0 && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2>DPIA Results: {riskLevel}</h2>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className={\`h-2.5 rounded-full \${
                riskScore < 40 ? 'bg-green-600' : 
                riskScore < 70 ? 'bg-yellow-500' : 'bg-red-600'
              }\`}
              style={{ width: \`\${riskScore}%\` }}
            ></div>
          </div>
          <p>Risk Score: {riskScore.toFixed(1)}%</p>
          
          <h3 className="mt-4">Recommendations:</h3>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        
        <h3 className="text-xl font-bold mt-8 mb-4">DPIAQuestion Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface DPIAQuestion {
  /**
   * Unique identifier for the question
   */
  id: string;
  
  /**
   * The text of the question
   */
  text: string;
  
  /**
   * Additional guidance for answering the question
   */
  guidance?: string;
  
  /**
   * Type of input required for the answer
   */
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'scale';
  
  /**
   * Options for select, radio, or checkbox questions
   */
  options?: Array<{
    value: string;
    label: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>;
  
  /**
   * For scale questions, the minimum value
   */
  minValue?: number;
  
  /**
   * For scale questions, the maximum value
   */
  maxValue?: number;
  
  /**
   * Whether the question is required
   */
  required: boolean;
  
  /**
   * Risk level associated with this question
   */
  riskLevel?: 'low' | 'medium' | 'high';
  
  /**
   * Conditions that determine when this question should be shown
   */
  showWhen?: Array<{
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DPIASection Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface DPIASection {
  /**
   * Unique identifier for the section
   */
  id: string;
  
  /**
   * Title of the section
   */
  title: string;
  
  /**
   * Description of the section
   */
  description?: string;
  
  /**
   * Questions in this section
   */
  questions: DPIAQuestion[];
  
  /**
   * Order of the section in the questionnaire
   */
  order: number;
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DPIARisk Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface DPIARisk {
  /**
   * Unique identifier for the risk
   */
  id: string;
  
  /**
   * Description of the risk
   */
  description: string;
  
  /**
   * Likelihood of the risk occurring (1-5)
   */
  likelihood: number;
  
  /**
   * Impact if the risk occurs (1-5)
   */
  impact: number;
  
  /**
   * Overall risk score (likelihood * impact)
   */
  score: number;
  
  /**
   * Risk level based on the score
   */
  level: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Measures to mitigate the risk
   */
  mitigationMeasures?: string[];
  
  /**
   * Whether the risk has been mitigated
   */
  mitigated: boolean;
  
  /**
   * Questions that identified this risk
   */
  relatedQuestionIds: string[];
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">DPIAResult Interface</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`export interface DPIAResult {
  /**
   * Unique identifier for the DPIA
   */
  id: string;
  
  /**
   * Title of the DPIA
   */
  title: string;
  
  /**
   * Description of the processing activity being assessed
   */
  processingDescription: string;
  
  /**
   * Timestamp when the DPIA was started
   */
  startedAt: number;
  
  /**
   * Timestamp when the DPIA was completed
   */
  completedAt?: number;
  
  /**
   * Person responsible for conducting the DPIA
   */
  assessor: {
    name: string;
    role: string;
    email: string;
  };
  
  /**
   * Answers to all questions in the DPIA
   */
  answers: Record<string, any>;
  
  /**
   * Risks identified in the DPIA
   */
  risks: DPIARisk[];
  
  /**
   * Overall risk level of the processing activity
   */
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Whether the DPIA concluded that the processing can proceed
   */
  canProceed: boolean;
  
  /**
   * Recommendations for the processing activity
   */
  recommendations?: string[];
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">useDPIA Hook</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`// Import the hook
import { useDPIA } from '@tantainnovative/ndpr-toolkit';

// Use the hook in your component
const { 
  dpias,                // Array of all DPIAs
  startDPIA,            // Function to start a new DPIA
  updateDPIA,           // Function to update an existing DPIA
  completeDPIA,         // Function to complete a DPIA
  getDPIAById,          // Function to get a DPIA by ID
  identifyRisks,        // Function to identify risks based on answers
  assessRisk,           // Function to assess a specific risk
  generateReport        // Function to generate a DPIA report
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

// Identify risks based on answers
const risks = identifyRisks(newDPIA.id);

// Complete the DPIA
completeDPIA(newDPIA.id, {
  risks: risks,
  overallRiskLevel: 'medium',
  canProceed: true,
  conclusion: 'The processing can proceed with appropriate safeguards.',
  recommendations: [
    'Implement data minimization practices',
    'Enhance access controls',
    'Conduct regular security audits'
  ]
});

// Generate a DPIA report
const report = generateReport(newDPIA.id);
`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Comprehensive Questions:</strong> Include questions that cover all aspects of data processing, including collection, storage, sharing, and deletion.
          </li>
          <li>
            <strong>Risk Scoring:</strong> Implement a risk scoring system to help identify high-risk areas that need additional mitigation measures.
          </li>
          <li>
            <strong>Documentation:</strong> Ensure the DPIA results are documented and stored for compliance purposes. The NDPA requires organizations to maintain records of processing activities.
          </li>
          <li>
            <strong>Regular Reviews:</strong> DPIAs should be reviewed periodically, especially when there are changes to the processing activities.
          </li>
          <li>
            <strong>Consultation:</strong> For high-risk processing, consider consulting with the NDPC or a data protection expert.
          </li>
        </ul>
      </section>

      <section id="accessibility" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
        <p className="mb-4">
          The DPIAQuestionnaire component is built with accessibility in mind:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All form elements have proper labels and ARIA attributes</li>
          <li>Focus states are clearly visible</li>
          <li>Color contrast meets WCAG 2.1 AA standards</li>
          <li>Keyboard navigation is fully supported</li>
        </ul>
        <p className="mt-4">
          To ensure maximum accessibility, make sure to provide clear and descriptive question text and help text where appropriate.
        </p>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          If you have questions about implementing the DPIA Questionnaire or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">GitHub Issues</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Report bugs or request features on our GitHub repository.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer">
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
