import React from 'react';
import { BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';
export interface BreachNotificationManagerProps {
    /**
     * List of breach reports to manage
     */
    breachReports: BreachReport[];
    /**
     * List of risk assessments
     */
    riskAssessments: RiskAssessment[];
    /**
     * List of regulatory notifications
     */
    regulatoryNotifications: RegulatoryNotification[];
    /**
     * Callback function called when a breach is selected
     */
    onSelectBreach?: (breachId: string) => void;
    /**
     * Callback function called when a risk assessment is requested
     */
    onRequestAssessment?: (breachId: string) => void;
    /**
     * Callback function called when a notification is requested
     */
    onRequestNotification?: (breachId: string) => void;
    /**
     * Title displayed on the manager
     * @default "Breach Notification Manager"
     */
    title?: string;
    /**
     * Description text displayed on the manager
     * @default "Manage data breach notifications and track compliance with NDPR requirements."
     */
    description?: string;
    /**
     * Custom CSS class for the manager
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show the breach details
     * @default true
     */
    showBreachDetails?: boolean;
    /**
     * Whether to show the notification timeline
     * @default true
     */
    showNotificationTimeline?: boolean;
    /**
     * Whether to show the deadline alerts
     * @default true
     */
    showDeadlineAlerts?: boolean;
}
export declare const BreachNotificationManager: React.FC<BreachNotificationManagerProps>;
