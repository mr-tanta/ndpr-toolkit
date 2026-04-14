import React from 'react';
import { useDPIA } from '../../hooks/useDPIA';
import { DPIACompoundContext } from './context';
import type { DPIASection, DPIAResult } from '../../types/dpia';
import type { StorageAdapter } from '../../adapters/types';

export interface DPIAProviderProps {
  sections: DPIASection[];
  initialAnswers?: Record<string, any>;
  adapter?: StorageAdapter<Record<string, any>>;
  storageKey?: string;
  useLocalStorage?: boolean;
  onComplete?: (result: DPIAResult) => void;
  children: React.ReactNode;
}

export const DPIAProvider: React.FC<DPIAProviderProps> = ({
  sections,
  initialAnswers,
  adapter,
  storageKey,
  useLocalStorage,
  onComplete,
  children,
}) => {
  const dpia = useDPIA({ sections, initialAnswers, adapter, storageKey, useLocalStorage, onComplete });
  const value = { ...dpia, sections };
  return (
    <DPIACompoundContext.Provider value={value}>
      {children}
    </DPIACompoundContext.Provider>
  );
};
