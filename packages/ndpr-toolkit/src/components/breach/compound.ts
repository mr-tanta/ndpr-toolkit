export { BreachProvider as Provider } from './Provider';
export type { BreachProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { BreachReportForm } from './BreachReportForm';
export { BreachRiskAssessment } from './BreachRiskAssessment';
export { BreachNotificationManager } from './BreachNotificationManager';
export { RegulatoryReportGenerator } from './RegulatoryReportGenerator';

// Namespace object for compound pattern: <Breach.Provider>, <Breach.ReportForm>, etc.
import { BreachProvider } from './Provider';
import { BreachReportForm } from './BreachReportForm';
import { BreachRiskAssessment } from './BreachRiskAssessment';
import { BreachNotificationManager } from './BreachNotificationManager';
import { RegulatoryReportGenerator } from './RegulatoryReportGenerator';

export const Breach = {
  Provider: BreachProvider,
  ReportForm: BreachReportForm,
  RiskAssessment: BreachRiskAssessment,
  NotificationManager: BreachNotificationManager,
  ReportGenerator: RegulatoryReportGenerator,
};
