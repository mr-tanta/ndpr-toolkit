/**
 * Breach Notification module
 * NDPA Section 40 — 72-hour NDPC notification, data subject notification
 */
export { BreachReportForm } from './components/breach/BreachReportForm';
export { BreachRiskAssessment } from './components/breach/BreachRiskAssessment';
export { BreachNotificationManager } from './components/breach/BreachNotificationManager';
export { RegulatoryReportGenerator } from './components/breach/RegulatoryReportGenerator';
export type { BreachReportFormClassNames, BreachFormSubmission } from './components/breach/BreachReportForm';
export type { BreachRiskAssessmentClassNames } from './components/breach/BreachRiskAssessment';
export type { BreachNotificationManagerClassNames } from './components/breach/BreachNotificationManager';
export type { RegulatoryReportGeneratorClassNames } from './components/breach/RegulatoryReportGenerator';
export { useBreach } from './hooks/useBreach';
export { calculateBreachSeverity } from './utils/breach';
export type { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from './types/breach';
