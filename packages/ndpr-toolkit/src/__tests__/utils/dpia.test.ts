import { assessDPIARisk } from '../../utils/dpia';
import { DPIAResult, DPIARisk } from '../../types/dpia';

describe('assessDPIARisk', () => {
  it('should correctly assess risk based on high risk data', () => {
    // Create a DPIA result with high risks
    const dpiaResult: DPIAResult = {
      id: '123',
      title: 'Test DPIA',
      processingDescription: 'Processing sensitive customer data',
      startedAt: Date.now(),
      assessor: {
        name: 'John Doe',
        role: 'DPO',
        email: 'john@example.com'
      },
      answers: {
        q1: 'yes',
        q2: 'large'
      },
      risks: [
        {
          id: 'risk_1',
          description: 'Processing involves sensitive personal data',
          likelihood: 5,
          impact: 5,
          score: 25,
          level: 'high',
          mitigated: false,
          relatedQuestionIds: ['q1']
        },
        {
          id: 'risk_2',
          description: 'Large volume of data being processed',
          likelihood: 5,
          impact: 5,
          score: 25,
          level: 'high',
          mitigated: false,
          relatedQuestionIds: ['q2']
        },
        {
          id: 'risk_3',
          description: 'Another high risk factor',
          likelihood: 5,
          impact: 5,
          score: 25,
          level: 'high',
          mitigated: false,
          relatedQuestionIds: ['q3']
        }
      ],
      overallRiskLevel: 'low', // Will be updated by the function
      canProceed: true, // Will be updated by the function
      conclusion: 'Initial conclusion',
      version: '1.0'
    };

    const result = assessDPIARisk(dpiaResult);
    
    expect(result.overallRiskLevel).toBe('high');
    expect(result.requiresConsultation).toBe(true);
    expect(result.canProceed).toBe(false);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should handle medium risk levels', () => {
    // Create a DPIA result with medium risks
    const dpiaResult: DPIAResult = {
      id: '456',
      title: 'Test DPIA',
      processingDescription: 'Processing customer data',
      startedAt: Date.now(),
      assessor: {
        name: 'Jane Smith',
        role: 'Privacy Officer',
        email: 'jane@example.com'
      },
      answers: {
        q1: 'no',
        q2: 'medium'
      },
      risks: [
        {
          id: 'risk_1',
          description: 'Medium volume of data being processed',
          likelihood: 3,
          impact: 3,
          score: 9,
          level: 'medium',
          mitigated: false,
          relatedQuestionIds: ['q2']
        },
        {
          id: 'risk_2',
          description: 'Another medium risk factor',
          likelihood: 3,
          impact: 3,
          score: 9,
          level: 'medium',
          mitigated: false,
          relatedQuestionIds: ['q3']
        }
      ],
      overallRiskLevel: 'low', // Will be updated by the function
      canProceed: true, // Will be updated by the function
      conclusion: 'Initial conclusion',
      version: '1.0'
    };

    const result = assessDPIARisk(dpiaResult);
    
    expect(result.overallRiskLevel).toBe('medium');
    expect(result.requiresConsultation).toBe(false);
    expect(result.canProceed).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should handle low risk levels', () => {
    // Create a DPIA result with no significant risks
    const dpiaResult: DPIAResult = {
      id: '789',
      title: 'Test DPIA',
      processingDescription: 'Processing minimal customer data',
      startedAt: Date.now(),
      assessor: {
        name: 'Alex Johnson',
        role: 'Compliance Manager',
        email: 'alex@example.com'
      },
      answers: {
        q1: 'Marketing purposes',
        q2: 'small'
      },
      risks: [
        {
          id: 'risk_1',
          description: 'Small volume of data being processed',
          likelihood: 1,
          impact: 1,
          score: 1,
          level: 'low',
          mitigated: true,
          relatedQuestionIds: ['q2']
        }
      ],
      overallRiskLevel: 'low', // Will be updated by the function
      canProceed: true, // Will be updated by the function
      conclusion: 'Initial conclusion',
      version: '1.0'
    };

    const result = assessDPIARisk(dpiaResult);
    
    expect(result.overallRiskLevel).toBe('low');
    expect(result.requiresConsultation).toBe(false);
    expect(result.canProceed).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
