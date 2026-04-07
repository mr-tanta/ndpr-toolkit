import React from 'react';
import { DPIAResult, DPIASection } from '../../types/dpia';
export interface DPIAReportClassNames {
    /** Outermost wrapper */
    root?: string;
    /** Report header area */
    header?: string;
    /** Main report title */
    title?: string;
    /** Executive summary section */
    summary?: string;
    /** Risk level badge */
    riskBadge?: string;
    /** Risks table element */
    riskTable?: string;
    /** Individual risk row */
    riskRow?: string;
    /** Recommendation list item */
    recommendation?: string;
    /** Conclusion text */
    conclusion?: string;
    /** Print button */
    printButton?: string;
}
export interface DPIAReportProps {
    /**
     * The DPIA result to display
     */
    result: DPIAResult;
    /**
     * The sections of the DPIA questionnaire
     */
    sections: DPIASection[];
    /**
     * Whether to show the full report or just a summary
     * @default true
     */
    showFullReport?: boolean;
    /**
     * Whether to allow printing the report
     * @default true
     */
    allowPrint?: boolean;
    /**
     * Whether to allow exporting the report as PDF
     * @default true
     */
    allowExport?: boolean;
    /**
     * Callback function called when the report is exported
     */
    onExport?: (format: 'pdf' | 'docx' | 'html') => void;
    /**
     * Custom CSS class for the report container
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Per-section class name overrides
     */
    classNames?: DPIAReportClassNames;
    /**
     * When true, all default classes are stripped.
     * Only explicit overrides from `classNames` are applied.
     * @default false
     */
    unstyled?: boolean;
}
export declare const DPIAReport: React.FC<DPIAReportProps>;
