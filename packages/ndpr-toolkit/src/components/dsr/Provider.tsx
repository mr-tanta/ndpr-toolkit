import React from 'react';
import { useDSR } from '../../hooks/useDSR';
import { DSRCompoundContext } from './context';
import type { RequestType } from '../../types/dsr';
import type { StorageAdapter } from '../../adapters/types';
import type { DSRRequest } from '../../types/dsr';

export interface DSRProviderProps {
  requestTypes: RequestType[];
  adapter?: StorageAdapter<DSRRequest[]>;
  storageKey?: string;
  useLocalStorage?: boolean;
  onSubmit?: (request: DSRRequest) => void;
  onUpdate?: (request: DSRRequest) => void;
  children: React.ReactNode;
}

export const DSRProvider: React.FC<DSRProviderProps> = ({
  requestTypes,
  adapter,
  storageKey,
  useLocalStorage,
  onSubmit,
  onUpdate,
  children,
}) => {
  const dsr = useDSR({ requestTypes, adapter, storageKey, useLocalStorage, onSubmit, onUpdate });
  const value = { ...dsr, requestTypes };
  return (
    <DSRCompoundContext.Provider value={value}>
      {children}
    </DSRCompoundContext.Provider>
  );
};
