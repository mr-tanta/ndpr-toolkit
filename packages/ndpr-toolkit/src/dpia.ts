/**
 * Data Protection Impact Assessment module
 * NDPA Section 38 (DPIA requirements) and Section 39 (NDPC consultation)
 */
export { DPIAQuestionnaire } from './components/dpia/DPIAQuestionnaire';
export { DPIAReport } from './components/dpia/DPIAReport';
export { StepIndicator } from './components/dpia/StepIndicator';
export type { DPIAQuestionnaireClassNames } from './components/dpia/DPIAQuestionnaire';
export type { DPIAReportClassNames } from './components/dpia/DPIAReport';
export type { StepIndicatorClassNames } from './components/dpia/StepIndicator';
export { useDPIA } from './hooks/useDPIA';
export { assessDPIARisk } from './utils/dpia';
export type { DPIAQuestion, DPIASection, DPIAResult, DPIARisk } from './types/dpia';
