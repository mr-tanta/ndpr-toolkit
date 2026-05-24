/**
 * Lawful Basis Tracker — Lite (read-only) entry
 * NDPA Section 25 — display-only variant for dashboards and audit pages.
 * Significantly smaller than `/lawful-basis` because the form, LIA assessment,
 * field validation, and write-path utilities are not included.
 */
export { LawfulBasisTrackerLite } from './components/lawful-basis/LawfulBasisTrackerLite';
export type {
  LawfulBasisTrackerLiteProps,
  LawfulBasisTrackerLiteClassNames,
} from './components/lawful-basis/LawfulBasisTrackerLite';
export type {
  LawfulBasis as LawfulBasisType,
  ProcessingActivity,
  LawfulBasisSummary,
} from './types/lawful-basis';
export { assessComplianceGaps, generateLawfulBasisSummary } from './utils/lawful-basis';
export type {
  LawfulBasisComplianceGap,
  LawfulBasisValidationResult,
} from './utils/lawful-basis';
