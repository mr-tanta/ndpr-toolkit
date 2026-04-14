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
export { ROPA } from './components/ropa/compound';
export { ROPAProvider } from './components/ropa/Provider';
export type { ROPAProviderProps } from './components/ropa/Provider';
export { useROPACompound } from './components/ropa/context';
export type { StorageAdapter } from './adapters/types';
