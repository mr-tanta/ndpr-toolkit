import { createContext, useContext } from 'react';
import type { RequestType } from '../../types/dsr';
import type { UseDSRReturn } from '../../hooks/useDSR';

export interface DSRContextValue extends UseDSRReturn {
  requestTypes: RequestType[];
}

export const DSRCompoundContext = createContext<DSRContextValue | null>(null);

export function useDSRCompound(): DSRContextValue {
  const ctx = useContext(DSRCompoundContext);
  if (!ctx) {
    throw new Error(
      'DSR compound components must be wrapped in <DSR.Provider>. ' +
      'Example: <DSR.Provider requestTypes={...}><DSR.Form /></DSR.Provider>'
    );
  }
  return ctx;
}
