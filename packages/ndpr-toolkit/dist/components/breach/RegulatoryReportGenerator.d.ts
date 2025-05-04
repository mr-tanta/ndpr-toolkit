import React from 'react';
import { BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';
export interface OrganizationInfo {
    /**
     * Name of the organization
     */
    name: string;
    /**
     * Registration number or business ID
     */
    registrationNumber?: string;
    /**
     * Physical address of the organization
     */
    address: string;
    /**
     * Website URL
     */
    website?: string;
    /**
     * Name of the Data Protection Officer
     */
    dpoName: string;
    /**
     * Email of the Data Protection Officer
     */
    dpoEmail: string;
    /**
     * Phone number of the Data Protection Officer
     */
    dpoPhone?: string;
}
export interface RegulatoryReportGeneratorProps {
    /**
     * The breach data to include in the report
     */
    breachData: BreachReport;
    /**
     * The risk assessment data
     */
    assessmentData?: RiskAssessment;
    /**
     * Organization information to include in the report
     */
    organizationInfo: OrganizationInfo;
    /**
     * Callback function called when the report is generated
     */
    onGenerate: (report: RegulatoryNotification) => void;
    /**
     * Title displayed on the generator form
     * @default "Generate NITDA Notification Report"
     */
    title?: string;
    /**
     * Description text displayed on the generator form
     * @default "Generate a report for submission to NITDA in compliance with the NDPR breach notification requirements."
     */
    description?: string;
    /**
     * Text for the generate button
     * @default "Generate Report"
     */
    generateButtonText?: string;
    /**
     * Custom CSS class for the form
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show a preview of the generated report
     * @default true
     */
    showPreview?: boolean;
    /**
     * Whether to allow editing the report content
     * @default true
     */
    allowEditing?: boolean;
    /**
     * Whether to allow downloading the report
     * @default true
     */
    allowDownload?: boolean;
    /**
     * Format for downloading the report
     * @default "pdf"
     */
    downloadFormat?: 'pdf' | 'docx' | 'html';
}
export declare const RegulatoryReportGenerator: React.FC<RegulatoryReportGeneratorProps>;
