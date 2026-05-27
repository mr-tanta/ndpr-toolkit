import React from 'react';
import { useROPA } from '../../hooks/useROPA';
import { ROPACompoundContext } from './context';
import type { ProcessingRecord, RecordOfProcessingActivities } from '../../types/ropa';
import type { StorageAdapter } from '../../adapters/types';

export interface ROPAProviderProps {
  initialData: RecordOfProcessingActivities;
  adapter?: StorageAdapter<RecordOfProcessingActivities>;
  onAdd?: (record: ProcessingRecord) => void;
  onUpdate?: (id: string, updates: Partial<ProcessingRecord>) => void;
  onArchive?: (id: string) => void;
  children: React.ReactNode;
}

export const ROPAProvider: React.FC<ROPAProviderProps> = ({
  initialData,
  adapter,
  onAdd,
  onUpdate,
  onArchive,
  children,
}) => {
  const ropa = useROPA({
    initialData,
    adapter,
    onAdd,
    onUpdate,
    onArchive,
  });
  return (
    <ROPACompoundContext.Provider value={ropa}>
      {children}
    </ROPACompoundContext.Provider>
  );
};
