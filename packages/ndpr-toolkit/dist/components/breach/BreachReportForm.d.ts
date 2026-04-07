import React from 'react';
import { BreachCategory } from '../../types/breach';
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
    notice?: string;
}
export interface BreachReportFormProps {
    /**
     * Available breach categories
     */
    categories: BreachCategory[];
    /**
     * Callback function called when form is submitted
     */
    onSubmit: (formData: any) => void;
    /**
     * Title displayed on the form
     * @default "Report a Data Breach"
     */
    title?: string;
    /**
     * Description text displayed on the form
     * @default "Use this form to report a suspected or confirmed data breach. All fields marked with * are required."
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
}
export declare const BreachReportForm: React.FC<BreachReportFormProps>;
