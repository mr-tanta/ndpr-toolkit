import { BreachReport, RiskAssessment } from '../types/breach';

/**
 * Calculates the severity of a data breach based on various factors
 * @param report The breach report
 * @param assessment The risk assessment (if available)
 * @returns The calculated severity and notification requirements
 */
export function calculateBreachSeverity(
  report: BreachReport,
  assessment?: RiskAssessment
): {
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  notificationRequired: boolean;
  urgentNotificationRequired: boolean;
  timeframeHours: number;
  justification: string;
} {
  // If we have a risk assessment, use its values
  if (assessment) {
    const { riskLevel, risksToRightsAndFreedoms, highRisksToRightsAndFreedoms } = assessment;
    
    // Under the NDPA (Section 40), notification to the NDPC is required if there is a risk to rights and freedoms
    const notificationRequired = risksToRightsAndFreedoms;

    // Urgent notification is needed for high risks (NDPA Section 40(4))
    const urgentNotificationRequired = highRisksToRightsAndFreedoms;

    // NDPA Section 40 requires notification within 72 hours
    const timeframeHours = 72;
    
    return {
      severityLevel: riskLevel,
      notificationRequired,
      urgentNotificationRequired,
      timeframeHours,
      justification: assessment.justification || 'Based on risk assessment results'
    };
  }
  
  // If no assessment is available, calculate based on breach report
  
  // Factors that increase severity
  const severityFactors = {
    // Breach is ongoing
    ongoing: report.status === 'ongoing',
    
    // Sensitive data types
    sensitiveData: ['health', 'financial', 'biometric', 'children', 'location', 'religious', 'political', 'ethnic']
      .some(type => report.dataTypes.includes(type)),
    
    // Large number of affected subjects
    largeScale: (report.estimatedAffectedSubjects || 0) > 1000,
    
    // Breach was not discovered promptly
    delayedDiscovery: report.occurredAt && 
      ((report.discoveredAt - report.occurredAt) > (7 * 24 * 60 * 60 * 1000)) // More than 7 days
  };
  
  // Count severity factors
  const factorCount = Object.values(severityFactors).filter(Boolean).length;
  
  // Determine severity level
  let severityLevel: 'low' | 'medium' | 'high' | 'critical';
  
  if (factorCount === 0) {
    severityLevel = 'low';
  } else if (factorCount === 1) {
    severityLevel = 'medium';
  } else if (factorCount === 2) {
    severityLevel = 'high';
  } else {
    severityLevel = 'critical';
  }
  
  // Under the NDPA (Section 40), notification to the NDPC is required for medium or higher severity
  const notificationRequired = severityLevel !== 'low';

  // Urgent notification for high/critical severity (NDPA Section 40(4))
  const urgentNotificationRequired = severityLevel === 'high' || severityLevel === 'critical';

  // NDPA Section 40 requires notification within 72 hours
  const timeframeHours = 72;
  
  // Build justification
  const factors = Object.entries(severityFactors)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(', ');
  
  // Build justification dynamically from actual factors
  const justification = factors
    ? `${severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1)} risk (factors: ${factors})`
    : `${severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1)} risk`;
  
  return {
    severityLevel,
    notificationRequired,
    urgentNotificationRequired,
    timeframeHours,
    justification
  };
}
