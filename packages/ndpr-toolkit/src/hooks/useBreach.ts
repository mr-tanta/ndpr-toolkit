import { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from '../types/breach';
import { calculateBreachSeverity } from '../utils/breach';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

type BreachCompositeState = {
  reports: BreachReport[];
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
};

type BreachAction =
  | { type: 'LOAD'; payload: BreachCompositeState }
  | { type: 'ADD_REPORT'; payload: BreachReport }
  | { type: 'UPDATE_REPORT'; payload: { index: number; report: BreachReport } }
  | { type: 'SET_ASSESSMENT'; payload: { existing: boolean; id?: string; assessment: RiskAssessment } }
  | { type: 'SET_NOTIFICATION'; payload: { existing: boolean; id?: string; notification: RegulatoryNotification } }
  | { type: 'CLEAR' };

function breachReducer(state: BreachCompositeState, action: BreachAction): BreachCompositeState {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'UPDATE_REPORT': {
      const nextReports = [...state.reports];
      nextReports[action.payload.index] = action.payload.report;
      return { ...state, reports: nextReports };
    }
    case 'SET_ASSESSMENT': {
      const { existing, id, assessment } = action.payload;
      const nextAssessments = existing
        ? state.assessments.map(a => a.id === id ? assessment : a)
        : [...state.assessments, assessment];
      return { ...state, assessments: nextAssessments };
    }
    case 'SET_NOTIFICATION': {
      const { existing, id, notification } = action.payload;
      const nextNotifications = existing
        ? state.notifications.map(n => n.id === id ? notification : n)
        : [...state.notifications, notification];
      return { ...state, notifications: nextNotifications };
    }
    case 'CLEAR':
      return { reports: [], assessments: [], notifications: [] };
  }
}

interface UseBreachOptions {
  /**
   * Available breach categories
   */
  categories: BreachCategory[];

  /**
   * Initial breach reports
   */
  initialReports?: BreachReport[];

  /**
   * Pluggable storage adapter. When provided, takes precedence over storageKey/useLocalStorage.
   */
  adapter?: StorageAdapter<BreachCompositeState>;

  /**
   * Storage key for breach data
   * @default "ndpr_breach_data"
   * @deprecated Use adapter instead
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist breach data
   * @default true
   * @deprecated Use adapter instead
   */
  useLocalStorage?: boolean;

  /**
   * Callback function called when a breach is reported
   */
  onReport?: (report: BreachReport) => void;

  /**
   * Callback function called when a risk assessment is completed
   */
  onAssessment?: (assessment: RiskAssessment) => void;

  /**
   * Callback function called when a notification is sent
   */
  onNotification?: (notification: RegulatoryNotification) => void;
}

function resolveAdapter(storageKey: string, useLocalStorage: boolean): StorageAdapter<BreachCompositeState> {
  if (!useLocalStorage) {
    return { load: () => null, save: () => {}, remove: () => {} };
  }
  return localStorageAdapter<BreachCompositeState>(storageKey);
}

export interface UseBreachReturn {
  /**
   * All breach reports
   */
  reports: BreachReport[];
  
  /**
   * All risk assessments
   */
  assessments: RiskAssessment[];
  
  /**
   * All regulatory notifications
   */
  notifications: RegulatoryNotification[];
  
  /**
   * Submit a new breach report
   */
  reportBreach: (reportData: Omit<BreachReport, 'id' | 'reportedAt'>) => BreachReport;
  
  /**
   * Update an existing breach report
   */
  updateReport: (id: string, updates: Partial<BreachReport>) => BreachReport | null;
  
  /**
   * Get a breach report by ID
   */
  getReport: (id: string) => BreachReport | null;
  
  /**
   * Conduct a risk assessment for a breach
   */
  assessRisk: (breachId: string, assessmentData: Omit<RiskAssessment, 'id' | 'breachId' | 'assessedAt'>) => RiskAssessment;
  
  /**
   * Get a risk assessment for a breach
   */
  getAssessment: (breachId: string) => RiskAssessment | null;
  
  /**
   * Calculate notification requirements based on a risk assessment
   */
  calculateNotificationRequirements: (breachId: string) => NotificationRequirement | null;
  
  /**
   * Send a regulatory notification
   */
  sendNotification: (breachId: string, notificationData: Omit<RegulatoryNotification, 'id' | 'breachId' | 'sentAt'>) => RegulatoryNotification;
  
  /**
   * Get a regulatory notification for a breach
   */
  getNotification: (breachId: string) => RegulatoryNotification | null;
  
  /**
   * Get breaches that require notification within the next X hours
   */
  getBreachesRequiringNotification: (hoursThreshold?: number) => Array<{
    report: BreachReport;
    assessment: RiskAssessment;
    requirements: NotificationRequirement;
    hoursRemaining: number;
  }>;
  
  /**
   * Clear all breach data
   */
  clearBreachData: () => void;

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

/**
 * Hook for managing data breach notifications in compliance with the NDPA (Section 40)
 */
export function useBreach({
  categories,
  initialReports = [],
  adapter,
  storageKey = 'ndpr_breach_data',
  useLocalStorage = true,
  onReport,
  onAssessment,
  onNotification,
}: UseBreachOptions): UseBreachReturn {
  const resolvedAdapter = adapter ?? resolveAdapter(storageKey, useLocalStorage);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [state, dispatch] = useReducer(breachReducer, {
    reports: initialReports,
    assessments: [],
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep a ref to the latest state so callbacks always read current values
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist composite state to adapter
  const persistState = useCallback((nextState: BreachCompositeState) => {
    Promise.resolve(
      adapterRef.current.save(nextState)
    ).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save breach data:', err);
    });
  }, []);

  // Load breach data from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      const applyLoaded = (loaded: BreachCompositeState | null) => {
        if (loaded) {
          dispatch({
            type: 'LOAD',
            payload: {
              reports: loaded.reports ?? [],
              assessments: loaded.assessments ?? [],
              notifications: loaded.notifications ?? [],
            },
          });
        }
        setIsLoading(false);
      };

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (!cancelled) applyLoaded(loaded);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        applyLoaded(result);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  // Generate a unique ID
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Submit a new breach report
  const reportBreach = useCallback((reportData: Omit<BreachReport, 'id' | 'reportedAt'>): BreachReport => {
    const newReport: BreachReport = {
      id: generateId('breach'),
      reportedAt: Date.now(),
      ...reportData,
    };

    dispatch({ type: 'ADD_REPORT', payload: newReport });

    // Compute next state from ref for persistence
    const current = stateRef.current;
    const nextState = { ...current, reports: [...current.reports, newReport] };
    persistState(nextState);

    if (onReport) {
      onReport(newReport);
    }

    return newReport;
  }, [generateId, onReport, persistState]);

  // Update an existing breach report
  const updateReport = useCallback((id: string, updates: Partial<BreachReport>): BreachReport | null => {
    const current = stateRef.current;
    const index = current.reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updatedReport: BreachReport = { ...current.reports[index], ...updates };
    dispatch({ type: 'UPDATE_REPORT', payload: { index, report: updatedReport } });

    const nextReports = [...current.reports];
    nextReports[index] = updatedReport;
    persistState({ ...current, reports: nextReports });

    return updatedReport;
  }, [persistState]);

  // Get a breach report by ID
  const getReport = useCallback((id: string): BreachReport | null => {
    return stateRef.current.reports.find(report => report.id === id) || null;
  }, []);

  // Conduct a risk assessment for a breach
  const assessRisk = useCallback((breachId: string, assessmentData: Omit<RiskAssessment, 'id' | 'breachId' | 'assessedAt'>): RiskAssessment => {
    const current = stateRef.current;
    const existingAssessment = current.assessments.find(a => a.breachId === breachId);
    let result: RiskAssessment;
    let existing: boolean;

    if (existingAssessment) {
      result = { ...existingAssessment, ...assessmentData, assessedAt: Date.now() };
      existing = true;
    } else {
      result = { id: generateId('assessment'), breachId, assessedAt: Date.now(), ...assessmentData };
      existing = false;
    }

    dispatch({
      type: 'SET_ASSESSMENT',
      payload: { existing, id: existingAssessment?.id, assessment: result },
    });

    const nextAssessments = existing
      ? current.assessments.map(a => a.id === existingAssessment!.id ? result : a)
      : [...current.assessments, result];
    persistState({ ...current, assessments: nextAssessments });

    if (onAssessment) {
      onAssessment(result);
    }

    return result;
  }, [generateId, onAssessment, persistState]);

  // Get a risk assessment for a breach
  const getAssessment = useCallback((breachId: string): RiskAssessment | null => {
    return stateRef.current.assessments.find(assessment => assessment.breachId === breachId) || null;
  }, []);

  // Calculate notification requirements based on a risk assessment
  const calculateNotificationRequirements = useCallback((breachId: string): NotificationRequirement | null => {
    const report = stateRef.current.reports.find(r => r.id === breachId) || null;
    const assessment = stateRef.current.assessments.find(a => a.breachId === breachId) || null;

    if (!report) {
      return null;
    }

    const { severityLevel, notificationRequired, timeframeHours, justification } = calculateBreachSeverity(report, assessment || undefined);

    // Calculate the deadline (72 hours from discovery under NDPA Section 40)
    const deadline = report.discoveredAt + (timeframeHours * 60 * 60 * 1000);

    return {
      ndpcNotificationRequired: notificationRequired,
      ndpcNotificationDeadline: deadline,
      dataSubjectNotificationRequired: severityLevel === 'high' || severityLevel === 'critical',
      justification
    };
  }, []);

  // Send a regulatory notification
  const sendNotification = useCallback((breachId: string, notificationData: Omit<RegulatoryNotification, 'id' | 'breachId' | 'sentAt'>): RegulatoryNotification => {
    const current = stateRef.current;
    const existingNotification = current.notifications.find(n => n.breachId === breachId);
    let result: RegulatoryNotification;
    let existing: boolean;

    if (existingNotification) {
      result = { ...existingNotification, ...notificationData, sentAt: Date.now() };
      existing = true;
    } else {
      result = { id: generateId('notification'), breachId, sentAt: Date.now(), ...notificationData };
      existing = false;
    }

    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { existing, id: existingNotification?.id, notification: result },
    });

    const nextNotifications = existing
      ? current.notifications.map(n => n.id === existingNotification!.id ? result : n)
      : [...current.notifications, result];
    persistState({ ...current, notifications: nextNotifications });

    if (onNotification) {
      onNotification(result);
    }

    return result;
  }, [generateId, onNotification, persistState]);

  // Get a regulatory notification for a breach
  const getNotification = useCallback((breachId: string): RegulatoryNotification | null => {
    return stateRef.current.notifications.find(notification => notification.breachId === breachId) || null;
  }, []);

  // Get breaches that require notification within the next X hours
  const getBreachesRequiringNotification = useCallback((hoursThreshold = 24): Array<{
    report: BreachReport;
    assessment: RiskAssessment;
    requirements: NotificationRequirement;
    hoursRemaining: number;
  }> => {
    const now = Date.now();
    const current = stateRef.current;
    const result: Array<{
      report: BreachReport;
      assessment: RiskAssessment;
      requirements: NotificationRequirement;
      hoursRemaining: number;
    }> = [];

    current.reports.forEach(report => {
      // Skip if a notification has already been sent
      if (current.notifications.some(notification => notification.breachId === report.id)) {
        return;
      }

      const assessment = current.assessments.find(a => a.breachId === report.id) || null;
      if (!assessment) {
        return;
      }

      const requirements = calculateNotificationRequirements(report.id);
      if (!requirements || !requirements.ndpcNotificationRequired) {
        return;
      }

      const timeRemaining = requirements.ndpcNotificationDeadline - now;
      const hoursRemaining = timeRemaining / (60 * 60 * 1000);

      if (hoursRemaining <= hoursThreshold) {
        result.push({
          report,
          assessment,
          requirements,
          hoursRemaining
        });
      }
    });

    // Sort by hours remaining (ascending)
    return result.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }, [calculateNotificationRequirements]);

  // Clear all breach data
  const clearBreachData = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove breach data:', err);
    });
  }, []);

  return {
    reports: state.reports,
    assessments: state.assessments,
    notifications: state.notifications,
    reportBreach,
    updateReport,
    getReport,
    assessRisk,
    getAssessment,
    calculateNotificationRequirements,
    sendNotification,
    getNotification,
    getBreachesRequiringNotification,
    clearBreachData,
    isLoading,
  };
}
