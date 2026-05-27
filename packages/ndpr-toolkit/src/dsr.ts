/**
 * Data Subject Rights module
 * NDPA Part VI (Sections 34-38) — all 8 data subject rights
 */
export { DSRRequestForm } from './components/dsr/DSRRequestForm';
export { DSRDashboard } from './components/dsr/DSRDashboard';
export { DSRTracker } from './components/dsr/DSRTracker';
export { useDSR } from './hooks/useDSR';
export { formatDSRRequestStructured, validateDsrSubmissionStructured } from './utils/dsr';
export type {
  DsrSubmissionPayload,
  ValidateDsrSubmissionOptions,
  FormatDSRRequestStructuredResult,
} from './utils/dsr';
export type { DSRRequest, RequestType, DSRStatus, DSRType, RequestStatus } from './types/dsr';
export type { DSRRequestFormClassNames, DSRFormSubmission } from './components/dsr/DSRRequestForm';
export type { DSRDashboardClassNames } from './components/dsr/DSRDashboard';
export type { DSRTrackerClassNames } from './components/dsr/DSRTracker';

// Compound components (v3)
export { DSR } from './components/dsr/compound';
export { DSRProvider } from './components/dsr/Provider';
export type { DSRProviderProps } from './components/dsr/Provider';
export { useDSRCompound } from './components/dsr/context';
export type { StorageAdapter } from './adapters/types';
