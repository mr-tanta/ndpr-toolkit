import React from 'react';
import { DPIASection } from '../../types/dpia';
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
export declare const DPIAQuestionnaire: React.FC<DPIAQuestionnaireProps>;
