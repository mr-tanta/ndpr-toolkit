import { useState, useCallback, useMemo } from 'react';
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

export interface UseROPAOptions {
  /**
   * Initial ROPA state
   */
  initialData: RecordOfProcessingActivities;

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
  onRecordAdd,
  onRecordUpdate,
  onRecordArchive,
}: UseROPAOptions): UseROPAReturn {
  const [ropa, setROPA] = useState<RecordOfProcessingActivities>(initialData);

  const addRecord = useCallback(
    (record: ProcessingRecord) => {
      setROPA((prev) => ({
        ...prev,
        records: [...prev.records, record],
        lastUpdated: Date.now(),
      }));
      onRecordAdd?.(record);
    },
    [onRecordAdd]
  );

  const updateRecord = useCallback(
    (id: string, updates: Partial<ProcessingRecord>) => {
      setROPA((prev) => ({
        ...prev,
        records: prev.records.map((record) =>
          record.id === id
            ? { ...record, ...updates, updatedAt: Date.now() }
            : record
        ),
        lastUpdated: Date.now(),
      }));
      onRecordUpdate?.(id, updates);
    },
    [onRecordUpdate]
  );

  const archiveRecord = useCallback(
    (id: string) => {
      setROPA((prev) => ({
        ...prev,
        records: prev.records.map((record) =>
          record.id === id
            ? { ...record, status: 'archived' as const, updatedAt: Date.now() }
            : record
        ),
        lastUpdated: Date.now(),
      }));
      onRecordArchive?.(id);
    },
    [onRecordArchive]
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
  };
}
