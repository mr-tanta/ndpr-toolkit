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
  answers: Record<string, string | number | boolean | string[]>;

  /**
   * Callback function called when an answer is updated
   */
  onAnswerChange: (questionId: string, value: string | number | boolean | string[]) => void;

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
          return Array.isArray(answer) ? answer.includes(String(condition.value)) : false;
        case 'greaterThan':
          return typeof answer === 'number' && typeof condition.value === 'number' ? answer > condition.value : false;
        case 'lessThan':
          return typeof answer === 'number' && typeof condition.value === 'number' ? answer < condition.value : false;
        default:
          return true;
      }
    });
  };

  // Shared input class (text, textarea, select). aria-invalid drives the
  // error styling via the [aria-invalid="true"] selector in the BEM stylesheet.
  const inputClass = (_error?: string) => cx('ndpr-form-field__input', 'input');

  // Render a question based on its type
  const renderQuestion = (question: DPIAQuestion) => {
    if (!shouldShowQuestion(question)) {
      return null;
    }

    const error = validationErrors[question.id];
    const rawValue = answers[question.id];
    // Coerce to a type suitable for HTML value attributes (string | number | string[])
    const value = typeof rawValue === 'boolean' ? String(rawValue) : rawValue;
    const guidanceId = question.guidance ? `${question.id}-guidance` : undefined;
    const errorId = error ? `${question.id}-error` : undefined;
    const describedBy = [guidanceId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div key={question.id} className={cx('ndpr-form-field', 'question')}>
        <label htmlFor={question.id} className={cx('ndpr-form-field__label', 'questionText')}>
          {question.text}
          {question.required && <span className="ndpr-form-field__required">*</span>}
        </label>
        {question.guidance && (
          <p id={guidanceId} className={cx('ndpr-form-field__hint', 'guidance')}>{question.guidance}</p>
        )}

        {question.type === 'text' && (
          <input
            type="text"
            id={question.id}
            value={value || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            className={inputClass(error)}
            aria-required={question.required || undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
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
            aria-required={question.required || undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
          />
        )}

        {question.type === 'select' && question.options && (
          <select
            id={question.id}
            value={value || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            className={inputClass(error)}
            aria-required={question.required || undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
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
          <div
            className={cx('ndpr-form-field__option-group', 'radioGroup')}
            role="radiogroup"
            aria-required={question.required || undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
          >
            {question.options.map(option => (
              <div key={option.value} className={cx('ndpr-form-field__checkbox-row', 'radioOption')}>
                <input
                  type="radio"
                  id={`${question.id}_${option.value}`}
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onAnswerChange(question.id, option.value)}
                  disabled={readOnly}
                  className="ndpr-form-field__radio"
                />
                <label
                  htmlFor={`${question.id}_${option.value}`}
                  className="ndpr-form-field__label"
                >
                  {option.label}
                  {option.riskLevel && (
                    <span className={
                      option.riskLevel === 'low' ? 'ndpr-badge ndpr-badge--success' :
                      option.riskLevel === 'medium' ? 'ndpr-badge ndpr-badge--warning' :
                      'ndpr-badge ndpr-badge--destructive'
                    }>
                      {option.riskLevel.charAt(0).toUpperCase() + option.riskLevel.slice(1)} Risk
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'checkbox' && question.options && (
          <div
            className="ndpr-form-field__option-group"
            role="group"
            aria-label={question.text}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
          >
            {question.options.map(option => (
              <div key={option.value} className="ndpr-form-field__checkbox-row">
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
                  className="ndpr-form-field__checkbox"
                />
                <label
                  htmlFor={`${question.id}_${option.value}`}
                  className="ndpr-form-field__label"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="ndpr-form-field">
            <div className="ndpr-form-field__hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {question.scaleLabels && Object.entries(question.scaleLabels).map(([scaleValue, label]) => (
                <span key={scaleValue} style={{ width: `${100 / Object.keys(question.scaleLabels || {}).length}%`, textAlign: 'center' }}>
                  {label}
                </span>
              ))}
            </div>
            <input
              type="range"
              id={question.id}
              min={question.minValue || 1}
              max={question.maxValue || 5}
              value={typeof value === 'number' ? value : (question.minValue || 1)}
              onChange={e => onAnswerChange(question.id, parseInt(e.target.value, 10))}
              disabled={readOnly}
              className='ndpr-form-field__range'
              aria-required={question.required || undefined}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
            />
            <div className="ndpr-form-field__hint" style={{ textAlign: 'center' }}>
              Selected value: {value || (question.minValue || 1)}
            </div>
          </div>
        )}

        {error && <p id={errorId} className="ndpr-form-field__error" role="alert">{error}</p>}
      </div>
    );
  };

  if (!currentSection) {
    return <div>No section found.</div>;
  }

  return (
    <div data-ndpr-component="dpia-questionnaire" className={`${cx('ndpr-card', 'root')} ${className}`}>
      {showProgress && (
        <div className={cx('ndpr-card__header', 'header')} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--ndpr-space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ndpr-font-size-sm)', color: 'rgb(var(--ndpr-muted-foreground))' }}>
            <span>Section {currentSectionIndex + 1} of {sections.length}</span>
            <span>{progress !== undefined ? `${progress}% Complete` : ''}</span>
          </div>
          <div
            className={cx('ndpr-progress', 'progressBar')}
            role="progressbar"
            aria-valuenow={progress !== undefined ? progress : Math.round(((currentSectionIndex + 1) / sections.length) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Questionnaire progress"
          >
            <div
              className="ndpr-progress__bar"
              style={{ width: `${progress !== undefined ? progress : ((currentSectionIndex + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <h2 className={cx('ndpr-card__title', 'title')}>{currentSection.title}</h2>
      {currentSection.description && (
        <p className={cx('ndpr-card__subtitle', 'sectionTitle')}>{currentSection.description}</p>
      )}

      <div className={cx('ndpr-card__body', 'section')}>
        {currentSection.questions.map(question => renderQuestion(question))}
      </div>

      <div className={cx('ndpr-card__footer', 'navigation')} style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onPrevSection}
          disabled={currentSectionIndex === 0 || readOnly}
          className={`${cx('ndpr-button ndpr-button--secondary', 'prevButton')} ${buttonClassName}`}
        >
          {prevButtonText}
        </button>

        <button
          type="button"
          onClick={onNextSection}
          disabled={readOnly}
          className={`${cx('ndpr-button ndpr-button--primary', 'nextButton')} ${buttonClassName}`}
        >
          {isLastSection ? submitButtonText : nextButtonText}
        </button>
      </div>
    </div>
  );
};
