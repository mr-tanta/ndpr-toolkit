/**
 * Cross-Border Data Transfer module
 * NDPA Part VI (Sections 41-45) — international transfer assessment and documentation
 */
export { CrossBorderTransferManager } from './components/cross-border/CrossBorderTransferManager';
export { useCrossBorderTransfer } from './hooks/useCrossBorderTransfer';
export { validateTransfer, getTransferMechanismDescription, assessTransferRisk, isNDPCApprovalRequired } from './utils/cross-border';
export type { TransferValidationResult, TransferRiskResult } from './utils/cross-border';
export type { TransferMechanism, AdequacyStatus, CrossBorderTransfer, TransferImpactAssessment, CrossBorderSummary } from './types/cross-border';
