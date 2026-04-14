import React, { useState } from 'react';
import { DPIAQuestionnaire } from '../components/dpia/DPIAQuestionnaire';
import type { DPIAQuestionnaireClassNames } from '../components/dpia/DPIAQuestionnaire';
import type { DPIASection } from '../types/dpia';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_SECTIONS: DPIASection[] = [
  {
    id: 'project_overview',
    title: 'Project Overview',
    description: 'Provide basic details about the processing activity being assessed.',
    order: 0,
    questions: [
      {
        id: 'project_name',
        text: 'What is the name of the project or processing activity?',
        type: 'text',
        required: true,
      },
      {
        id: 'project_description',
        text: 'Describe the nature and purpose of the processing.',
        guidance: 'Include what personal data will be collected, why it is needed, and how it will be used.',
        type: 'textarea',
        required: true,
      },
      {
        id: 'data_controller',
        text: 'Who is the data controller responsible for this processing?',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'necessity',
    title: 'Necessity & Proportionality',
    description: 'Assess whether the processing is necessary and proportionate to the purposes.',
    order: 1,
    questions: [
      {
        id: 'lawful_basis',
        text: 'What is the lawful basis for processing under the NDPA 2023?',
        type: 'select',
        required: true,
        options: [
          { value: 'consent', label: 'Consent (Section 25(1)(a))' },
          { value: 'contract', label: 'Contract (Section 25(1)(b))' },
          { value: 'legal_obligation', label: 'Legal Obligation (Section 25(1)(c))' },
          { value: 'vital_interests', label: 'Vital Interests (Section 25(1)(d))' },
          { value: 'public_task', label: 'Public Task (Section 25(1)(e))' },
          { value: 'legitimate_interests', label: 'Legitimate Interests (Section 25(1)(f))' },
        ],
      },
      {
        id: 'data_minimisation',
        text: 'Is the processing limited to what is necessary for the specified purpose?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — only minimum data is collected', riskLevel: 'low' },
          { value: 'partial', label: 'Partially — some additional data may be collected', riskLevel: 'medium' },
          { value: 'no', label: 'No — more data is collected than strictly necessary', riskLevel: 'high' },
        ],
      },
    ],
  },
  {
    id: 'risk_identification',
    title: 'Risk Identification',
    description: 'Identify and assess risks to data subjects arising from the processing.',
    order: 2,
    questions: [
      {
        id: 'sensitive_data',
        text: 'Does the processing involve sensitive personal data (e.g., health, biometric, financial, children\'s data)?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no', label: 'No sensitive data', riskLevel: 'low' },
          { value: 'yes_protected', label: 'Yes, with appropriate safeguards', riskLevel: 'medium' },
          { value: 'yes_unprotected', label: 'Yes, without adequate safeguards', riskLevel: 'high' },
        ],
      },
      {
        id: 'scale',
        text: 'What is the scale of processing?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small scale (fewer than 1,000 individuals)', riskLevel: 'low' },
          { value: 'medium', label: 'Medium scale (1,000 to 100,000 individuals)', riskLevel: 'medium' },
          { value: 'large', label: 'Large scale (over 100,000 individuals)', riskLevel: 'high' },
        ],
      },
      {
        id: 'cross_border',
        text: 'Will data be transferred outside Nigeria?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no', label: 'No international transfers', riskLevel: 'low' },
          { value: 'adequate', label: 'Yes, to countries with adequate protection', riskLevel: 'medium' },
          { value: 'inadequate', label: 'Yes, to countries without adequate protection', riskLevel: 'high' },
        ],
      },
    ],
  },
  {
    id: 'mitigation',
    title: 'Risk Mitigation & Measures',
    description: 'Document the measures taken to address identified risks.',
    order: 3,
    questions: [
      {
        id: 'security_measures',
        text: 'What technical and organisational security measures are in place?',
        guidance: 'Include encryption, access controls, pseudonymisation, staff training, etc.',
        type: 'textarea',
        required: true,
      },
      {
        id: 'retention_period',
        text: 'What is the data retention period?',
        guidance: 'Specify how long data will be kept and the criteria used to determine this.',
        type: 'text',
        required: true,
      },
      {
        id: 'dpo_consulted',
        text: 'Has the Data Protection Officer (DPO) been consulted on this assessment?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes', riskLevel: 'low' },
          { value: 'no', label: 'No', riskLevel: 'medium' },
          { value: 'na', label: 'Not applicable — no DPO appointed', riskLevel: 'medium' },
        ],
      },
    ],
  },
];

export interface NDPRDPIAProps {
  sections?: DPIASection[];
  adapter?: StorageAdapter<Record<string, any>>;
  classNames?: DPIAQuestionnaireClassNames;
  unstyled?: boolean;
  onComplete?: (answers: Record<string, any>) => void;
}

export const NDPRDPIA: React.FC<NDPRDPIAProps> = ({
  sections = DEFAULT_SECTIONS,
  adapter,
  classNames,
  unstyled,
  onComplete = () => {},
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      if (adapter) adapter.save(answers);
      onComplete(answers);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const progress = Math.round(((currentSectionIndex + 1) / sections.length) * 100);

  return (
    <DPIAQuestionnaire
      sections={sections}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      currentSectionIndex={currentSectionIndex}
      onNextSection={handleNextSection}
      onPrevSection={handlePrevSection}
      progress={progress}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
