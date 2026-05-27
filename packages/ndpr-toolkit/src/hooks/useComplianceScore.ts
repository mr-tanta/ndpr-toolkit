import { useMemo } from 'react';
import { getComplianceScore } from '../utils/compliance-score';
import type { ComplianceInput, ComplianceReport } from '../utils/compliance-score';

export interface UseComplianceScoreOptions {
  /**
   * Snapshot of the organisation's compliance signals — consent settings,
   * DSR queue, breach log, lawful-basis register, transfers, ROPA, etc.
   * The hook recomputes the report whenever this input changes by value
   * (compared via a stable JSON key under the hood).
   */
  input: ComplianceInput;
}

/**
 * Computes an NDPA compliance score and returns a structured report
 * (score, rating, per-module breakdown, recommendations).
 *
 * The computation is memoised by the structural identity of `input` — passing
 * a fresh-but-equal object on every render is safe and does not force a recompute.
 *
 * @param options - The compliance score options.
 * @param options.input - A {@link ComplianceInput} snapshot summarising the
 *   organisation's current compliance posture.
 * @returns A memoised {@link ComplianceReport} with overall score, rating,
 *   module-level breakdowns, and prioritised recommendations.
 *
 * @example
 * ```tsx
 * import { useComplianceScore } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * function ComplianceBadge({ input }) {
 *   const report = useComplianceScore({ input });
 *   return <span>{report.overallScore}/100 — {report.rating}</span>;
 * }
 * ```
 */
export function useComplianceScore({ input }: UseComplianceScoreOptions): ComplianceReport {
  const inputKey = JSON.stringify(input);
  return useMemo(() => getComplianceScore(input), [inputKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
