import React from 'react';
import { useLawfulBasis } from '../../hooks/useLawfulBasis';
import { LawfulBasisCompoundContext } from './context';
import type { ProcessingActivity } from '../../types/lawful-basis';
import type { StorageAdapter } from '../../adapters/types';

export interface LawfulBasisProviderProps {
  adapter?: StorageAdapter<ProcessingActivity[]>;
  storageKey?: string;
  useLocalStorage?: boolean;
  initialActivities?: ProcessingActivity[];
  onAdd?: (activity: ProcessingActivity) => void;
  onUpdate?: (activity: ProcessingActivity) => void;
  onRemove?: (id: string) => void;
  children: React.ReactNode;
}

export const LawfulBasisProvider: React.FC<LawfulBasisProviderProps> = ({
  adapter,
  storageKey,
  useLocalStorage,
  initialActivities,
  onAdd,
  onUpdate,
  onRemove,
  children,
}) => {
  const lawfulBasis = useLawfulBasis({
    adapter,
    storageKey,
    useLocalStorage,
    initialActivities,
    onAdd,
    onUpdate,
    onRemove,
  });
  return (
    <LawfulBasisCompoundContext.Provider value={lawfulBasis}>
      {children}
    </LawfulBasisCompoundContext.Provider>
  );
};
