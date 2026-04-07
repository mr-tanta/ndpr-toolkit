import React from 'react';
import { BreachCategory } from '../../types/breach';
/**
 * Represents the data submitted by the breach report form.
 */
export interface BreachFormSubmission {
    /** Title/summary of the breach */
    title: string;
    /** Detailed description of the breach */
    description: string;
    /** Breach category identifier */
    category: string;
    /** Timestamp (ms) when the breach was discovered */
    discoveredAt: number;
    /** Timestamp (ms) when the breach occurred (if known) */
    occurredAt?: number;
    /** Timestamp (ms) when the form was submitted */
    reportedAt: number;
    /** Person reporting the breach */
    reporter: {
        name: string;
        email: string;
        department: string;
        phone?: string;
    };
    /** Systems or applications affected by the breach */
    affectedSystems: string[];
    /** Types of data involved in the breach */
    dataTypes: string[];
    /** Estimated number of affected data subjects */
    estimatedAffectedSubjects?: number;
    /** Current status of the breach */
    status: 'ongoing' | 'contained' | 'resolved';
    /** Initial actions taken to address the breach */
    initialActions?: string;
    /** File attachments included with the report */
    attachments: Array<{
        name: string;
        type: string;
        size: number;
        file: File;
    }>;
}
export interface BreachReportFormClassNames {
    root?: string;
    title?: string;
    form?: string;
    fieldGroup?: string;
    label?: string;
    input?: string;
    select?: string;
    textarea?: string;
    submitButton?: string;
    /** Alias for submitButton */
    primaryButton?: string;
    notice?: string;
    /** Custom class applied when isSubmitting is true (e.g. a loading overlay) */
    loadingOverlay?: string;
}
export interface BreachReportFormProps {
    /**
     * Available breach categories
     */
    categories: BreachCategory[];
    /**
     * Callback function called when form is submitted
     */
    onSubmit: (data: BreachFormSubmission) => void;
    /**
     * Callback function called when form validation fails
     */
    onValidationError?: (errors: Record<string, string>) => void;
    /**
     * Title displayed on the form
     * @default "Report a Data Breach"
     */
    title?: string;
    /**
     * Description text displayed on the form
     * @default "Use this form to report a suspected or confirmed data breach in accordance with NDPA Section 40. All fields marked with * are required."
     */
    formDescription?: string;
    /**
     * Text for the submit button
     * @default "Submit Report"
     */
    submitButtonText?: string;
    /**
     * Custom CSS class for the form
     */
    className?: string;
    /**
     * Custom CSS class for the submit button
     */
    buttonClassName?: string;
    /**
     * Override class names for individual elements
     */
    classNames?: BreachReportFormClassNames;
    /**
     * Remove all default styles, only applying classNames overrides
     */
    unstyled?: boolean;
    /**
     * Whether the form is currently submitting.
     * When true, the submit button is disabled and shows "Submitting..." text.
     */
    isSubmitting?: boolean;
    /**
     * Whether to show a confirmation message after submission
     * @default true
     */
    showConfirmation?: boolean;
    /**
     * Confirmation message to display after submission
     * @default "Your breach report has been submitted successfully. The data protection team has been notified."
     */
    confirmationMessage?: string;
    /**
     * Whether to allow file attachments
     * @default true
     */
    allowAttachments?: boolean;
    /**
     * Maximum number of attachments allowed
     * @default 5
     */
    maxAttachments?: number;
    /**
     * Maximum file size for attachments (in bytes)
     * @default 5242880 (5MB)
     */
    maxFileSize?: number;
    /**
     * Allowed file types for attachments
     * @default ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.txt']
     */
    allowedFileTypes?: string[];
    /**
     * Default values to pre-fill form fields.
     * Useful for editing existing breach reports or pre-populating known data.
     */
    defaultValues?: Partial<BreachFormSubmission>;
    /**
     * Callback fired when the form is reset via the Reset button.
     * To fully remount the component (clearing all internal state),
     * change the `key` prop from the parent.
     */
    onReset?: () => void;
}
/**
 * Breach report form component. Implements NDPA Section 40 breach notification requirements,
 * enabling organizations to document and report data breaches within the mandated 72-hour window.
 */
export declare const BreachReportForm: React.FC<BreachReportFormProps>;
