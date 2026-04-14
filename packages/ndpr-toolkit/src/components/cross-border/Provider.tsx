import React from 'react';
import { useCrossBorderTransfer } from '../../hooks/useCrossBorderTransfer';
import { CrossBorderCompoundContext } from './context';
import type { CrossBorderTransfer } from '../../types/cross-border';
import type { StorageAdapter } from '../../adapters/types';

export interface CrossBorderProviderProps {
  adapter?: StorageAdapter<CrossBorderTransfer[]>;
  storageKey?: string;
  useLocalStorage?: boolean;
  initialTransfers?: CrossBorderTransfer[];
  onAdd?: (transfer: CrossBorderTransfer) => void;
  onUpdate?: (transfer: CrossBorderTransfer) => void;
  onRemove?: (id: string) => void;
  children: React.ReactNode;
}

export const CrossBorderProvider: React.FC<CrossBorderProviderProps> = ({
  adapter,
  storageKey,
  useLocalStorage,
  initialTransfers,
  onAdd,
  onUpdate,
  onRemove,
  children,
}) => {
  const crossBorder = useCrossBorderTransfer({
    adapter,
    storageKey,
    useLocalStorage,
    initialTransfers,
    onAdd,
    onUpdate,
    onRemove,
  });
  return (
    <CrossBorderCompoundContext.Provider value={crossBorder}>
      {children}
    </CrossBorderCompoundContext.Provider>
  );
};
