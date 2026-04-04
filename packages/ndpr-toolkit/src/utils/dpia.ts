import { DPIAResult, DPIARisk } from '../types/dpia';

/**
 * Assesses the risk level of a DPIA based on the identified risks
 * @param dpiaResult The DPIA result containing risks to assess
 * @returns Assessment result with overall risk level and recommendations
 */
export function assessDPIARisk(dpiaResult: DPIAResult): {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresConsultation: boolean;
  canProceed: boolean;
  recommendations: string[];
} {
  // Count risks by level
  const riskCounts = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };
  
  // Calculate the highest risk score
  let highestRiskScore = 0;
  
  // Track unmitigated high/critical risks
  const unmitigatedHighRisks: DPIARisk[] = [];
  
  // Analyze each risk
  dpiaResult.risks.forEach(risk => {
    // Count by level
    riskCounts[risk.level]++;
    
    // Track highest score
    if (risk.score > highestRiskScore) {
      highestRiskScore = risk.score;
    }
    
    // Track unmitigated high/critical risks
    if ((risk.level === 'high' || risk.level === 'critical') && !risk.mitigated) {
      unmitigatedHighRisks.push(risk);
    }
  });
  
  // Determine overall risk level
  let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  if (riskCounts.critical > 0) {
    overallRiskLevel = 'critical';
  } else if (riskCounts.high > 2 || (riskCounts.high > 0 && riskCounts.medium > 3)) {
    overallRiskLevel = 'high';
  } else if (riskCounts.high > 0 || riskCounts.medium > 1) {
    overallRiskLevel = 'medium';
  } else {
    overallRiskLevel = 'low';
  }
  
  // Determine if NDPC consultation is required
  // Under NDPA Section 39, prior consultation with the NDPC is required when residual risk is high
  const requiresConsultation = overallRiskLevel === 'high' || overallRiskLevel === 'critical';
  
  // Determine if processing can proceed
  // Processing can proceed if all high/critical risks are mitigated
  const canProceed = unmitigatedHighRisks.length === 0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (unmitigatedHighRisks.length > 0) {
    recommendations.push(
      `Mitigate the following high/critical risks before proceeding: ${
        unmitigatedHighRisks.map(risk => risk.description).join(', ')
      }`
    );
  }
  
  if (requiresConsultation) {
    recommendations.push(
      'Consult with the NDPC (Nigeria Data Protection Commission) before proceeding with this processing activity, as required by NDPA Section 39.'
    );
  }
  
  if (riskCounts.medium > 0) {
    recommendations.push(
      'Implement additional safeguards to reduce medium-level risks where possible.'
    );
  }
  
  if (overallRiskLevel !== 'low') {
    recommendations.push(
      'Schedule a review of this DPIA in 6 months to reassess risks and effectiveness of mitigation measures.'
    );
  } else {
    recommendations.push(
      'Schedule a review of this DPIA in 12 months as part of regular compliance activities.'
    );
  }
  
  return {
    overallRiskLevel,
    requiresConsultation,
    canProceed,
    recommendations
  };
}
