/**
 * Record of Processing Activities (ROPA) module
 * NDPA accountability principle — comprehensive processing records
 */
export { ROPAManager } from './components/ropa/ROPAManager';
export { useROPA } from './hooks/useROPA';
export type { UseROPAOptions, UseROPAReturn } from './hooks/useROPA';
export { validateProcessingRecord, generateROPASummary, exportROPAToCSV, identifyComplianceGaps } from './utils/ropa';
export type { ROPAComplianceGap, ROPAValidationResult } from './utils/ropa';
export type { ProcessingRecord, RecordOfProcessingActivities, ROPASummary } from './types/ropa';
