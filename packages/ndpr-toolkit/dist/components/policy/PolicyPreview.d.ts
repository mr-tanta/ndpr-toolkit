import React from 'react';
import { PolicySection, PolicyVariable } from '../../types/privacy';
export interface PolicyPreviewProps {
    /**
     * The policy content to preview
     */
    content: string;
    /**
     * The policy sections
     */
    sections?: PolicySection[];
    /**
     * The policy variables
     */
    variables?: PolicyVariable[];
    /**
     * Callback function called when the policy is exported
     */
    onExport?: (format: 'pdf' | 'html' | 'markdown' | 'docx') => void;
    /**
     * Callback function called when the policy is edited
     */
    onEdit?: () => void;
    /**
     * Title displayed on the preview
     * @default "Privacy Policy Preview"
     */
    title?: string;
    /**
     * Description text displayed on the preview
     * @default "Preview your NDPA-compliant privacy policy before exporting."
     */
    description?: string;
    /**
     * Custom CSS class for the preview
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show the export options
     * @default true
     */
    showExportOptions?: boolean;
    /**
     * Whether to show the edit button
     * @default true
     */
    showEditButton?: boolean;
    /**
     * Whether to show the table of contents
     * @default true
     */
    showTableOfContents?: boolean;
    /**
     * Whether to show the policy metadata
     * @default true
     */
    showMetadata?: boolean;
    /**
     * The organization name to display in the policy
     */
    organizationName?: string;
    /**
     * The last updated date to display in the policy
     */
    lastUpdated?: Date;
}
export declare const PolicyPreview: React.FC<PolicyPreviewProps>;
