import { useState, useCallback, useEffect, useRef } from 'react';
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
   */
  onRecordAdd?: (record: ProcessingRecord) => void;

  /**
   * Callback when a record is updated
   */
  onRecordUpdate?: (id: string, updates: Partial<ProcessingRecord>) => void;

  /**
   * Callback when a record is archived
   */
  onRecordArchive?: (id: string) => void;
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
   * Get a summary of the ROPA including statistics
   */
  getSummary: () => ROPASummary;

  /**
   * Export the ROPA as a CSV string
   */
  exportCSV: () => string;

  /**
   * Identify compliance gaps across all records
   */
  getComplianceGaps: () => ROPAComplianceGap[];

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
 */
export function useROPA({
  initialData,
  adapter,
  onRecordAdd,
  onRecordUpdate,
  onRecordArchive,
}: UseROPAOptions): UseROPAReturn {
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const [ropa, setROPA] = useState<RecordOfProcessingActivities>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(adapter !== undefined);

  // When adapter is provided, load initial state on mount (falling back to initialData)
  useEffect(() => {
    if (!adapterRef.current) return;

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
      onRecordAdd?.(record);
    },
    [onRecordAdd, persistROPA]
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
      onRecordUpdate?.(id, updates);
    },
    [onRecordUpdate, persistROPA]
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
      onRecordArchive?.(id);
    },
    [onRecordArchive, persistROPA]
  );

  const getRecord = useCallback(
    (id: string): ProcessingRecord | undefined => {
      return ropa.records.find((record) => record.id === id);
    },
    [ropa.records]
  );

  const getSummary = useCallback((): ROPASummary => {
    return generateROPASummary(ropa);
  }, [ropa]);

  const exportCSV = useCallback((): string => {
    return exportROPAToCSV(ropa);
  }, [ropa]);

  const getComplianceGaps = useCallback((): ROPAComplianceGap[] => {
    return identifyComplianceGaps(ropa);
  }, [ropa]);

  return {
    ropa,
    addRecord,
    updateRecord,
    archiveRecord,
    getRecord,
    getSummary,
    exportCSV,
    getComplianceGaps,
    isLoading,
  };
}
