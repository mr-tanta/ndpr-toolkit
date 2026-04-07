import React from 'react';
import { PolicySection, PolicyVariable } from '../../types/privacy';
export interface PolicyGeneratorClassNames {
    /** Root container */
    root?: string;
    /** Header area containing title and description */
    header?: string;
    /** Title element */
    title?: string;
    /** Description element */
    description?: string;
    /** Section list container */
    sectionList?: string;
    /** Individual section item */
    sectionItem?: string;
    /** Variable form container */
    form?: string;
    /** Form input fields */
    input?: string;
    /** Generate button */
    generateButton?: string;
    /** Alias for generateButton */
    primaryButton?: string;
    /** NDPA compliance notice */
    complianceNotice?: string;
}
export interface PolicyGeneratorProps {
    /**
     * List of policy sections
     * @default DEFAULT_POLICY_SECTIONS
     */
    sections?: PolicySection[];
    /**
     * List of policy variables
     * @default DEFAULT_POLICY_VARIABLES
     */
    variables?: PolicyVariable[];
    /**
     * Callback function called when the policy is generated
     */
    onGenerate: (policy: {
        sections: PolicySection[];
        variables: PolicyVariable[];
        content: string;
    }) => void;
    /**
     * Title displayed on the generator
     * @default "NDPA Privacy Policy Generator"
     */
    title?: string;
    /**
     * Description text displayed on the generator
     * @default "Generate an NDPA-compliant privacy policy for your organization in accordance with NDPA Section 24."
     */
    description?: string;
    /**
     * Custom CSS class for the generator
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Text for the generate button
     * @default "Generate Policy"
     */
    generateButtonText?: string;
    /**
     * Whether to show a preview of the generated policy
     * @default true
     */
    showPreview?: boolean;
    /**
     * Whether to allow editing the policy content
     * @default true
     */
    allowEditing?: boolean;
    /**
     * Override class names for internal elements
     */
    classNames?: PolicyGeneratorClassNames;
    /**
     * If true, removes all default styles. Use with classNames to apply your own.
     * @default false
     */
    unstyled?: boolean;
}
/**
 * Privacy policy generator component. Implements NDPA Section 24 transparency requirements,
 * helping organizations generate compliant privacy policies that disclose required information.
 */
export declare const PolicyGenerator: React.FC<PolicyGeneratorProps>;
