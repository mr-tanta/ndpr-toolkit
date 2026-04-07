import React from 'react';
import { RequestType } from '../../types/dsr';
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
    successMessage?: string;
}
export interface DSRRequestFormProps {
    /**
     * Array of request types that can be submitted
     */
    requestTypes: RequestType[];
    /**
     * Callback function called when form is submitted
     */
    onSubmit: (formData: any) => void;
    /**
     * Title displayed on the form
     * @default "Submit a Data Subject Request"
     */
    title?: string;
    /**
     * Description text displayed on the form
     * @default "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA)."
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
}
export declare const DSRRequestForm: React.FC<DSRRequestFormProps>;
