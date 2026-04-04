import React from 'react';
import { PolicySection, PolicyVariable } from '../../types/privacy';
export interface PolicyGeneratorProps {
    /**
     * List of policy sections
     */
    sections: PolicySection[];
    /**
     * List of policy variables
     */
    variables: PolicyVariable[];
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
     * @default "Generate an NDPA-compliant privacy policy for your organization."
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
}
export declare const PolicyGenerator: React.FC<PolicyGeneratorProps>;
