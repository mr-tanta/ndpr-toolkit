import { useState, useEffect, useCallback } from 'react';
import { ProcessingActivity, LawfulBasisSummary } from '../types/lawful-basis';
import {
  validateProcessingActivity,
  generateLawfulBasisSummary,
  ValidationResult,
} from '../utils/lawful-basis';

interface UseLawfulBasisOptions {
  /**
   * Initial processing activities to load
   */
  initialActivities?: ProcessingActivity[];

  /**
   * Storage key for persisting activities
   * @default "ndpr_lawful_basis_activities"
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist activities
   * @default true
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

interface UseLawfulBasisReturn {
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
  validateActivity: (activity: ProcessingActivity) => ValidationResult;
}

/**
 * Hook for managing lawful basis documentation for processing activities
 * in compliance with NDPA 2023 Section 25.
 */
export function useLawfulBasis({
  initialActivities = [],
  storageKey = 'ndpr_lawful_basis_activities',
  useLocalStorage = true,
  onAdd,
  onUpdate,
  onRemove,
}: UseLawfulBasisOptions = {}): UseLawfulBasisReturn {
  const [activities, setActivities] = useState<ProcessingActivity[]>(initialActivities);

  // Load activities from local storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setActivities(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading lawful basis activities:', error);
      }
    }
  }, [storageKey, useLocalStorage]);

  // Persist activities to local storage when they change
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined' && activities.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving lawful basis activities:', error);
      }
    }
  }, [activities, storageKey, useLocalStorage]);

  // Generate a unique ID
  const generateId = (): string => {
    return 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

      setActivities(prev => [...prev, newActivity]);

      if (onAdd) {
        onAdd(newActivity);
      }

      return newActivity;
    },
    [onAdd]
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
        return next;
      });

      if (updatedActivity && onUpdate) {
        onUpdate(updatedActivity);
      }

      return updatedActivity;
    },
    [onUpdate]
  );

  // Remove a processing activity
  const removeActivity = useCallback(
    (id: string): void => {
      setActivities(prev => prev.filter(a => a.id !== id));

      if (onRemove) {
        onRemove(id);
      }
    },
    [onRemove]
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
    (activity: ProcessingActivity): ValidationResult => {
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
  };
}
