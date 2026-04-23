import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CrossBorderTransfer,
  CrossBorderSummary,
  TransferMechanism,
  AdequacyStatus,
} from '../types/cross-border';
import {
  validateTransfer as validateTransferUtil,
  TransferValidationResult,
} from '../utils/cross-border';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

function resolveAdapter(storageKey: string, useLocalStorage: boolean): StorageAdapter<CrossBorderTransfer[]> {
  if (!useLocalStorage) {
    return { load: () => null, save: () => {}, remove: () => {} };
  }
  return localStorageAdapter<CrossBorderTransfer[]>(storageKey);
}

interface UseCrossBorderTransferOptions {
  /**
   * Initial transfers to load
   */
  initialTransfers?: CrossBorderTransfer[];

  /**
   * Pluggable storage adapter. When provided, takes precedence over storageKey/useLocalStorage.
   */
  adapter?: StorageAdapter<CrossBorderTransfer[]>;

  /**
   * Storage key for transfer data
   * @default "ndpr_cross_border_transfers"
   * @deprecated Use adapter instead
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist transfers
   * @default true
   * @deprecated Use adapter instead
   */
  useLocalStorage?: boolean;

  /**
   * Callback function called when a transfer is added
   */
  onAdd?: (transfer: CrossBorderTransfer) => void;

  /**
   * Callback function called when a transfer is updated
   */
  onUpdate?: (transfer: CrossBorderTransfer) => void;

  /**
   * Callback function called when a transfer is removed
   */
  onRemove?: (id: string) => void;
}

export interface UseCrossBorderTransferReturn {
  /**
   * All cross-border transfers
   */
  transfers: CrossBorderTransfer[];

  /**
   * Add a new cross-border transfer
   */
  addTransfer: (
    transfer: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'>
  ) => CrossBorderTransfer;

  /**
   * Update an existing cross-border transfer
   */
  updateTransfer: (
    id: string,
    updates: Partial<CrossBorderTransfer>
  ) => CrossBorderTransfer | null;

  /**
   * Remove a cross-border transfer
   */
  removeTransfer: (id: string) => void;

  /**
   * Get a cross-border transfer by ID
   */
  getTransfer: (id: string) => CrossBorderTransfer | null;

  /**
   * Get a compliance summary of all cross-border transfers
   */
  getSummary: () => CrossBorderSummary;

  /**
   * Validate a cross-border transfer
   */
  validateTransfer: (transfer: CrossBorderTransfer) => TransferValidationResult;

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

/**
 * Hook for managing cross-border data transfers in compliance with NDPA Part VI (Sections 41-45)
 */
export function useCrossBorderTransfer({
  initialTransfers = [],
  adapter,
  storageKey = 'ndpr_cross_border_transfers',
  useLocalStorage = true,
  onAdd,
  onUpdate,
  onRemove,
}: UseCrossBorderTransferOptions = {}): UseCrossBorderTransferReturn {
  const resolvedAdapter = adapter ?? resolveAdapter(storageKey, useLocalStorage);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [transfers, setTransfers] = useState<CrossBorderTransfer[]>(initialTransfers);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load transfers from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (cancelled) return;
            if (loaded) setTransfers(loaded);
            setIsLoading(false);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        if (result) setTransfers(result);
        setIsLoading(false);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist transfers to adapter (fire-and-forget)
  const persistTransfers = useCallback((updated: CrossBorderTransfer[]) => {
    Promise.resolve(adapterRef.current.save(updated)).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save cross-border transfers:', err);
    });
  }, []);

  // Generate a unique ID
  const generateId = (): string => {
    return 'cbt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  };

  // Add a new transfer
  const addTransfer = useCallback(
    (
      transferData: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'>
    ): CrossBorderTransfer => {
      const now = Date.now();
      const newTransfer: CrossBorderTransfer = {
        ...transferData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };

      setTransfers((prev) => {
        const updated = [...prev, newTransfer];
        persistTransfers(updated);
        return updated;
      });

      if (onAdd) {
        onAdd(newTransfer);
      }

      return newTransfer;
    },
    [onAdd, persistTransfers]
  );

  // Update an existing transfer
  const updateTransfer = useCallback(
    (id: string, updates: Partial<CrossBorderTransfer>): CrossBorderTransfer | null => {
      let updatedTransfer: CrossBorderTransfer | null = null;

      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index === -1) {
          return prev;
        }

        updatedTransfer = {
          ...prev[index],
          ...updates,
          updatedAt: Date.now(),
        };

        const newTransfers = [...prev];
        newTransfers[index] = updatedTransfer as CrossBorderTransfer;
        persistTransfers(newTransfers);
        return newTransfers;
      });

      if (updatedTransfer && onUpdate) {
        onUpdate(updatedTransfer);
      }

      return updatedTransfer;
    },
    [onUpdate, persistTransfers]
  );

  // Remove a transfer
  const removeTransfer = useCallback(
    (id: string): void => {
      let found = false;

      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index === -1) {
          return prev;
        }
        found = true;
        const updated = prev.filter((t) => t.id !== id);
        persistTransfers(updated);
        return updated;
      });

      if (found && onRemove) {
        onRemove(id);
      }
    },
    [onRemove, persistTransfers]
  );

  // Get a transfer by ID
  const getTransfer = useCallback(
    (id: string): CrossBorderTransfer | null => {
      return transfers.find((t) => t.id === id) || null;
    },
    [transfers]
  );

  // Get compliance summary
  const getSummary = useCallback((): CrossBorderSummary => {
    const now = Date.now();
    const activeTransfers = transfers.filter((t) => t.status === 'active');

    // Breakdown by mechanism
    const allMechanisms: TransferMechanism[] = [
      'adequacy_decision',
      'standard_clauses',
      'binding_corporate_rules',
      'ndpc_authorization',
      'explicit_consent',
      'contract_performance',
      'public_interest',
      'legal_claims',
      'vital_interests',
    ];
    const byMechanism = {} as Record<TransferMechanism, number>;
    for (const mechanism of allMechanisms) {
      byMechanism[mechanism] = activeTransfers.filter(
        (t) => t.transferMechanism === mechanism
      ).length;
    }

    // Breakdown by adequacy
    const allStatuses: AdequacyStatus[] = ['adequate', 'inadequate', 'pending_review', 'unknown'];
    const byAdequacy = {} as Record<AdequacyStatus, number>;
    for (const status of allStatuses) {
      byAdequacy[status] = activeTransfers.filter(
        (t) => t.adequacyStatus === status
      ).length;
    }

    // Transfers pending NDPC approval
    const pendingApproval = transfers.filter(
      (t) => t.status === 'pending_approval' || (t.ndpcApproval?.required && !t.ndpcApproval?.approved)
    );

    // Transfers due for review (within the next 30 days or overdue)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const dueForReview = transfers.filter(
      (t) => t.reviewDate && t.reviewDate <= now + thirtyDaysMs && t.status === 'active'
    );

    // Transfers missing TIA
    const missingTIA = transfers.filter(
      (t) => !t.tiaCompleted && t.status === 'active'
    );

    // High-risk transfers
    const highRiskTransfers = transfers.filter(
      (t) => t.riskLevel === 'high' && t.status === 'active'
    );

    return {
      totalActiveTransfers: activeTransfers.length,
      byMechanism,
      byAdequacy,
      pendingApproval,
      dueForReview,
      missingTIA,
      highRiskTransfers,
      lastUpdated: now,
    };
  }, [transfers]);

  // Validate a transfer (wrapper around utility)
  const validateTransfer = useCallback(
    (transfer: CrossBorderTransfer): TransferValidationResult => {
      return validateTransferUtil(transfer);
    },
    []
  );

  return {
    transfers,
    addTransfer,
    updateTransfer,
    removeTransfer,
    getTransfer,
    getSummary,
    validateTransfer,
    isLoading,
  };
}
