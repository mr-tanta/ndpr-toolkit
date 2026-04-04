import { useState, useEffect, useCallback } from 'react';
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

interface UseCrossBorderTransferOptions {
  /**
   * Initial transfers to load
   */
  initialTransfers?: CrossBorderTransfer[];

  /**
   * Storage key for transfer data
   * @default "ndpr_cross_border_transfers"
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist transfers
   * @default true
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

interface UseCrossBorderTransferReturn {
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
  removeTransfer: (id: string) => boolean;

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
}

/**
 * Hook for managing cross-border data transfers in compliance with NDPA Part VI (Sections 41-45)
 */
export function useCrossBorderTransfer({
  initialTransfers = [],
  storageKey = 'ndpr_cross_border_transfers',
  useLocalStorage = true,
  onAdd,
  onUpdate,
  onRemove,
}: UseCrossBorderTransferOptions = {}): UseCrossBorderTransferReturn {
  const [transfers, setTransfers] = useState<CrossBorderTransfer[]>(initialTransfers);

  // Load transfers from storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          setTransfers(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading cross-border transfers:', error);
      }
    }
  }, [storageKey, useLocalStorage]);

  // Save transfers to storage when they change
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(transfers));
      } catch (error) {
        console.error('Error saving cross-border transfers:', error);
      }
    }
  }, [transfers, storageKey, useLocalStorage]);

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

      setTransfers((prev) => [...prev, newTransfer]);

      if (onAdd) {
        onAdd(newTransfer);
      }

      return newTransfer;
    },
    [onAdd]
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
        return newTransfers;
      });

      if (updatedTransfer && onUpdate) {
        onUpdate(updatedTransfer);
      }

      return updatedTransfer;
    },
    [onUpdate]
  );

  // Remove a transfer
  const removeTransfer = useCallback(
    (id: string): boolean => {
      let found = false;

      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index === -1) {
          return prev;
        }
        found = true;
        return prev.filter((t) => t.id !== id);
      });

      if (found && onRemove) {
        onRemove(id);
      }

      return found;
    },
    [onRemove]
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
  };
}
