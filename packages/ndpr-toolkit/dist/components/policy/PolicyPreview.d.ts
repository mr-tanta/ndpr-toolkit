import React from 'react';
import { PolicySection, PolicyVariable } from '../../types/privacy';
export interface PolicyPreviewClassNames {
    /** Root container */
    root?: string;
    /** Header area containing title and description */
    header?: string;
    /** Title element */
    title?: string;
    /** Description element */
    description?: string;
    /** Content area wrapping the rendered policy */
    content?: string;
    /** Individual rendered section container */
    section?: string;
    /** Section title within rendered content */
    sectionTitle?: string;
    /** Section content within rendered content */
    sectionContent?: string;
    /** NDPA compliance notice */
    complianceNotice?: string;
}
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
    /**
     * Override class names for internal elements
     */
    classNames?: PolicyPreviewClassNames;
    /**
     * If true, removes all default styles. Use with classNames to apply your own.
     * @default false
     */
    unstyled?: boolean;
}
export declare const PolicyPreview: React.FC<PolicyPreviewProps>;
