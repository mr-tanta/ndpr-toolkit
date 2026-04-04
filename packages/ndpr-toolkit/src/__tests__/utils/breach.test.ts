import { calculateBreachSeverity } from '../../utils/breach';
import { BreachReport, RiskAssessment } from '../../types/breach';

describe('calculateBreachSeverity (NDPA Section 40 - NDPC Notification)', () => {
  const breachReport: BreachReport = {
    id: 'breach-123',
    title: 'Database Breach',
    description: 'Unauthorized access to customer database',
    category: 'unauthorized_access',
    discoveredAt: 1620000000000,
    occurredAt: 1619900000000,
    reportedAt: 1620010000000,
    reporter: {
      name: 'John Smith',
      email: 'john@example.com',
      department: 'IT Security',
      phone: '1234567890'
    },
    affectedSystems: ['customer-db', 'payment-system'],
    dataTypes: ['personal', 'financial'],
    estimatedAffectedSubjects: 1000,
    status: 'contained'
  };

  it('should calculate high severity requiring NDPC notification for sensitive data and large number of affected subjects', () => {
    const assessment: RiskAssessment = {
      id: 'risk-123',
      breachId: 'breach-123',
      assessor: {
        name: 'John Doe',
        role: 'DPO',
        email: 'dpo@example.com'
      },
      assessedAt: 1620000000000,
      confidentialityImpact: 4,
      integrityImpact: 3,
      availabilityImpact: 3,
      harmLikelihood: 4,
      harmSeverity: 4,
      overallRiskScore: 16,
      riskLevel: 'high',
      risksToRightsAndFreedoms: true,
      highRisksToRightsAndFreedoms: true,
      justification: 'High risk due to sensitive financial data'
    };

    const result = calculateBreachSeverity(breachReport, assessment);
    
    expect(result.severityLevel).toBe('high');
    expect(result.notificationRequired).toBe(true);
    expect(result.urgentNotificationRequired).toBe(true);
    // NDPA Section 40 requires NDPC notification within 72 hours
    expect(result.timeframeHours).toBe(72);
    expect(result.justification).toBe('High risk due to sensitive financial data');
  });

  it('should calculate medium severity requiring NDPC notification for non-sensitive data with medium impact', () => {
    const assessment: RiskAssessment = {
      id: 'risk-456',
      breachId: 'breach-456',
      assessor: {
        name: 'Jane Smith',
        role: 'Security Officer',
        email: 'security@example.com'
      },
      assessedAt: 1620100000000,
      confidentialityImpact: 3,
      integrityImpact: 2,
      availabilityImpact: 2,
      harmLikelihood: 3,
      harmSeverity: 3,
      overallRiskScore: 9,
      riskLevel: 'medium',
      risksToRightsAndFreedoms: true,
      highRisksToRightsAndFreedoms: false,
      justification: 'Medium risk due to personal data exposure'
    };

    const result = calculateBreachSeverity(breachReport, assessment);
    
    expect(result.severityLevel).toBe('medium');
    expect(result.notificationRequired).toBe(true);
    expect(result.urgentNotificationRequired).toBe(false);
    expect(result.timeframeHours).toBe(72);
    expect(result.justification).toBe('Medium risk due to personal data exposure');
  });

  it('should calculate low severity not requiring NDPC notification for contained breach with low impact', () => {
    const assessment: RiskAssessment = {
      id: 'risk-789',
      breachId: 'breach-789',
      assessor: {
        name: 'Alex Johnson',
        role: 'Compliance Manager',
        email: 'compliance@example.com'
      },
      assessedAt: 1620200000000,
      confidentialityImpact: 1,
      integrityImpact: 1,
      availabilityImpact: 2,
      harmLikelihood: 2,
      harmSeverity: 1,
      overallRiskScore: 2,
      riskLevel: 'low',
      risksToRightsAndFreedoms: false,
      highRisksToRightsAndFreedoms: false,
      justification: 'Low risk due to minimal data exposure'
    };

    const result = calculateBreachSeverity(breachReport, assessment);
    
    expect(result.severityLevel).toBe('low');
    expect(result.notificationRequired).toBe(false);
    expect(result.urgentNotificationRequired).toBe(false);
    expect(result.timeframeHours).toBe(72);
    expect(result.justification).toBe('Low risk due to minimal data exposure');
  });

  it('should calculate severity for NDPC reporting based on breach report when no assessment is provided', () => {
    // Create a breach report with sensitive data and large scale
    const sensitiveBreachReport: BreachReport = {
      ...breachReport,
      dataTypes: ['personal', 'financial', 'health'],
      estimatedAffectedSubjects: 5000,
      status: 'ongoing'
    };

    const result = calculateBreachSeverity(sensitiveBreachReport);
    
    // With 3 severity factors (sensitive data, large scale, ongoing), it should be critical
    expect(result.severityLevel).toBe('critical');
    expect(result.notificationRequired).toBe(true);
    expect(result.urgentNotificationRequired).toBe(true);
    expect(result.timeframeHours).toBe(72);
    expect(result.justification).toContain('Critical risk');
  });

  it('should always require NDPC notification for ongoing breaches per NDPA Section 40', () => {
    const ongoingBreachReport: BreachReport = {
      ...breachReport,
      status: 'ongoing',
      dataTypes: ['personal']
    };

    const result = calculateBreachSeverity(ongoingBreachReport);
    
    expect(result.notificationRequired).toBe(true);
    expect(result.justification).toContain('Medium risk');
  });
});
