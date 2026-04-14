import React, { useState } from 'react';
import { CrossBorderTransferManager } from '../components/cross-border/CrossBorderTransferManager';
import type { CrossBorderTransferManagerClassNames } from '../components/cross-border/CrossBorderTransferManager';
import type { CrossBorderTransfer } from '../types/cross-border';
import type { StorageAdapter } from '../adapters/types';

export interface NDPRCrossBorderProps {
  initialTransfers?: CrossBorderTransfer[];
  adapter?: StorageAdapter<CrossBorderTransfer[]>;
  classNames?: CrossBorderTransferManagerClassNames;
  unstyled?: boolean;
}

export const NDPRCrossBorder: React.FC<NDPRCrossBorderProps> = ({
  initialTransfers = [],
  adapter,
  classNames,
  unstyled,
}) => {
  const [transfers, setTransfers] = useState<CrossBorderTransfer[]>(() => {
    if (adapter) {
      const saved = adapter.load();
      if (saved && !(saved instanceof Promise)) return saved;
    }
    return initialTransfers;
  });

  const persist = (updated: CrossBorderTransfer[]) => {
    if (adapter) adapter.save(updated);
  };

  const handleAddTransfer = (
    transferData: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = Date.now();
    const newTransfer: CrossBorderTransfer = {
      ...transferData,
      id: `transfer-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...transfers, newTransfer];
    setTransfers(updated);
    persist(updated);
  };

  const handleUpdateTransfer = (id: string, updates: Partial<CrossBorderTransfer>) => {
    const updated = transfers.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    setTransfers(updated);
    persist(updated);
  };

  const handleRemoveTransfer = (id: string) => {
    const updated = transfers.filter(t => t.id !== id);
    setTransfers(updated);
    persist(updated);
  };

  return (
    <CrossBorderTransferManager
      transfers={transfers}
      onAddTransfer={handleAddTransfer}
      onUpdateTransfer={handleUpdateTransfer}
      onRemoveTransfer={handleRemoveTransfer}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
