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
import { useState } from 'react';

const sections = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    description: 'Tell us about the data being processed.',
    order: 1,
    questions: [
      {
        id: 'data-types',
        text: 'What types of personal data will be collected?',
        type: 'radio',
        required: true,
        options: [
          { value: 'basic', label: 'Basic contact information only', riskLevel: 'low' },
          { value: 'identifiers', label: 'Personal identifiers and contact information', riskLevel: 'medium' },
          { value: 'sensitive', label: 'Sensitive personal data (health, biometric, etc.)', riskLevel: 'high' }
        ]
      },
      {
        id: 'data-volume',
        text: 'What is the volume of data being processed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small scale (fewer than 100 data subjects)', riskLevel: 'low' },
          { value: 'medium', label: 'Medium scale (100-1000 data subjects)', riskLevel: 'medium' },
          { value: 'large', label: 'Large scale (more than 1000 data subjects)', riskLevel: 'high' }
        ]
      }
    ]
  }
];

function MyDPIAForm() {
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  return (
    <div>
      <h1>Data Protection Impact Assessment</h1>
      <DPIAQuestionnaire
        sections={sections}
        answers={answers}
        onAnswerChange={(questionId, value) =>
          setAnswers((prev) => ({ ...prev, [questionId]: value }))
        }
        currentSectionIndex={currentSectionIndex}
        onNextSection={() => setCurrentSectionIndex((i) => i + 1)}
        onPrevSection={() => setCurrentSectionIndex((i) => i - 1)}
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
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>sections</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIASection[]</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Sections of the DPIA questionnaire</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>answers</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>Record&lt;string, string | number | boolean | string[]&gt;</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Current answers to the questionnaire, keyed by question id</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onAnswerChange</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>(questionId: string, value: string | number | boolean | string[]) =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Called when an answer is updated</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>currentSectionIndex</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>number</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Index of the currently displayed section</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onNextSection</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>() =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Called when the user navigates to the next section</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onPrevSection</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>() =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Called when the user navigates to the previous section</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>validationErrors</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>Record&lt;string, string&gt;</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Validation errors for the current section, keyed by question id</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>readOnly</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether the questionnaire is in read-only mode (default <code>false</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>showProgress</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to show a progress indicator (default <code>true</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>progress</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>number</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Current progress percentage (0-100)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>nextButtonText</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the next button (default <code>"Next"</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>prevButtonText</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the previous button (default <code>"Previous"</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>submitButtonText</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the submit button shown on the last section (default <code>"Submit"</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>className</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Custom CSS class for the questionnaire</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>buttonClassName</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Custom CSS class for the buttons</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>classNames</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIAQuestionnaireClassNames</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Per-section class name overrides</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>unstyled</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">When true, strips all default classes; only <code>classNames</code> overrides apply (default <code>false</code>)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mb-4 leading-relaxed">
          See the <a href="#api" className="text-primary hover:underline">API Reference</a> below for the full <code>DPIAQuestion</code> and <code>DPIASection</code> shapes.
        </p>
      </section>

      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Examples</h2>

        <h3 className="text-xl font-bold text-foreground mb-4">Basic Example</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

const basicSections = [
  {
    id: 'overview',
    title: 'Project Overview',
    order: 1,
    questions: [
      {
        id: 'q1',
        text: 'Does the project involve collecting personal data?',
        type: 'radio',
        required: true,
        options: [
          { value: 'none', label: 'No personal data collected', riskLevel: 'low' },
          { value: 'limited', label: 'Limited personal data collected', riskLevel: 'medium' },
          { value: 'extensive', label: 'Extensive personal data collected', riskLevel: 'high' }
        ]
      },
      {
        id: 'q2',
        text: 'Will the data be shared with third parties?',
        type: 'radio',
        required: true,
        options: [
          { value: 'none', label: 'No sharing with third parties', riskLevel: 'low' },
          { value: 'limited', label: 'Limited sharing with trusted partners', riskLevel: 'medium' },
          { value: 'extensive', label: 'Extensive sharing with multiple third parties', riskLevel: 'high' }
        ]
      }
    ]
  }
];

function BasicDPIA() {
  const [answers, setAnswers] = useState({});

  return (
    <DPIAQuestionnaire
      sections={basicSections}
      answers={answers}
      onAnswerChange={(questionId, value) =>
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
      }
      currentSectionIndex={0}
    />
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mb-4">With Initial Values</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

function DPIAWithInitialValues() {
  // The questionnaire is fully controlled — seed the answers state
  // with whatever values you have already collected.
  const [answers, setAnswers] = useState({ q1: 'limited', q2: 'none' });

  return (
    <DPIAQuestionnaire
      sections={basicSections}
      answers={answers}
      onAnswerChange={(questionId, value) =>
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
      }
      currentSectionIndex={0}
    />
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mb-4">Multi-Section Navigation &amp; Validation</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
import { useState } from 'react';

function MultiSectionDPIA({ sections }) {
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const validateSection = () => {
    const section = sections[currentSectionIndex];
    const errors = {};
    section.questions.forEach((q) => {
      if (q.required && !answers[q.id]) {
        errors[q.id] = 'This question is required';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) return;
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((i) => i + 1);
    } else {
      console.log('Submitted answers:', answers);
    }
  };

  return (
    <DPIAQuestionnaire
      sections={sections}
      answers={answers}
      onAnswerChange={(questionId, value) =>
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
      }
      currentSectionIndex={currentSectionIndex}
      onNextSection={handleNext}
      onPrevSection={() => setCurrentSectionIndex((i) => i - 1)}
      validationErrors={validationErrors}
      progress={Math.round(((currentSectionIndex + 1) / sections.length) * 100)}
    />
  );
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mb-4">Displaying the Report</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Once a DPIA is complete, render the results with the <code>DPIAReport</code> component.
          It takes a <code>result</code> (a <code>DPIAResult</code>) plus the same <code>sections</code> used in the questionnaire:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { DPIAReport } from '@tantainnovative/ndpr-toolkit';

function DPIAResultView({ result, sections }) {
  return (
    <DPIAReport
      result={result}
      sections={sections}
      showFullReport
      allowPrint
      allowExport
      onExport={(format) => console.log('Exporting as', format)}
    />
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
  scaleLabels?: Record<number, string>;
  required: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  hasDependentQuestions?: boolean;
  showWhen?: Array<{
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number | boolean;
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
  residualScore?: number;
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
  answers: Record<string, string | number | boolean | string[]>;
  risks: DPIARisk[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  canProceed: boolean;
  conclusion: string;
  recommendations?: string[];
  reviewDate?: number;
  version: string;
  ndpcConsultationRequired?: boolean;
  ndpcConsultationDate?: number;
  ndpcConsultationReference?: string;
  lawfulBasis?: string;
  involvesCrossBorderTransfer?: boolean;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">DPIAReport Props</h3>
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
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>result</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIAResult</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">The DPIA result to display</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>sections</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIASection[]</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Yes</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">The sections of the DPIA questionnaire (used to label questions)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>showFullReport</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to show the full report or just a summary (default <code>true</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>allowPrint</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to allow printing the report (default <code>true</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>allowExport</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to allow exporting the report as PDF (default <code>true</code>)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>onExport</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>(format: 'pdf' | 'docx' | 'html') =&gt; void</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Called when the report is exported</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>className</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Custom CSS class for the report container</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>buttonClassName</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>string</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Custom CSS class for the buttons</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>classNames</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>DPIAReportClassNames</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Per-section class name overrides</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground"><code>unstyled</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground"><code>boolean</code></td>
                <td className="py-3 px-4 text-sm text-muted-foreground">No</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">When true, strips all default classes; only <code>classNames</code> overrides apply (default <code>false</code>)</td>
              </tr>
            </tbody>
          </table>
        </div>

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
