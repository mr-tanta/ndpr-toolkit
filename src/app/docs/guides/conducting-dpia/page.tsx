'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ConductingDPIAGuide() {
  return (
    <DocLayout
      title="Conducting a Data Protection Impact Assessment"
      description="Step-by-step guide to conducting a DPIA using the NDPR Toolkit"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/dpia">
            View DPIA Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs/components/dpia-questionnaire">
            DPIA Component Docs
          </Link>
        </Button>
      </div>
      
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="mb-4">
          A Data Protection Impact Assessment (DPIA) is a process designed to help organizations identify and minimize
          the data protection risks of a project. Under the Nigeria Data Protection Act (NDPA) 2023, organizations
          are required to conduct DPIAs for processing activities that are likely to result in a high risk to the
          rights and freedoms of individuals.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">When is a DPIA Required?</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, a DPIA is mandatory when processing is likely to result in a high risk to individuals,
            particularly when using new technologies. This includes:
          </p>
          <ul className="list-disc pl-6 mt-2 text-blue-700 dark:text-blue-300 text-sm">
            <li>Systematic and extensive profiling with significant effects</li>
            <li>Processing of special categories of data on a large scale</li>
            <li>Systematic monitoring of publicly accessible areas</li>
            <li>Processing involving sensitive personal data</li>
            <li>Processing data relating to vulnerable subjects (e.g., children)</li>
          </ul>
        </div>
      </section>

      <section id="dpia-process" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The DPIA Process</h2>
        <p className="mb-4">
          The NDPR Toolkit provides a structured approach to conducting DPIAs through the DPIAQuestionnaire component. 
          Here&apos;s how to implement a complete DPIA process in your organization:
        </p>
        
        <div className="relative border-l-2 border-blue-500 pl-8 pb-8 space-y-10">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h3 className="text-xl font-bold">Identify the Need for a DPIA</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Before starting a DPIA, determine whether your processing activity requires one. Consider the nature, scope, 
              context, and purposes of the processing, as well as the potential risks to individuals.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                Create a simple screening questionnaire to help project managers determine if a DPIA is needed. 
                This can be implemented using the NDPR Toolkit&apos;s form components.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h3 className="text-xl font-bold">Describe the Processing</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Document the nature, scope, context, and purposes of the processing. Include:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>How data is collected, used, stored, and deleted</li>
              <li>Who has access to the data</li>
              <li>Who the data is shared with</li>
              <li>The types of personal data processed</li>
              <li>The retention periods for the data</li>
            </ul>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

// Define the processing description questions
const processingQuestions = [
  {
    id: 'dataTypes',
    question: 'What types of personal data will be processed?',
    type: 'checkbox',
    options: [
      { value: 'basic', label: 'Basic contact information' },
      { value: 'financial', label: 'Financial information' },
      { value: 'health', label: 'Health information' },
      { value: 'biometric', label: 'Biometric data' },
      { value: 'location', label: 'Location data' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 'processingPurpose',
    question: 'What is the purpose of the processing?',
    type: 'textarea'
  },
  {
    id: 'dataSubjects',
    question: 'Who are the data subjects?',
    type: 'checkbox',
    options: [
      { value: 'customers', label: 'Customers' },
      { value: 'employees', label: 'Employees' },
      { value: 'children', label: 'Children' },
      { value: 'patients', label: 'Patients' },
      { value: 'other', label: 'Other' }
    ]
  }
];

function ProcessingDescriptionStep() {
  const handleSubmit = (answers) => {
    // Save answers and proceed to next step
    console.log(answers);
  };

  return (
    <div>
      <h2>Step 2: Describe the Processing</h2>
      <DPIAQuestionnaire
        questions={processingQuestions}
        onSubmit={handleSubmit}
      />
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h3 className="text-xl font-bold">Identify and Assess Risks</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Identify potential risks to individuals&apos; rights and freedoms. For each risk, assess:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>The likelihood of the risk occurring (low, medium, high)</li>
              <li>The severity of the impact if it does occur (low, medium, high)</li>
              <li>The overall risk level (combination of likelihood and severity)</li>
            </ul>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';

// Define risk assessment questions
const riskQuestions = [
  {
    id: 'unauthorizedAccess',
    question: 'Risk: Unauthorized access to personal data',
    type: 'riskAssessment',
    subQuestions: [
      {
        id: 'likelihood',
        question: 'Likelihood of occurrence',
        type: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]
      },
      {
        id: 'impact',
        question: 'Potential impact',
        type: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]
      },
      {
        id: 'mitigation',
        question: 'Possible mitigation measures',
        type: 'textarea'
      }
    ]
  },
  // Add more risks as needed
];

function RiskAssessmentStep() {
  const handleSubmit = (answers) => {
    // Calculate overall risk levels and proceed to next step
    console.log(answers);
  };

  return (
    <div>
      <h2>Step 3: Identify and Assess Risks</h2>
      <DPIAQuestionnaire
        questions={riskQuestions}
        onSubmit={handleSubmit}
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
            <h3 className="text-xl font-bold">Identify Measures to Mitigate Risks</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              For each identified risk, determine measures to reduce or eliminate the risk. Consider:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>Technical measures (e.g., encryption, access controls)</li>
              <li>Organizational measures (e.g., policies, training)</li>
              <li>Legal measures (e.g., contracts with processors)</li>
            </ul>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                Create a library of common mitigation measures that can be reused across DPIAs. 
                This helps ensure consistency and saves time when conducting multiple assessments.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">5</span>
            </div>
            <h3 className="text-xl font-bold">Document the DPIA</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Compile all the information gathered in the previous steps into a comprehensive DPIA report. The report should include:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>A description of the processing operations</li>
              <li>The purpose of the processing</li>
              <li>An assessment of the necessity and proportionality of the processing</li>
              <li>The risks to individuals</li>
              <li>The measures implemented to address those risks</li>
              <li>The outcome of the assessment (whether to proceed with the processing)</li>
            </ul>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { DPIAReport } from '@tantainnovative/ndpr-toolkit';

function GenerateDPIAReport({ dpiaData }) {
  const handleExport = (format) => {
    // Export the DPIA report in the specified format
    console.log(\`Exporting DPIA report in \${format} format\`);
  };

  return (
    <div>
      <h2>DPIA Report</h2>
      <DPIAReport
        data={dpiaData}
        onExport={handleExport}
        exportFormats={['pdf', 'docx', 'html']}
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
            <h3 className="text-xl font-bold">Implement and Review</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Implement the identified mitigation measures and regularly review the DPIA, especially when there are changes to the processing activity.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                Set up a review schedule for each DPIA, with automatic reminders for stakeholders. 
                The NDPR Toolkit can be integrated with your calendar system to facilitate this.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="complete-implementation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Complete Implementation Example</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement a multi-step DPIA process using the NDPR Toolkit:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState } from 'react';
import {
  DPIAQuestionnaire,
  DPIAReport,
  StepIndicator
} from '@tantainnovative/ndpr-toolkit';

// Import question sets for each step
import { 
  screeningQuestions,
  processingQuestions,
  riskQuestions,
  mitigationQuestions
} from './dpia-questions';

function DPIAProcess() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dpiaData, setDpiaData] = useState({
    screening: null,
    processing: null,
    risks: null,
    mitigation: null
  });
  
  const steps = [
    { id: 'screening', label: 'Screening' },
    { id: 'processing', label: 'Processing Description' },
    { id: 'risks', label: 'Risk Assessment' },
    { id: 'mitigation', label: 'Mitigation Measures' },
    { id: 'report', label: 'DPIA Report' }
  ];
  
  const handleScreeningSubmit = (answers) => {
    setDpiaData({ ...dpiaData, screening: answers });
    
    // Check if a DPIA is required based on screening answers
    const dpiaRequired = answers.some(answer => 
      answer.id === 'highRiskProcessing' && answer.value === true
    );
    
    if (dpiaRequired) {
      setCurrentStep(1); // Proceed to processing description
    } else {
      // Skip to final step with a simplified report
      setCurrentStep(4);
    }
  };
  
  const handleProcessingSubmit = (answers) => {
    setDpiaData({ ...dpiaData, processing: answers });
    setCurrentStep(2); // Proceed to risk assessment
  };
  
  const handleRiskSubmit = (answers) => {
    setDpiaData({ ...dpiaData, risks: answers });
    setCurrentStep(3); // Proceed to mitigation measures
  };
  
  const handleMitigationSubmit = (answers) => {
    setDpiaData({ ...dpiaData, mitigation: answers });
    setCurrentStep(4); // Proceed to DPIA report
  };
  
  const handleExport = (format) => {
    // Export the DPIA report
    console.log(\`Exporting DPIA report in \${format} format\`);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Protection Impact Assessment</h1>
      
      <StepIndicator 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={(step) => {
          // Only allow navigation to completed steps
          if (step < currentStep) {
            setCurrentStep(step);
          }
        }}
      />
      
      <div className="mt-8">
        {currentStep === 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 1: DPIA Screening</h2>
            <p className="mb-4">
              Answer the following questions to determine if a DPIA is required for your processing activity.
            </p>
            <DPIAQuestionnaire
              questions={screeningQuestions}
              onSubmit={handleScreeningSubmit}
            />
          </div>
        )}
        
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Processing Description</h2>
            <p className="mb-4">
              Provide details about the processing activity.
            </p>
            <DPIAQuestionnaire
              questions={processingQuestions}
              onSubmit={handleProcessingSubmit}
            />
          </div>
        )}
        
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Risk Assessment</h2>
            <p className="mb-4">
              Identify and assess the risks associated with the processing activity.
            </p>
            <DPIAQuestionnaire
              questions={riskQuestions}
              onSubmit={handleRiskSubmit}
            />
          </div>
        )}
        
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Mitigation Measures</h2>
            <p className="mb-4">
              Identify measures to mitigate the identified risks.
            </p>
            <DPIAQuestionnaire
              questions={mitigationQuestions}
              onSubmit={handleMitigationSubmit}
            />
          </div>
        )}
        
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">DPIA Report</h2>
            <p className="mb-4">
              Review and export the DPIA report.
            </p>
            <DPIAReport
              data={dpiaData}
              onExport={handleExport}
              exportFormats={['pdf', 'docx', 'html']}
            />
          </div>
        )}
      </div>
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
              <h3 className="font-bold text-lg mb-2">Start Early</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Begin the DPIA process as early as possible in the project lifecycle, ideally during the planning phase. 
                This allows you to identify and address risks before significant resources are committed.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Involve Stakeholders</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Include relevant stakeholders in the DPIA process, such as IT, legal, business units, and the Data Protection Officer. 
                Different perspectives help identify risks that might otherwise be overlooked.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Be Thorough</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Do not rush the DPIA process. Take the time to thoroughly identify and assess all potential risks. 
                A comprehensive DPIA is more effective at protecting both individuals and your organization.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Document Everything</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Maintain detailed documentation of the DPIA process, including all decisions made and the rationale behind them. 
                This is essential for demonstrating compliance with the NDPA 2023.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Regular Reviews</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Review and update DPIAs regularly, especially when there are changes to the processing activity or the associated risks. 
                Data protection is an ongoing process, not a one-time exercise.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Integrate with Existing Processes</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Integrate the DPIA process with existing project management and risk assessment processes in your organization. 
                This helps ensure that DPIAs become a standard part of your operations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="ndpa-compliance" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">NDPA 2023 Compliance Considerations</h2>
        <p className="mb-4">
          When conducting a DPIA to comply with the NDPA 2023, keep the following considerations in mind:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Documentation:</strong> The NDPA 2023 requires organizations to document their DPIAs as part of their accountability obligations.
          </li>
          <li>
            <strong>DPO Involvement:</strong> If your organization has a Data Protection Officer (DPO), they should be involved in the DPIA process.
          </li>
          <li>
            <strong>Consultation:</strong> In some cases, you may need to consult with the NDPC before proceeding with high-risk processing.
          </li>
          <li>
            <strong>Transparency:</strong> Consider publishing a summary of your DPIA to demonstrate transparency to data subjects.
          </li>
          <li>
            <strong>Ongoing Compliance:</strong> Use the DPIA as a tool for ongoing compliance, not just a one-time assessment.
          </li>
        </ul>
      </section>

      <section id="resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA 2023 Official Text</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Official text of the Nigeria Data Protection Act 2023, including DPIA requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  View Act
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">DPIA Component Documentation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Technical documentation for the DPIA Questionnaire component.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/dpia-questionnaire">
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
