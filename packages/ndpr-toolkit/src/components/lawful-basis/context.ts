import { createContext, useContext } from 'react';
import type { UseLawfulBasisReturn } from '../../hooks/useLawfulBasis';

export type LawfulBasisContextValue = UseLawfulBasisReturn;

export const LawfulBasisCompoundContext = createContext<LawfulBasisContextValue | null>(null);

export function useLawfulBasisCompound(): LawfulBasisContextValue {
  const ctx = useContext(LawfulBasisCompoundContext);
  if (!ctx) {
    throw new Error(
      'LawfulBasis compound components must be wrapped in <LawfulBasis.Provider>. ' +
      'Example: <LawfulBasis.Provider><LawfulBasis.Tracker /></LawfulBasis.Provider>'
    );
  }
  return ctx;
}
