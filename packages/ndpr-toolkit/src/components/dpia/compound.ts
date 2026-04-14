export { DPIAProvider as Provider } from './Provider';
export type { DPIAProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { DPIAQuestionnaire as Questionnaire } from './DPIAQuestionnaire';
export { DPIAReport as Report } from './DPIAReport';
export { StepIndicator } from './StepIndicator';

// Namespace object for compound pattern: <DPIA.Provider>, <DPIA.Questionnaire>, etc.
import { DPIAProvider } from './Provider';
import { DPIAQuestionnaire } from './DPIAQuestionnaire';
import { DPIAReport } from './DPIAReport';
import { StepIndicator } from './StepIndicator';

export const DPIA = {
  Provider: DPIAProvider,
  Questionnaire: DPIAQuestionnaire,
  Report: DPIAReport,
  StepIndicator: StepIndicator,
};
