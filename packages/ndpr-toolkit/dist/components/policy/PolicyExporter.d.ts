import React from 'react';
export interface PolicyExporterProps {
    /**
     * The policy content to export
     */
    content: string;
    /**
     * The policy title
     */
    title?: string;
    /**
     * The organization name to include in the exported policy
     */
    organizationName?: string;
    /**
     * The last updated date to include in the exported policy
     */
    lastUpdated?: Date;
    /**
     * Callback function called when the export is complete
     */
    onExportComplete?: (format: string, url: string) => void;
    /**
     * Title displayed on the exporter
     * @default "Export Privacy Policy"
     */
    componentTitle?: string;
    /**
     * Description text displayed on the exporter
     * @default "Export your NDPA-compliant privacy policy in various formats."
     */
    description?: string;
    /**
     * Custom CSS class for the exporter
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show the export history
     * @default true
     */
    showExportHistory?: boolean;
    /**
     * Whether to include the NDPA compliance notice in the exported policy
     * @default true
     */
    includeComplianceNotice?: boolean;
    /**
     * Whether to include the organization logo in the exported policy
     * @default false
     */
    includeLogo?: boolean;
    /**
     * URL of the organization logo
     */
    logoUrl?: string;
    /**
     * Custom CSS styles for the exported policy
     */
    customStyles?: string;
}
export declare const PolicyExporter: React.FC<PolicyExporterProps>;
