/**
 * Cross-Border Data Transfer Manager — Lite (read-only) entry
 * Display-only variant for compliance dashboards. The biggest payload win
 * in the Lite family — does NOT import the country-adequacy dataset
 * (~124KB) because read-only display uses the `adequacyStatus` recorded
 * on each transfer object instead of recomputing it.
 */
export { CrossBorderTransferManagerLite } from './components/cross-border/CrossBorderTransferManagerLite';
export type {
  CrossBorderTransferManagerLiteProps,
  CrossBorderTransferManagerLiteClassNames,
} from './components/cross-border/CrossBorderTransferManagerLite';
export type {
  CrossBorderTransfer,
  TransferMechanism,
  AdequacyStatus,
  CrossBorderSummary,
} from './types/cross-border';
