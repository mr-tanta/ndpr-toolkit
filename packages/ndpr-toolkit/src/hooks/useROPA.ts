import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  ROPASummary,
} from '../types/ropa';
import {
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
  type ROPAComplianceGap,
} from '../utils/ropa';
import type { StorageAdapter } from '../adapters/types';

export interface UseROPAOptions {
  /**
   * Initial ROPA state
   */
  initialData: RecordOfProcessingActivities;

  /**
   * Pluggable storage adapter. When provided, adapter data is loaded on mount
   * and the ROPA is persisted after every mutation. Falls back to initialData
   * when no adapter data is found.
   */
  adapter?: StorageAdapter<RecordOfProcessingActivities>;

  /**
   * Callback when a record is added
   * @deprecated Renamed to `onAdd` in 4.1. The legacy name still fires
   * for backward compatibility and will be removed in 5.0.
   */
  onRecordAdd?: (record: ProcessingRecord) => void;

  /**
   * Callback when a record is updated
   * @deprecated Renamed to `onUpdate` in 4.1. The legacy name still fires
   * for backward compatibility and will be removed in 5.0.
   */
  onRecordUpdate?: (id: string, updates: Partial<ProcessingRecord>) => void;

  /**
   * Callback when a record is archived
   * @deprecated Renamed to `onArchive` in 4.1. The legacy name still fires
   * for backward compatibility and will be removed in 5.0.
   */
  onRecordArchive?: (id: string) => void;

  /**
   * Callback when a record is added (uniform 4.1+ name).
   * Takes precedence over `onRecordAdd` when both are provided.
   */
  onAdd?: (record: ProcessingRecord) => void;

  /**
   * Callback when a record is updated (uniform 4.1+ name).
   * Takes precedence over `onRecordUpdate` when both are provided.
   */
  onUpdate?: (id: string, updates: Partial<ProcessingRecord>) => void;

  /**
   * Callback when a record is archived (uniform 4.1+ name).
   * Takes precedence over `onRecordArchive` when both are provided.
   */
  onArchive?: (id: string) => void;
}

export interface UseROPAReturn {
  /**
   * Current state of the Record of Processing Activities
   */
  ropa: RecordOfProcessingActivities;

  /**
   * Add a new processing record
   */
  addRecord: (record: ProcessingRecord) => void;

  /**
   * Update an existing processing record
   */
  updateRecord: (id: string, updates: Partial<ProcessingRecord>) => void;

  /**
   * Archive a processing record by setting its status to 'archived'
   */
  archiveRecord: (id: string) => void;

  /**
   * Get a single processing record by ID
   */
  getRecord: (id: string) => ProcessingRecord | undefined;

  /**
   * Get a summary of the ROPA including statistics.
   * @deprecated Use the cached `summary` field instead — it is memoised on
   * `ropa` so consumers don't pay the recompute cost on every call.
   */
  getSummary: () => ROPASummary;

  /**
   * Export the ROPA as a CSV string.
   * @deprecated Use the cached `csv` field instead — it is memoised on
   * `ropa` so consumers don't pay the recompute cost on every call.
   */
  exportCSV: () => string;

  /**
   * Identify compliance gaps across all records.
   * @deprecated Use the cached `complianceGaps` field instead — it is
   * memoised on `ropa` so consumers don't pay the recompute cost on every call.
   */
  getComplianceGaps: () => ROPAComplianceGap[];

  /**
   * Memoised ROPA summary. Recomputed only when `ropa` changes.
   * Prefer this over `getSummary()` to avoid redundant recomputation.
   */
  summary: ROPASummary;

  /**
   * Memoised CSV export string. Recomputed only when `ropa` changes.
   * Prefer this over `exportCSV()` to avoid redundant recomputation.
   */
  csv: string;

  /**
   * Memoised compliance gap list. Recomputed only when `ropa` changes.
   * Prefer this over `getComplianceGaps()` to avoid redundant recomputation.
   */
  complianceGaps: ROPAComplianceGap[];

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

/**
 * Hook for managing a Record of Processing Activities (ROPA)
 * in compliance with NDPA 2023 requirements.
 *
 * Provides state management and utility functions for maintaining
 * a comprehensive register of all data processing activities.
 *
 * @example
 * ```tsx
 * import { useROPA } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * function ROPARegister({ initialData }) {
 *   const { ropa, addRecord, exportCSV } = useROPA({ initialData });
 *   return (
 *     <div>
 *       <p>{ropa.records.length} processing records</p>
 *       <button onClick={() => download(exportCSV())}>Export CSV</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useROPA({
  initialData,
  adapter,
  onRecordAdd,
  onRecordUpdate,
  onRecordArchive,
  onAdd,
  onUpdate,
  onArchive,
}: UseROPAOptions): UseROPAReturn {
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const [ropa, setROPA] = useState<RecordOfProcessingActivities>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fire-once dev warning for legacy callback names.
  const warnedLegacyRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || warnedLegacyRef.current) return;
    const legacyUsed: string[] = [];
    if (onRecordAdd !== undefined && onAdd === undefined) legacyUsed.push('onRecordAdd -> onAdd');
    if (onRecordUpdate !== undefined && onUpdate === undefined) legacyUsed.push('onRecordUpdate -> onUpdate');
    if (onRecordArchive !== undefined && onArchive === undefined) legacyUsed.push('onRecordArchive -> onArchive');
    if (legacyUsed.length > 0) {
      warnedLegacyRef.current = true;
      console.warn(
        `[ndpr-toolkit/useROPA] Deprecated callback option(s): ${legacyUsed.join(', ')}. Will be removed in 5.0.`
      );
    }
  }, [onRecordAdd, onRecordUpdate, onRecordArchive, onAdd, onUpdate, onArchive]);

  // When adapter is provided, load initial state on mount (falling back to initialData)
  useEffect(() => {
    if (!adapterRef.current) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (cancelled) return;
            if (loaded) setROPA(loaded);
            setIsLoading(false);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        if (result) setROPA(result);
        setIsLoading(false);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist ROPA to adapter (fire-and-forget)
  const persistROPA = useCallback((updated: RecordOfProcessingActivities) => {
    if (!adapterRef.current) return;
    Promise.resolve(adapterRef.current.save(updated)).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save ROPA:', err);
    });
  }, []);

  const addRecord = useCallback(
    (record: ProcessingRecord) => {
      setROPA((prev) => {
        const updated = {
          ...prev,
          records: [...prev.records, record],
          lastUpdated: Date.now(),
        };
        persistROPA(updated);
        return updated;
      });
      // New uniform name wins; legacy still fans out for back-compat.
      onAdd?.(record);
      onRecordAdd?.(record);
    },
    [onRecordAdd, onAdd, persistROPA]
  );

  const updateRecord = useCallback(
    (id: string, updates: Partial<ProcessingRecord>) => {
      setROPA((prev) => {
        const updated = {
          ...prev,
          records: prev.records.map((record) =>
            record.id === id
              ? { ...record, ...updates, updatedAt: Date.now() }
              : record
          ),
          lastUpdated: Date.now(),
        };
        persistROPA(updated);
        return updated;
      });
      onUpdate?.(id, updates);
      onRecordUpdate?.(id, updates);
    },
    [onRecordUpdate, onUpdate, persistROPA]
  );

  const archiveRecord = useCallback(
    (id: string) => {
      setROPA((prev) => {
        const updated = {
          ...prev,
          records: prev.records.map((record) =>
            record.id === id
              ? { ...record, status: 'archived' as const, updatedAt: Date.now() }
              : record
          ),
          lastUpdated: Date.now(),
        };
        persistROPA(updated);
        return updated;
      });
      onArchive?.(id);
      onRecordArchive?.(id);
    },
    [onRecordArchive, onArchive, persistROPA]
  );

  const getRecord = useCallback(
    (id: string): ProcessingRecord | undefined => {
      return ropa.records.find((record) => record.id === id);
    },
    [ropa.records]
  );

  // Memoised derivations — single recompute per `ropa` change rather than
  // one per call site. The callable wrappers below are kept for backward
  // compatibility but return the same cached values.
  const summary = useMemo<ROPASummary>(() => generateROPASummary(ropa), [ropa]);
  const csv = useMemo<string>(() => exportROPAToCSV(ropa), [ropa]);
  const complianceGaps = useMemo<ROPAComplianceGap[]>(
    () => identifyComplianceGaps(ropa),
    [ropa]
  );

  const getSummary = useCallback((): ROPASummary => summary, [summary]);
  const exportCSV = useCallback((): string => csv, [csv]);
  const getComplianceGaps = useCallback(
    (): ROPAComplianceGap[] => complianceGaps,
    [complianceGaps]
  );

  return {
    ropa,
    addRecord,
    updateRecord,
    archiveRecord,
    getRecord,
    getSummary,
    exportCSV,
    getComplianceGaps,
    summary,
    csv,
    complianceGaps,
    isLoading,
  };
}
