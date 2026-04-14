import { createContext, useContext } from 'react';
import type { ConsentOption, ConsentSettings } from '../../types/consent';

export interface ConsentContextValue {
  options: ConsentOption[];
  settings: ConsentSettings | null;
  hasConsent: (optionId: string) => boolean;
  updateConsent: (consents: Record<string, boolean>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  shouldShowBanner: boolean;
  isValid: boolean;
  validationErrors: string[];
  resetConsent: () => void;
  isLoading: boolean;
}

export const ConsentCompoundContext = createContext<ConsentContextValue | null>(null);

export function useConsentCompound(): ConsentContextValue {
  const ctx = useContext(ConsentCompoundContext);
  if (!ctx) {
    throw new Error(
      'Consent compound components must be wrapped in <Consent.Provider>. ' +
      'Example: <Consent.Provider options={...}><Consent.Banner /></Consent.Provider>'
    );
  }
  return ctx;
}
