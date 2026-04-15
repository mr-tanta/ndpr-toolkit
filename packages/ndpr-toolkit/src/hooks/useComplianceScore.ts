import { useMemo } from 'react';
import { getComplianceScore } from '../utils/compliance-score';
import type { ComplianceInput, ComplianceReport } from '../utils/compliance-score';

interface UseComplianceScoreOptions {
  input: ComplianceInput;
}

export function useComplianceScore({ input }: UseComplianceScoreOptions): ComplianceReport {
  const inputKey = JSON.stringify(input);
  return useMemo(() => getComplianceScore(input), [inputKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
