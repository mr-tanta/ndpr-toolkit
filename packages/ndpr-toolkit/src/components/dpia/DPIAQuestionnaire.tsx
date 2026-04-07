import React, { useState, useEffect } from 'react';
import { DPIASection, DPIAQuestion } from '../../types/dpia';
import { resolveClass } from '../../utils/styling';

export interface DPIAQuestionnaireClassNames {
  /** Outermost wrapper */
  root?: string;
  /** Header area containing progress indicator */
  header?: string;
  /** Section title */
  title?: string;
  /** Section container */
  section?: string;
  /** Section title heading */
  sectionTitle?: string;
  /** Individual question wrapper */
  question?: string;
  /** Question label text */
  questionText?: string;
  /** Guidance / help text below a question */
  guidance?: string;
  /** Text / textarea / select inputs */
  input?: string;
  /** Radio option group container */
  radioGroup?: string;
  /** Individual radio option row */
  radioOption?: string;
  /** Navigation button container */
  navigation?: string;
  /** Next / submit button */
  nextButton?: string;
  /** Previous button */
  prevButton?: string;
  /** Alias for nextButton */
  primaryButton?: string;
  /** Alias for prevButton */
  secondaryButton?: string;
  /** Progress bar wrapper */
  progressBar?: string;
}

export interface DPIAQuestionnaireProps {
  /**
   * Sections of the DPIA questionnaire
   */
  sections: DPIASection[];

  /**
   * Current answers to the questionnaire
   */
  answers: Record<string, any>;

  /**
   * Callback function called when an answer is updated
   */
  onAnswerChange: (questionId: string, value: any) => void;

  /**
   * Current section index
   */
  currentSectionIndex: number;

  /**
   * Callback function called when user navigates to the next section
   */
  onNextSection?: () => void;

  /**
   * Callback function called when user navigates to the previous section
   */
  onPrevSection?: () => void;

  /**
   * Validation errors for the current section
   */
  validationErrors?: Record<string, string>;

  /**
   * Whether the questionnaire is in read-only mode
   * @default false
   */
  readOnly?: boolean;

  /**
   * Custom CSS class for the questionnaire
   */
  className?: string;

  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;

  /**
   * Text for the next button
   * @default "Next"
   */
  nextButtonText?: string;

  /**
   * Text for the previous button
   * @default "Previous"
   */
  prevButtonText?: string;

  /**
   * Text for the submit button (shown on the last section)
   * @default "Submit"
   */
  submitButtonText?: string;

  /**
   * Whether to show a progress indicator
   * @default true
   */
  showProgress?: boolean;

  /**
   * Current progress percentage (0-100)
   */
  progress?: number;

  /**
   * Per-section class name overrides
   */
  classNames?: DPIAQuestionnaireClassNames;

  /**
   * When true, all default classes are stripped.
   * Only explicit overrides from `classNames` are applied.
   * @default false
   */
  unstyled?: boolean;
}

/**
 * DPIA questionnaire component. Implements NDPA Section 38 requirements
 * for conducting Data Protection Impact Assessments on high-risk processing activities.
 */
export const DPIAQuestionnaire: React.FC<DPIAQuestionnaireProps> = ({
  sections,
  answers,
  onAnswerChange,
  currentSectionIndex,
  onNextSection,
  onPrevSection,
  validationErrors = {},
  readOnly = false,
  className = "",
  buttonClassName = "",
  nextButtonText = "Next",
  prevButtonText = "Previous",
  submitButtonText = "Submit",
  showProgress = true,
  progress,
  classNames = {},
  unstyled = false,
}) => {
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const cx = (defaultClass: string, key?: keyof DPIAQuestionnaireClassNames) => {
    let override = key ? classNames[key] : undefined;
    // Check aliases: primaryButton -> nextButton, secondaryButton -> prevButton
    if (!override && key === 'nextButton') override = classNames.primaryButton;
    if (!override && key === 'prevButton') override = classNames.secondaryButton;
    return resolveClass(defaultClass, override, unstyled);
  };

  // Check if a question should be shown based on its conditions
  const shouldShowQuestion = (question: DPIAQuestion): boolean => {
    if (!question.showWhen) {
      return true;
    }

    return question.showWhen.every(condition => {
      const answer = answers[condition.questionId];

      switch (condition.operator) {
        case 'equals':
          return answer === condition.value;
        case 'contains':
          return Array.isArray(answer) ? answer.includes(condition.value) : false;
        case 'greaterThan':
          return typeof answer === 'number' ? answer > condition.value : false;
        case 'lessThan':
          return typeof answer === 'number' ? answer < condition.value : false;
        default:
          return true;
      }
    });
  };

  // Shared input class (text, textarea, select)
  const inputClass = (error?: string) =>
    cx(
      `w-full px-3 py-2 border rounded-md ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`,
      'input',
    );

  // Render a question based on its type
  const renderQuestion = (question: DPIAQuestion) => {
    if (!shouldShowQuestion(question)) {
      return null;
    }

    const error = validationErrors[question.id];
    const value = answers[question.id];

    return (
      <div key={question.id} className={cx('mb-6', 'question')}>
        <div className="mb-2">
          <label htmlFor={question.id} className={cx('block text-sm font-medium text-gray-900 dark:text-gray-100', 'questionText')}>
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.guidance && (
            <p className={cx('mt-1 text-sm text-gray-600 dark:text-gray-400', 'guidance')}>{question.guidance}</p>
          )}
        </div>

        {question.type === 'text' && (
          <input
            type="text"
            id={question.id}
            value={value || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            className={inputClass(error)}
          />
        )}

        {question.type === 'textarea' && (
          <textarea
            id={question.id}
            value={value || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            rows={4}
            className={inputClass(error)}
          />
        )}

        {question.type === 'select' && question.options && (
          <select
            id={question.id}
            value={value || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            className={inputClass(error)}
          >
            <option value="">Select an option</option>
            {question.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {question.type === 'radio' && question.options && (
          <div className={cx('space-y-2', 'radioGroup')}>
            {question.options.map(option => (
              <div key={option.value} className={cx('flex items-center', 'radioOption')}>
                <input
                  type="radio"
                  id={`${question.id}_${option.value}`}
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onAnswerChange(question.id, option.value)}
                  disabled={readOnly}
                  className="h-4 w-4 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))] border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor={`${question.id}_${option.value}`}
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                >
                  {option.label}
                  {option.riskLevel && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      option.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      option.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {option.riskLevel.charAt(0).toUpperCase() + option.riskLevel.slice(1)} Risk
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'checkbox' && question.options && (
          <div className="space-y-2">
            {question.options.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${question.id}_${option.value}`}
                  value={option.value}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={e => {
                    const currentValues = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      onAnswerChange(question.id, [...currentValues, option.value]);
                    } else {
                      onAnswerChange(question.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                  disabled={readOnly}
                  className="h-4 w-4 rounded text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))] border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor={`${question.id}_${option.value}`}
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div>
            <div className="flex justify-between mb-2">
              {question.scaleLabels && Object.entries(question.scaleLabels).map(([scaleValue, label]) => (
                <div key={scaleValue} className="text-xs text-gray-600 dark:text-gray-400 text-center" style={{ width: `${100 / Object.keys(question.scaleLabels || {}).length}%` }}>
                  {label}
                </div>
              ))}
            </div>
            <input
              type="range"
              id={question.id}
              min={question.minValue || 1}
              max={question.maxValue || 5}
              value={value || (question.minValue || 1)}
              onChange={e => onAnswerChange(question.id, parseInt(e.target.value, 10))}
              disabled={readOnly}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
              Selected value: {value || (question.minValue || 1)}
            </div>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  if (!currentSection) {
    return <div>No section found.</div>;
  }

  return (
    <div className={`${cx('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6', 'root')} ${className}`}>
      {showProgress && (
        <div className={cx('mb-6', 'header')}>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Section {currentSectionIndex + 1} of {sections.length}</span>
            <span>{progress !== undefined ? `${progress}% Complete` : ''}</span>
          </div>
          <div className={cx('w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700', 'progressBar')}>
            <div
              className="bg-[rgb(var(--ndpr-primary))] h-2.5 rounded-full"
              style={{ width: `${progress !== undefined ? progress : ((currentSectionIndex + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <h2 className={cx('text-xl font-bold mb-2 text-gray-900 dark:text-white', 'title')}>{currentSection.title}</h2>
      {currentSection.description && (
        <p className={cx('mb-6 text-gray-600 dark:text-gray-300', 'sectionTitle')}>{currentSection.description}</p>
      )}

      <div className={cx('space-y-6', 'section')}>
        {currentSection.questions.map(question => renderQuestion(question))}
      </div>

      <div className={cx('mt-8 flex justify-between', 'navigation')}>
        <button
          type="button"
          onClick={onPrevSection}
          disabled={currentSectionIndex === 0 || readOnly}
          className={`${cx('px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed', 'prevButton')} ${buttonClassName}`}
        >
          {prevButtonText}
        </button>

        <button
          type="button"
          onClick={onNextSection}
          disabled={readOnly}
          className={`${cx('px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed', 'nextButton')} ${buttonClassName}`}
        >
          {isLastSection ? submitButtonText : nextButtonText}
        </button>
      </div>
    </div>
  );
};
