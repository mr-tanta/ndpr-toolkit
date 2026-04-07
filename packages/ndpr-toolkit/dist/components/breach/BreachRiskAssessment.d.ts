import React from 'react';
import { BreachReport, RiskAssessment } from '../../types/breach';
export interface BreachRiskAssessmentClassNames {
    root?: string;
    header?: string;
    title?: string;
    slider?: string;
    riskBadge?: string;
    riskScore?: string;
    notificationStatus?: string;
    submitButton?: string;
}
export interface BreachRiskAssessmentProps {
    /**
     * The breach data to assess
     */
    breachData: BreachReport;
    /**
     * Initial assessment data (if editing an existing assessment)
     */
    initialAssessment?: Partial<RiskAssessment>;
    /**
     * Callback function called when assessment is completed
     */
    onComplete: (assessment: RiskAssessment) => void;
    /**
     * Title displayed on the assessment form
     * @default "Breach Risk Assessment"
     */
    title?: string;
    /**
     * Description text displayed on the assessment form
     * @default "Assess the risk level of this data breach to determine notification requirements."
     */
    description?: string;
    /**
     * Text for the submit button
     * @default "Complete Assessment"
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
    classNames?: BreachRiskAssessmentClassNames;
    /**
     * Remove all default styles, only applying classNames overrides
     */
    unstyled?: boolean;
    /**
     * Whether to show the breach summary
     * @default true
     */
    showBreachSummary?: boolean;
    /**
     * Whether to show notification requirements after assessment
     * @default true
     */
    showNotificationRequirements?: boolean;
}
export declare const BreachRiskAssessment: React.FC<BreachRiskAssessmentProps>;
