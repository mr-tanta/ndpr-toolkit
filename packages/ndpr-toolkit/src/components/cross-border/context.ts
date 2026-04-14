import { createContext, useContext } from 'react';
import type { UseCrossBorderTransferReturn } from '../../hooks/useCrossBorderTransfer';

export type CrossBorderContextValue = UseCrossBorderTransferReturn;

export const CrossBorderCompoundContext = createContext<CrossBorderContextValue | null>(null);

export function useCrossBorderCompound(): CrossBorderContextValue {
  const ctx = useContext(CrossBorderCompoundContext);
  if (!ctx) {
    throw new Error(
      'CrossBorder compound components must be wrapped in <CrossBorder.Provider>. ' +
      'Example: <CrossBorder.Provider><CrossBorder.Manager /></CrossBorder.Provider>'
    );
  }
  return ctx;
}
