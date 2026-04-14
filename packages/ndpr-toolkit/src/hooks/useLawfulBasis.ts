import { useState, useEffect, useCallback, useRef } from 'react';
import { ProcessingActivity, LawfulBasisSummary } from '../types/lawful-basis';
import {
  validateProcessingActivity,
  generateLawfulBasisSummary,
  LawfulBasisValidationResult,
} from '../utils/lawful-basis';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

function resolveAdapter(storageKey: string, useLocalStorage: boolean): StorageAdapter<ProcessingActivity[]> {
  if (!useLocalStorage) {
    return { load: () => null, save: () => {}, remove: () => {} };
  }
  return localStorageAdapter<ProcessingActivity[]>(storageKey);
}

interface UseLawfulBasisOptions {
  /**
   * Initial processing activities to load
   */
  initialActivities?: ProcessingActivity[];

  /**
   * Pluggable storage adapter. When provided, takes precedence over storageKey/useLocalStorage.
   */
  adapter?: StorageAdapter<ProcessingActivity[]>;

  /**
   * Storage key for persisting activities
   * @default "ndpr_lawful_basis_activities"
   * @deprecated Use adapter instead
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist activities
   * @default true
   * @deprecated Use adapter instead
   */
  useLocalStorage?: boolean;

  /**
   * Callback when an activity is added
   */
  onAdd?: (activity: ProcessingActivity) => void;

  /**
   * Callback when an activity is updated
   */
  onUpdate?: (activity: ProcessingActivity) => void;

  /**
   * Callback when an activity is removed
   */
  onRemove?: (id: string) => void;
}

export interface UseLawfulBasisReturn {
  /**
   * All processing activities
   */
  activities: ProcessingActivity[];

  /**
   * Add a new processing activity
   */
  addActivity: (activity: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>) => ProcessingActivity;

  /**
   * Update an existing processing activity
   */
  updateActivity: (id: string, updates: Partial<ProcessingActivity>) => ProcessingActivity | null;

  /**
   * Remove a processing activity
   */
  removeActivity: (id: string) => void;

  /**
   * Get a specific processing activity by ID
   */
  getActivity: (id: string) => ProcessingActivity | null;

  /**
   * Get a summary of all lawful basis documentation
   */
  getSummary: () => LawfulBasisSummary;

  /**
   * Validate a processing activity
   */
  validateActivity: (activity: ProcessingActivity) => LawfulBasisValidationResult;

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

/**
 * Hook for managing lawful basis documentation for processing activities
 * in compliance with NDPA 2023 Section 25.
 */
export function useLawfulBasis({
  initialActivities = [],
  adapter,
  storageKey = 'ndpr_lawful_basis_activities',
  useLocalStorage = true,
  onAdd,
  onUpdate,
  onRemove,
}: UseLawfulBasisOptions = {}): UseLawfulBasisReturn {
  const resolvedAdapter = adapter ?? resolveAdapter(storageKey, useLocalStorage);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [activities, setActivities] = useState<ProcessingActivity[]>(initialActivities);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load activities from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (cancelled) return;
            if (loaded) setActivities(loaded);
            setIsLoading(false);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        if (result) setActivities(result);
        setIsLoading(false);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist activities to adapter (fire-and-forget)
  const persistActivities = useCallback((updated: ProcessingActivity[]) => {
    Promise.resolve(adapterRef.current.save(updated)).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save lawful basis activities:', err);
    });
  }, []);

  // Generate a unique ID
  const generateId = (): string => {
    return 'lb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  };

  // Add a new processing activity
  const addActivity = useCallback(
    (activityData: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>): ProcessingActivity => {
      const now = Date.now();
      const newActivity: ProcessingActivity = {
        ...activityData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };

      setActivities(prev => {
        const updated = [...prev, newActivity];
        persistActivities(updated);
        return updated;
      });

      if (onAdd) {
        onAdd(newActivity);
      }

      return newActivity;
    },
    [onAdd, persistActivities]
  );

  // Update an existing processing activity
  const updateActivity = useCallback(
    (id: string, updates: Partial<ProcessingActivity>): ProcessingActivity | null => {
      let updatedActivity: ProcessingActivity | null = null;

      setActivities(prev => {
        const index = prev.findIndex(a => a.id === id);
        if (index === -1) {
          return prev;
        }

        updatedActivity = {
          ...prev[index],
          ...updates,
          id: prev[index].id, // preserve original ID
          updatedAt: Date.now(),
        };

        const next = [...prev];
        next[index] = updatedActivity as ProcessingActivity;
        persistActivities(next);
        return next;
      });

      if (updatedActivity && onUpdate) {
        onUpdate(updatedActivity);
      }

      return updatedActivity;
    },
    [onUpdate, persistActivities]
  );

  // Remove a processing activity
  const removeActivity = useCallback(
    (id: string): void => {
      setActivities(prev => {
        const updated = prev.filter(a => a.id !== id);
        persistActivities(updated);
        return updated;
      });

      if (onRemove) {
        onRemove(id);
      }
    },
    [onRemove, persistActivities]
  );

  // Get a specific processing activity by ID
  const getActivity = useCallback(
    (id: string): ProcessingActivity | null => {
      return activities.find(a => a.id === id) || null;
    },
    [activities]
  );

  // Get a summary of all lawful basis documentation
  const getSummary = useCallback((): LawfulBasisSummary => {
    return generateLawfulBasisSummary(activities);
  }, [activities]);

  // Validate a processing activity
  const validateActivity = useCallback(
    (activity: ProcessingActivity): LawfulBasisValidationResult => {
      return validateProcessingActivity(activity);
    },
    []
  );

  return {
    activities,
    addActivity,
    updateActivity,
    removeActivity,
    getActivity,
    getSummary,
    validateActivity,
    isLoading,
  };
}
