import { useMemo } from 'react';
import { generateComplianceAuditReturn } from '../utils/car';
import type { CARInput, CAROptions, ComplianceAuditReturn } from '../utils/car';

/**
 * React hook that memoises the `generateComplianceAuditReturn` utility — derives
 * a DCPMI's Compliance Audit Returns schedule (initial-audit due date, next
 * annual filing deadline) and status under NDPC GAID 2025.
 */
export function useComplianceAuditReturn(
  input: CARInput,
  options?: CAROptions,
): ComplianceAuditReturn {
  const { commencementDate, asOf, tier } = input;

  return useMemo(
    () => generateComplianceAuditReturn({ commencementDate, asOf, tier }, options),
    [commencementDate, asOf, tier, options],
  );
}
