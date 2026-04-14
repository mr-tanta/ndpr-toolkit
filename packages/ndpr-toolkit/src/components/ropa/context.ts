import { createContext, useContext } from 'react';
import type { UseROPAReturn } from '../../hooks/useROPA';

export type ROPAContextValue = UseROPAReturn;

export const ROPACompoundContext = createContext<ROPAContextValue | null>(null);

export function useROPACompound(): ROPAContextValue {
  const ctx = useContext(ROPACompoundContext);
  if (!ctx) {
    throw new Error(
      'ROPA compound components must be wrapped in <ROPA.Provider>. ' +
      'Example: <ROPA.Provider initialData={...}><ROPA.Manager /></ROPA.Provider>'
    );
  }
  return ctx;
}
