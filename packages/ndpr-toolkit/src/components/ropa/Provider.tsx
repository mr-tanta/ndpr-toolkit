import React from 'react';
import { useROPA } from '../../hooks/useROPA';
import { ROPACompoundContext } from './context';
import type { ProcessingRecord, RecordOfProcessingActivities } from '../../types/ropa';
import type { StorageAdapter } from '../../adapters/types';

export interface ROPAProviderProps {
  initialData: RecordOfProcessingActivities;
  adapter?: StorageAdapter<RecordOfProcessingActivities>;
  onRecordAdd?: (record: ProcessingRecord) => void;
  onRecordUpdate?: (id: string, updates: Partial<ProcessingRecord>) => void;
  onRecordArchive?: (id: string) => void;
  children: React.ReactNode;
}

export const ROPAProvider: React.FC<ROPAProviderProps> = ({
  initialData,
  adapter,
  onRecordAdd,
  onRecordUpdate,
  onRecordArchive,
  children,
}) => {
  const ropa = useROPA({
    initialData,
    adapter,
    onRecordAdd,
    onRecordUpdate,
    onRecordArchive,
  });
  return (
    <ROPACompoundContext.Provider value={ropa}>
      {children}
    </ROPACompoundContext.Provider>
  );
};
