import { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from '../types/breach';
interface UseBreachOptions {
    /**
     * Available breach categories
     */
    categories: BreachCategory[];
    /**
     * Initial breach reports
     */
    initialReports?: BreachReport[];
    /**
     * Storage key for breach data
     * @default "ndpr_breach_data"
     */
    storageKey?: string;
    /**
     * Whether to use local storage to persist breach data
     * @default true
     */
    useLocalStorage?: boolean;
    /**
     * Callback function called when a breach is reported
     */
    onReport?: (report: BreachReport) => void;
    /**
     * Callback function called when a risk assessment is completed
     */
    onAssessment?: (assessment: RiskAssessment) => void;
    /**
     * Callback function called when a notification is sent
     */
    onNotification?: (notification: RegulatoryNotification) => void;
}
interface UseBreachReturn {
    /**
     * All breach reports
     */
    reports: BreachReport[];
    /**
     * All risk assessments
     */
    assessments: RiskAssessment[];
    /**
     * All regulatory notifications
     */
    notifications: RegulatoryNotification[];
    /**
     * Submit a new breach report
     */
    reportBreach: (reportData: Omit<BreachReport, 'id' | 'reportedAt'>) => BreachReport;
    /**
     * Update an existing breach report
     */
    updateReport: (id: string, updates: Partial<BreachReport>) => BreachReport | null;
    /**
     * Get a breach report by ID
     */
    getReport: (id: string) => BreachReport | null;
    /**
     * Conduct a risk assessment for a breach
     */
    assessRisk: (breachId: string, assessmentData: Omit<RiskAssessment, 'id' | 'breachId' | 'assessedAt'>) => RiskAssessment;
    /**
     * Get a risk assessment for a breach
     */
    getAssessment: (breachId: string) => RiskAssessment | null;
    /**
     * Calculate notification requirements based on a risk assessment
     */
    calculateNotificationRequirements: (breachId: string) => NotificationRequirement | null;
    /**
     * Send a regulatory notification
     */
    sendNotification: (breachId: string, notificationData: Omit<RegulatoryNotification, 'id' | 'breachId' | 'sentAt'>) => RegulatoryNotification;
    /**
     * Get a regulatory notification for a breach
     */
    getNotification: (breachId: string) => RegulatoryNotification | null;
    /**
     * Get breaches that require notification within the next X hours
     */
    getBreachesRequiringNotification: (hoursThreshold?: number) => Array<{
        report: BreachReport;
        assessment: RiskAssessment;
        requirements: NotificationRequirement;
        hoursRemaining: number;
    }>;
    /**
     * Clear all breach data
     */
    clearBreachData: () => void;
}
/**
 * Hook for managing data breach notifications in compliance with the NDPA (Section 40)
 */
export declare function useBreach({ categories, initialReports, storageKey, useLocalStorage, onReport, onAssessment, onNotification }: UseBreachOptions): UseBreachReturn;
export {};
