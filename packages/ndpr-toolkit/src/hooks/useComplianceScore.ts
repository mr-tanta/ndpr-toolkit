import { useMemo } from 'react';
import { getComplianceScore } from '../utils/compliance-score';
import type { ComplianceInput, ComplianceReport } from '../utils/compliance-score';

interface UseComplianceScoreOptions {
  input: ComplianceInput;
}

export function useComplianceScore({ input }: UseComplianceScoreOptions): ComplianceReport {
  return useMemo(() => getComplianceScore(input), [input]);
}
