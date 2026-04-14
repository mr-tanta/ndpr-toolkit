import React from 'react';
import { usePrivacyPolicy } from '../../hooks/usePrivacyPolicy';
import { PolicyCompoundContext } from './context';
import type { PolicyTemplate, PrivacyPolicy } from '../../types/privacy';
import type { StorageAdapter } from '../../adapters/types';

export interface PolicyProviderProps {
  templates: PolicyTemplate[];
  adapter?: StorageAdapter<PrivacyPolicy>;
  storageKey?: string;
  useLocalStorage?: boolean;
  initialPolicy?: PrivacyPolicy;
  onGenerate?: (policy: PrivacyPolicy) => void;
  children: React.ReactNode;
}

export const PolicyProvider: React.FC<PolicyProviderProps> = ({
  templates,
  adapter,
  storageKey,
  useLocalStorage,
  initialPolicy,
  onGenerate,
  children,
}) => {
  const privacyPolicy = usePrivacyPolicy({
    templates,
    adapter,
    storageKey,
    useLocalStorage,
    initialPolicy,
    onGenerate,
  });
  const value = { ...privacyPolicy, templates };
  return (
    <PolicyCompoundContext.Provider value={value}>
      {children}
    </PolicyCompoundContext.Provider>
  );
};
