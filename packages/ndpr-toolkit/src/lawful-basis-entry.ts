/**
 * Lawful Basis Tracker module
 * NDPA Section 25 — document and manage lawful basis for processing activities
 */
export { LawfulBasisTracker } from './components/lawful-basis/LawfulBasisTracker';
export { useLawfulBasis } from './hooks/useLawfulBasis';
export { validateProcessingActivity, getLawfulBasisDescription, assessComplianceGaps, generateLawfulBasisSummary } from './utils/lawful-basis';
export type { LawfulBasisComplianceGap, LawfulBasisValidationResult } from './utils/lawful-basis';
export type { LawfulBasis, SensitiveDataCondition, ProcessingActivity, LegitimateInterestAssessment, LawfulBasisSummary } from './types/lawful-basis';
