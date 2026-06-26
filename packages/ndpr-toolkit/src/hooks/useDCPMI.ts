import { useMemo } from 'react';
import { classifyDCPMI } from '../utils/dcpmi';
import type {
  DCPMIInput,
  DCPMIClassificationOptions,
  DCPMIClassification,
} from '../utils/dcpmi';

/**
 * React hook that memoises the `classifyDCPMI` utility — derives an organisation's
 * Data Controller/Processor of Major Importance tier, annual registration fee,
 * and Compliance Audit Returns obligations under NDPC GAID 2025.
 */
export function useDCPMI(
  input: DCPMIInput,
  options?: DCPMIClassificationOptions,
): DCPMIClassification {
  const { dataSubjectsInSixMonths, isDesignated } = input;

  return useMemo(
    () => classifyDCPMI({ dataSubjectsInSixMonths, isDesignated }, options),
    [dataSubjectsInSixMonths, isDesignated, options],
  );
}
