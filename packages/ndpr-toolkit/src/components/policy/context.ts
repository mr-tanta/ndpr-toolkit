import { createContext, useContext } from 'react';
import type { PolicyTemplate } from '../../types/privacy';
import type { UsePrivacyPolicyReturn } from '../../hooks/usePrivacyPolicy';

export interface PolicyContextValue extends UsePrivacyPolicyReturn {
  templates: PolicyTemplate[];
}

export const PolicyCompoundContext = createContext<PolicyContextValue | null>(null);

export function usePolicyCompound(): PolicyContextValue {
  const ctx = useContext(PolicyCompoundContext);
  if (!ctx) {
    throw new Error(
      'Policy compound components must be wrapped in <Policy.Provider>. ' +
      'Example: <Policy.Provider templates={...}><Policy.Generator /></Policy.Provider>'
    );
  }
  return ctx;
}
