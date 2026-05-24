/**
 * Record of Processing Activities (ROPA) — Lite (read-only) entry
 * Display-only variant for compliance dashboards and audit pages.
 * Excludes the form, validation, and CSV export utilities so the
 * payload is significantly smaller than the full `/ropa` entry.
 */
export { ROPAManagerLite } from './components/ropa/ROPAManagerLite';
export type {
  ROPAManagerLiteProps,
  ROPAManagerLiteClassNames,
} from './components/ropa/ROPAManagerLite';
export type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  ROPASummary,
} from './types/ropa';
export { generateROPASummary, identifyComplianceGaps } from './utils/ropa';
export type { ROPAComplianceGap } from './utils/ropa';
