import { useState, useEffect, useRef } from 'react';
import { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from '../types/breach';
import { calculateBreachSeverity } from '../utils/breach';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

type BreachCompositeState = {
  reports: BreachReport[];
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
};

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

  const [reports, setReports] = useState<BreachReport[]>(initialReports);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [notifications, setNotifications] = useState<RegulatoryNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load breach data from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      const applyLoaded = (loaded: BreachCompositeState | null) => {
        if (loaded) {
          setReports(loaded.reports ?? []);
          setAssessments(loaded.assessments ?? []);
          setNotifications(loaded.notifications ?? []);
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

  // Persist composite state to adapter
  const persistState = (
    nextReports: BreachReport[],
    nextAssessments: RiskAssessment[],
    nextNotifications: RegulatoryNotification[]
  ) => {
    Promise.resolve(
      adapterRef.current.save({ reports: nextReports, assessments: nextAssessments, notifications: nextNotifications })
    ).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save breach data:', err);
    });
  };
  
  // Generate a unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Submit a new breach report
  const reportBreach = (reportData: Omit<BreachReport, 'id' | 'reportedAt'>): BreachReport => {
    const newReport: BreachReport = {
      id: generateId('breach'),
      reportedAt: Date.now(),
      ...reportData,
    };

    const nextReports = [...reports, newReport];
    setReports(nextReports);
    persistState(nextReports, assessments, notifications);

    if (onReport) {
      onReport(newReport);
    }

    return newReport;
  };

  // Update an existing breach report
  const updateReport = (id: string, updates: Partial<BreachReport>): BreachReport | null => {
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updatedReport: BreachReport = { ...reports[index], ...updates };
    const nextReports = [...reports];
    nextReports[index] = updatedReport;
    setReports(nextReports);
    persistState(nextReports, assessments, notifications);

    return updatedReport;
  };
  
  // Get a breach report by ID
  const getReport = (id: string): BreachReport | null => {
    return reports.find(report => report.id === id) || null;
  };
  
  // Conduct a risk assessment for a breach
  const assessRisk = (breachId: string, assessmentData: Omit<RiskAssessment, 'id' | 'breachId' | 'assessedAt'>): RiskAssessment => {
    const existingAssessment = assessments.find(a => a.breachId === breachId);
    let nextAssessments: RiskAssessment[];
    let result: RiskAssessment;

    if (existingAssessment) {
      result = { ...existingAssessment, ...assessmentData, assessedAt: Date.now() };
      nextAssessments = assessments.map(a => a.id === existingAssessment.id ? result : a);
    } else {
      result = { id: generateId('assessment'), breachId, assessedAt: Date.now(), ...assessmentData };
      nextAssessments = [...assessments, result];
    }

    setAssessments(nextAssessments);
    persistState(reports, nextAssessments, notifications);

    if (onAssessment) {
      onAssessment(result);
    }

    return result;
  };
  
  // Get a risk assessment for a breach
  const getAssessment = (breachId: string): RiskAssessment | null => {
    return assessments.find(assessment => assessment.breachId === breachId) || null;
  };
  
  // Calculate notification requirements based on a risk assessment
  const calculateNotificationRequirements = (breachId: string): NotificationRequirement | null => {
    const report = getReport(breachId);
    const assessment = getAssessment(breachId);
    
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
  };
  
  // Send a regulatory notification
  const sendNotification = (breachId: string, notificationData: Omit<RegulatoryNotification, 'id' | 'breachId' | 'sentAt'>): RegulatoryNotification => {
    const existingNotification = notifications.find(n => n.breachId === breachId);
    let nextNotifications: RegulatoryNotification[];
    let result: RegulatoryNotification;

    if (existingNotification) {
      result = { ...existingNotification, ...notificationData, sentAt: Date.now() };
      nextNotifications = notifications.map(n => n.id === existingNotification.id ? result : n);
    } else {
      result = { id: generateId('notification'), breachId, sentAt: Date.now(), ...notificationData };
      nextNotifications = [...notifications, result];
    }

    setNotifications(nextNotifications);
    persistState(reports, assessments, nextNotifications);

    if (onNotification) {
      onNotification(result);
    }

    return result;
  };
  
  // Get a regulatory notification for a breach
  const getNotification = (breachId: string): RegulatoryNotification | null => {
    return notifications.find(notification => notification.breachId === breachId) || null;
  };
  
  // Get breaches that require notification within the next X hours
  const getBreachesRequiringNotification = (hoursThreshold = 24): Array<{
    report: BreachReport;
    assessment: RiskAssessment;
    requirements: NotificationRequirement;
    hoursRemaining: number;
  }> => {
    const now = Date.now();
    const result: Array<{
      report: BreachReport;
      assessment: RiskAssessment;
      requirements: NotificationRequirement;
      hoursRemaining: number;
    }> = [];
    
    reports.forEach(report => {
      // Skip if a notification has already been sent
      if (notifications.some(notification => notification.breachId === report.id)) {
        return;
      }
      
      const assessment = getAssessment(report.id);
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
  };
  
  // Clear all breach data
  const clearBreachData = () => {
    setReports([]);
    setAssessments([]);
    setNotifications([]);
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove breach data:', err);
    });
  };

  return {
    reports,
    assessments,
    notifications,
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
