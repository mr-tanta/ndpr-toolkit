import React, { useState, useEffect } from 'react';
import { ROPAManager } from '../components/ropa/ROPAManager';
import type { ROPAManagerClassNames } from '../components/ropa/ROPAManager';
import type { RecordOfProcessingActivities, ProcessingRecord } from '../types/ropa';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_ROPA: RecordOfProcessingActivities = {
  id: 'ndpr-ropa-default',
  organizationName: 'Your Organisation',
  organizationContact: '',
  organizationAddress: '',
  records: [],
  lastUpdated: Date.now(),
  version: '1.0',
};

export interface NDPRROPAProps {
  initialData?: RecordOfProcessingActivities;
  adapter?: StorageAdapter<RecordOfProcessingActivities>;
  classNames?: ROPAManagerClassNames;
  unstyled?: boolean;
}

export const NDPRROPA: React.FC<NDPRROPAProps> = ({
  initialData,
  adapter,
  classNames,
  unstyled,
}) => {
  const [ropa, setRopa] = useState<RecordOfProcessingActivities>(initialData ?? DEFAULT_ROPA);

  useEffect(() => {
    if (!adapter) return;
    let cancelled = false;
    const doLoad = async () => {
      const saved = await adapter.load();
      if (!cancelled && saved) setRopa(saved);
    };
    doLoad();
    return () => { cancelled = true; };
  }, [adapter]);

  const persist = (updated: RecordOfProcessingActivities) => {
    if (adapter) adapter.save(updated);
  };

  const handleAddRecord = (record: ProcessingRecord) => {
    const updated: RecordOfProcessingActivities = {
      ...ropa,
      records: [...ropa.records, record],
      lastUpdated: Date.now(),
    };
    setRopa(updated);
    persist(updated);
  };

  const handleUpdateRecord = (id: string, updates: Partial<ProcessingRecord>) => {
    const updated: RecordOfProcessingActivities = {
      ...ropa,
      records: ropa.records.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
      ),
      lastUpdated: Date.now(),
    };
    setRopa(updated);
    persist(updated);
  };

  const handleArchiveRecord = (id: string) => {
    const updated: RecordOfProcessingActivities = {
      ...ropa,
      records: ropa.records.map(r =>
        r.id === id ? { ...r, status: 'archived' as const, updatedAt: Date.now() } : r
      ),
      lastUpdated: Date.now(),
    };
    setRopa(updated);
    persist(updated);
  };

  return (
    <ROPAManager
      ropa={ropa}
      onAddRecord={handleAddRecord}
      onUpdateRecord={handleUpdateRecord}
      onArchiveRecord={handleArchiveRecord}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
