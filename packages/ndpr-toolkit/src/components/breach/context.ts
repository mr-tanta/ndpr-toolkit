import { createContext, useContext } from 'react';
import type { BreachCategory } from '../../types/breach';
import type { UseBreachReturn } from '../../hooks/useBreach';

export interface BreachContextValue extends UseBreachReturn {
  categories: BreachCategory[];
}

export const BreachCompoundContext = createContext<BreachContextValue | null>(null);

export function useBreachCompound(): BreachContextValue {
  const ctx = useContext(BreachCompoundContext);
  if (!ctx) {
    throw new Error(
      'Breach compound components must be wrapped in <Breach.Provider>. ' +
      'Example: <Breach.Provider categories={...}><Breach.ReportForm /></Breach.Provider>'
    );
  }
  return ctx;
}
