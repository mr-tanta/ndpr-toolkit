import { createContext, useContext } from 'react';
import type { DPIASection } from '../../types/dpia';
import type { UseDPIAReturn } from '../../hooks/useDPIA';

export interface DPIAContextValue extends UseDPIAReturn {
  sections: DPIASection[];
}

export const DPIACompoundContext = createContext<DPIAContextValue | null>(null);

export function useDPIACompound(): DPIAContextValue {
  const ctx = useContext(DPIACompoundContext);
  if (!ctx) {
    throw new Error(
      'DPIA compound components must be wrapped in <DPIA.Provider>. ' +
      'Example: <DPIA.Provider sections={...}><DPIA.Questionnaire /></DPIA.Provider>'
    );
  }
  return ctx;
}
