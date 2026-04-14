import React from 'react';
import { useConsent } from '../../hooks/useConsent';
import { ConsentCompoundContext } from './context';
import type { ConsentOption, ConsentSettings } from '../../types/consent';
import type { StorageAdapter } from '../../adapters/types';

export interface ConsentProviderProps {
  options: ConsentOption[];
  adapter?: StorageAdapter<ConsentSettings>;
  version?: string;
  onChange?: (settings: ConsentSettings) => void;
  children: React.ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({
  options, adapter, version, onChange, children,
}) => {
  const consent = useConsent({ options, adapter, version, onChange });
  const value = { ...consent, options };
  return (
    <ConsentCompoundContext.Provider value={value}>
      {children}
    </ConsentCompoundContext.Provider>
  );
};
