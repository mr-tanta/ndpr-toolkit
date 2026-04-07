import React from 'react';
import { RequestType } from '../../types/dsr';
/**
 * Represents the data submitted by the DSR request form.
 */
export interface DSRFormSubmission {
    /** The selected request type identifier */
    requestType: string;
    /** Data subject personal information */
    dataSubject: {
        fullName: string;
        email: string;
        phone?: string;
        identifierType: string;
        identifierValue: string;
    };
    /** Additional information provided for the selected request type */
    additionalInfo?: Record<string, any>;
    /** Timestamp (ms) when the form was submitted */
    submittedAt: number;
}
export interface DSRRequestFormClassNames {
    root?: string;
    title?: string;
    description?: string;
    form?: string;
    fieldGroup?: string;
    label?: string;
    input?: string;
    select?: string;
    textarea?: string;
    submitButton?: string;
    /** Alias for submitButton */
    primaryButton?: string;
    successMessage?: string;
    /** Custom class applied when isSubmitting is true (e.g. a loading overlay) */
    loadingOverlay?: string;
}
export interface DSRRequestFormProps {
    /**
     * Array of request types that can be submitted
     */
    requestTypes: RequestType[];
    /**
     * Callback function called when form is submitted
     */
    onSubmit: (data: DSRFormSubmission) => void;
    /**
     * Callback function called when form validation fails
     */
    onValidationError?: (errors: Record<string, string>) => void;
    /**
     * Title displayed on the form
     * @default "Submit a Data Subject Request"
     */
    title?: string;
    /**
     * Description text displayed on the form
     * @default "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA), Part IV, Sections 29-36."
     */
    description?: string;
    /**
     * Text for the submit button
     * @default "Submit Request"
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
     * Whether to show a confirmation message after submission
     * @default true
     */
    showConfirmation?: boolean;
    /**
     * Confirmation message to display after submission
     * @default "Your request has been submitted successfully. You will receive a confirmation email shortly."
     */
    confirmationMessage?: string;
    /**
     * Whether to require identity verification
     * @default true
     */
    requireIdentityVerification?: boolean;
    /**
     * Types of identifiers accepted for verification
     * @default ["email", "account", "customer_id"]
     */
    identifierTypes?: Array<{
        id: string;
        label: string;
    }>;
    /**
     * Whether to collect additional contact information
     * @default true
     */
    collectAdditionalContact?: boolean;
    /**
     * Custom labels for form fields
     */
    labels?: {
        name?: string;
        email?: string;
        requestType?: string;
        description?: string;
        submit?: string;
    };
    /**
     * Object of CSS class overrides keyed by semantic section name.
     */
    classNames?: DSRRequestFormClassNames;
    /**
     * When true, all default Tailwind classes are removed so consumers
     * can style from scratch using classNames.
     */
    unstyled?: boolean;
    /**
     * Whether the form is currently submitting.
     * When true, the submit button is disabled and shows "Submitting..." text.
     */
    isSubmitting?: boolean;
    /**
     * Default values to pre-fill form fields.
     * Useful for editing existing requests or pre-populating known data.
     */
    defaultValues?: Partial<DSRFormSubmission>;
    /**
     * Callback fired when the form is reset via the Reset button.
     * To fully remount the component (clearing all internal state),
     * change the `key` prop from the parent.
     */
    onReset?: () => void;
}
/**
 * Data Subject Request form component. Implements NDPA Part IV, Sections 29-36
 * covering data subject rights including access, rectification, erasure, and portability.
 */
export declare const DSRRequestForm: React.FC<DSRRequestFormProps>;
