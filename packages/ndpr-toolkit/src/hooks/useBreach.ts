import { useState, useEffect } from 'react';
import { BreachReport, BreachCategory, RiskAssessment, NotificationRequirement, RegulatoryNotification } from '../types/breach';
import { calculateBreachSeverity } from '../utils/breach';

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
   * Storage key for breach data
   * @default "ndpr_breach_data"
   */
  storageKey?: string;
  
  /**
   * Whether to use local storage to persist breach data
   * @default true
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

interface UseBreachReturn {
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
}

/**
 * Hook for managing data breach notifications in compliance with the NDPA (Section 40)
 */
export function useBreach({
  categories,
  initialReports = [],
  storageKey = "ndpr_breach_data",
  useLocalStorage = true,
  onReport,
  onAssessment,
  onNotification
}: UseBreachOptions): UseBreachReturn {
  const [reports, setReports] = useState<BreachReport[]>(initialReports);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [notifications, setNotifications] = useState<RegulatoryNotification[]>([]);
  
  // Load breach data from storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const { reports, assessments, notifications } = JSON.parse(savedData);
          setReports(reports || []);
          setAssessments(assessments || []);
          setNotifications(notifications || []);
        }
      } catch (error) {
        console.error('Error loading breach data:', error);
      }
    }
  }, [storageKey, useLocalStorage]);
  
  // Save breach data to storage when it changes
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          reports,
          assessments,
          notifications
        }));
      } catch (error) {
        console.error('Error saving breach data:', error);
      }
    }
  }, [reports, assessments, notifications, storageKey, useLocalStorage]);
  
  // Generate a unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Submit a new breach report
  const reportBreach = (reportData: Omit<BreachReport, 'id' | 'reportedAt'>): BreachReport => {
    const newReport: BreachReport = {
      id: generateId('breach'),
      reportedAt: Date.now(),
      ...reportData
    };
    
    setReports(prevReports => [...prevReports, newReport]);
    
    if (onReport) {
      onReport(newReport);
    }
    
    return newReport;
  };
  
  // Update an existing breach report
  const updateReport = (id: string, updates: Partial<BreachReport>): BreachReport | null => {
    let updatedReport: BreachReport | null = null;
    
    setReports(prevReports => {
      const index = prevReports.findIndex(report => report.id === id);
      
      if (index === -1) {
        return prevReports;
      }
      
      const report = prevReports[index];
      updatedReport = {
        ...report,
        ...updates
      };
      
      const newReports = [...prevReports];
      newReports[index] = updatedReport as BreachReport;
      
      return newReports;
    });
    
    return updatedReport;
  };
  
  // Get a breach report by ID
  const getReport = (id: string): BreachReport | null => {
    return reports.find(report => report.id === id) || null;
  };
  
  // Conduct a risk assessment for a breach
  const assessRisk = (breachId: string, assessmentData: Omit<RiskAssessment, 'id' | 'breachId' | 'assessedAt'>): RiskAssessment => {
    // Check if an assessment already exists for this breach
    const existingAssessment = assessments.find(assessment => assessment.breachId === breachId);
    
    if (existingAssessment) {
      // Update the existing assessment
      const updatedAssessment: RiskAssessment = {
        ...existingAssessment,
        ...assessmentData,
        assessedAt: Date.now()
      };
      
      setAssessments(prevAssessments => 
        prevAssessments.map(assessment => 
          assessment.id === existingAssessment.id ? updatedAssessment : assessment
        )
      );
      
      if (onAssessment) {
        onAssessment(updatedAssessment);
      }
      
      return updatedAssessment;
    } else {
      // Create a new assessment
      const newAssessment: RiskAssessment = {
        id: generateId('assessment'),
        breachId,
        assessedAt: Date.now(),
        ...assessmentData
      };
      
      setAssessments(prevAssessments => [...prevAssessments, newAssessment]);
      
      if (onAssessment) {
        onAssessment(newAssessment);
      }
      
      return newAssessment;
    }
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
    // Check if a notification already exists for this breach
    const existingNotification = notifications.find(notification => notification.breachId === breachId);
    
    if (existingNotification) {
      // Update the existing notification
      const updatedNotification: RegulatoryNotification = {
        ...existingNotification,
        ...notificationData,
        sentAt: Date.now()
      };
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === existingNotification.id ? updatedNotification : notification
        )
      );
      
      if (onNotification) {
        onNotification(updatedNotification);
      }
      
      return updatedNotification;
    } else {
      // Create a new notification
      const newNotification: RegulatoryNotification = {
        id: generateId('notification'),
        breachId,
        sentAt: Date.now(),
        ...notificationData
      };
      
      setNotifications(prevNotifications => [...prevNotifications, newNotification]);
      
      if (onNotification) {
        onNotification(newNotification);
      }
      
      return newNotification;
    }
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
    
    if (useLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
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
    clearBreachData
  };
}
