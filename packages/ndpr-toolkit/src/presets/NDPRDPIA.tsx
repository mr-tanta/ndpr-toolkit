import React, { useEffect, useRef, useState } from 'react';
import { DPIAQuestionnaire } from '../components/dpia/DPIAQuestionnaire';
import type { DPIAQuestionnaireClassNames } from '../components/dpia/DPIAQuestionnaire';
import type { DPIAQuestion, DPIAResult, DPIARisk, DPIASection } from '../types/dpia';
import { assessDPIARisk } from '../utils/dpia';
import type { StorageAdapter } from '../adapters/types';
import type { DPIAAnswerMap, DPIAAnswerValue } from '../hooks/useDPIA';

/**
 * UX copy overrides for the NDPRDPIA preset. Strings you omit fall back
 * to the lower-level `<DPIAQuestionnaire>` defaults. The DPIA wizard does
 * not render a single header (each section has its own title); the `title`
 * and `description` fields are reserved for future use and currently
 * accepted for API parity with the other presets.
 */
export interface NDPRDPIACopy {
  /** Reserved — DPIA sections render their own titles. */
  title?: string;
  /** Reserved — DPIA sections render their own descriptions. */
  description?: string;
  /** Final-step submit button label. Default: "Submit" */
  submitButton?: string;
  /** Next-section button label. Default: "Next" */
  nextButton?: string;
  /** Previous-section button label. Default: "Previous" */
  prevButton?: string;
}

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
  adapter?: StorageAdapter<DPIAAnswerMap>;
  classNames?: DPIAQuestionnaireClassNames;
  unstyled?: boolean;

  /**
   * Fired when the questionnaire is submitted, with the raw answer map.
   * @deprecated Use `onResult` (4.1+) to receive a full `DPIAResult`
   * containing the computed risk score. `onComplete` will be removed in
   * 5.0.
   */
  onComplete?: (answers: DPIAAnswerMap) => void;

  /**
   * Fired when the questionnaire is submitted, with the full `DPIAResult`
   * including risks, overall risk level, conclusion, and recommendations.
   * Replaces `onComplete` from 4.1+.
   */
  onResult?: (result: DPIAResult) => void;

  /**
   * UX copy overrides — see {@link NDPRDPIACopy}.
   */
  copy?: NDPRDPIACopy;

  /**
   * Public-form mode. Use when the questionnaire should submit to your
   * existing backend workflow instead of being state-managed by an adapter.
   *
   * When `submitTo` is set:
   * - the questionnaire does NOT require an `adapter`
   * - on completion, the toolkit POSTs the JSON-serialised `DPIAAnswerMap`
   *   to this URL (with `Content-Type: application/json`)
   * - your `onComplete` callback still fires (after the POST resolves)
   * - submit failures are surfaced via `onSubmitError`
   *
   * @example
   *   <NDPRDPIA submitTo="/api/dpia" />
   */
  submitTo?: string;

  /**
   * Fetch options for the `submitTo` POST. Useful for adding `credentials`
   * (cookies/auth), `X-CSRF-Token`, or any other header your backend
   * requires. Ignored unless `submitTo` is set.
   *
   * @default { credentials: 'same-origin' }
   */
  submitOptions?: {
    headers?: Record<string, string> | (() => Record<string, string>);
    credentials?: RequestCredentials;
  };

  /**
   * Called when a `submitTo` POST fails (network error or non-2xx
   * response).
   */
  onSubmitError?: (ctx: { error?: unknown; response?: Response }) => void;

  /**
   * Called when a `submitTo` POST succeeds (2xx response). Receives the
   * `Response` object, the submitted `DPIAAnswerMap` payload, and the
   * parsed JSON body if the server returned valid JSON.
   */
  onSubmitSuccess?: (ctx: {
    response: Response;
    data: DPIAAnswerMap;
    body?: unknown;
  }) => void;
}

/**
 * Builds a complete `DPIAResult` from the raw answer map by replaying the
 * same risk-identification + risk-assessment pipeline that `useDPIA` uses.
 * Keeps the preset surface independent of the hook while still producing
 * the canonical result shape.
 */
function buildDPIAResult(sections: DPIASection[], answers: DPIAAnswerMap): DPIAResult {
  const risks: DPIARisk[] = [];

  const visitQuestion = (question: DPIAQuestion) => {
    const answer = answers[question.id];
    if (answer === undefined || answer === null) return;
    if (!question.riskLevel) return;

    if (['select', 'radio', 'checkbox'].includes(question.type) && question.options) {
      const selectedOptions = Array.isArray(answer) ? answer : [answer];
      selectedOptions.forEach((selected) => {
        const option = question.options?.find((opt) => opt.value === selected);
        if (option?.riskLevel) {
          const riskLevel = option.riskLevel;
          const likelihood = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
          const impact = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
          risks.push({
            id: `risk_${risks.length + 1}`,
            description: `${question.text} - ${option.label}`,
            likelihood,
            impact,
            score: likelihood * impact,
            level: riskLevel,
            mitigated: false,
            relatedQuestionIds: [question.id],
          });
        }
      });
    } else {
      const riskLevel = question.riskLevel;
      const likelihood = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
      const impact = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
      risks.push({
        id: `risk_${risks.length + 1}`,
        description: question.text,
        likelihood,
        impact,
        score: likelihood * impact,
        level: riskLevel,
        mitigated: false,
        relatedQuestionIds: [question.id],
      });
    }
  };

  sections.forEach((section) => section.questions.forEach(visitQuestion));

  const now = Date.now();
  const result: DPIAResult = {
    id: `dpia_${now}`,
    title: '',
    processingDescription: '',
    startedAt: now,
    completedAt: now,
    assessor: { name: '', role: '', email: '' },
    answers,
    risks,
    overallRiskLevel: 'low',
    canProceed: true,
    conclusion: '',
    version: '1.0',
  };

  const assessment = assessDPIARisk(result);
  result.overallRiskLevel = assessment.overallRiskLevel;
  result.canProceed = assessment.canProceed;
  result.conclusion = assessment.canProceed
    ? 'Based on the assessment, the processing can proceed with appropriate safeguards.'
    : 'Based on the assessment, the processing should not proceed without further mitigation measures.';
  result.recommendations = assessment.recommendations;
  return result;
}

export const NDPRDPIA: React.FC<NDPRDPIAProps> = ({
  sections = DEFAULT_SECTIONS,
  adapter,
  classNames,
  unstyled,
  onComplete,
  onResult,
  copy,
  submitTo,
  submitOptions,
  onSubmitError,
  onSubmitSuccess,
}) => {
  const [answers, setAnswers] = useState<DPIAAnswerMap>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Fire-once dev warning for the deprecated `onComplete` prop.
  const warnedLegacyRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || warnedLegacyRef.current) return;
    if (onComplete !== undefined && onResult === undefined) {
      warnedLegacyRef.current = true;
      console.warn(
        "[ndpr-toolkit/dpia] `onComplete` is deprecated; use `onResult` to receive the full DPIAResult. Will be removed in 5.0."
      );
    }
  }, [onComplete, onResult]);

  const handleAnswerChange = (questionId: string, value: DPIAAnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const finalizeSubmission = async (finalAnswers: DPIAAnswerMap) => {
    if (submitTo) {
      const headers = typeof submitOptions?.headers === 'function'
        ? submitOptions.headers()
        : submitOptions?.headers ?? {};
      try {
        const response = await fetch(submitTo, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          credentials: submitOptions?.credentials ?? 'same-origin',
          body: JSON.stringify(finalAnswers),
        });
        if (!response.ok) {
          onSubmitError?.({ response });
        } else if (onSubmitSuccess) {
          let body: unknown;
          try {
            const text = await response.clone().text();
            if (text) body = JSON.parse(text);
          } catch {
            // body wasn't JSON
          }
          onSubmitSuccess({ response, data: finalAnswers, body });
        }
      } catch (error) {
        onSubmitError?.({ error });
      }
    } else if (adapter) {
      adapter.save(finalAnswers);
    }
    // New uniform name wins; legacy still fans out for back-compat.
    if (onResult) {
      onResult(buildDPIAResult(sections, finalAnswers));
    }
    onComplete?.(finalAnswers);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      void finalizeSubmission(answers);
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
      submitButtonText={copy?.submitButton}
      nextButtonText={copy?.nextButton}
      prevButtonText={copy?.prevButton}
    />
  );
};
