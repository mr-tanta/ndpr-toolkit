import { getComplianceScore } from '../../utils/compliance-score';

const fullInput = {
  consent: { hasConsentMechanism: true, hasPurposeSpecification: true, hasWithdrawalMechanism: true, hasMinorProtection: true, consentRecordsRetained: true },
  dsr: { hasRequestMechanism: true, supportsAccess: true, supportsRectification: true, supportsErasure: true, supportsPortability: true, supportsObjection: true, responseTimelineDays: 30 },
  dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
  breach: { hasNotificationProcess: true, notifiesWithin72Hours: true, hasRiskAssessment: true, hasRecordKeeping: true },
  policy: { hasPrivacyPolicy: true, isPubliclyAccessible: true, lastUpdated: new Date().toISOString().split('T')[0], coversAllSections: true },
  lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: true },
  crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: true },
  ropa: { maintained: true, includesAllProcessing: true, lastReviewed: new Date().toISOString().split('T')[0] },
};

describe('getComplianceScore', () => {
  it('returns 100 for fully compliant input', () => {
    const report = getComplianceScore(fullInput);
    expect(report.score).toBe(100);
    expect(report.rating).toBe('excellent');
    expect(report.recommendations).toHaveLength(0);
  });

  it('returns a lower score when consent is missing', () => {
    const report = getComplianceScore({
      ...fullInput,
      consent: { hasConsentMechanism: false, hasPurposeSpecification: false, hasWithdrawalMechanism: false, hasMinorProtection: false, consentRecordsRetained: false },
    });
    expect(report.score).toBeLessThan(100);
    expect(report.modules.consent.score).toBe(0);
    expect(report.modules.consent.gaps.length).toBeGreaterThan(0);
  });

  it('generates recommendations sorted by priority', () => {
    const report = getComplianceScore({
      ...fullInput,
      consent: { ...fullInput.consent, hasConsentMechanism: false },
      breach: { ...fullInput.breach, notifiesWithin72Hours: false },
    });
    expect(report.recommendations.length).toBeGreaterThan(0);
    const priorities = report.recommendations.map(r => r.priority);
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    for (let i = 1; i < priorities.length; i++) {
      expect(priorityOrder.indexOf(priorities[i])).toBeGreaterThanOrEqual(priorityOrder.indexOf(priorities[i - 1]));
    }
  });

  it('includes NDPA section references', () => {
    const report = getComplianceScore(fullInput);
    expect(report.modules.consent.ndpaSections).toContain('Section 25');
    expect(report.modules.breach.ndpaSections).toContain('Section 40');
  });

  it('rates correctly across thresholds', () => {
    const criticalInput = {
      consent: { hasConsentMechanism: false, hasPurposeSpecification: false, hasWithdrawalMechanism: false, hasMinorProtection: false, consentRecordsRetained: false },
      dsr: { hasRequestMechanism: false, supportsAccess: false, supportsRectification: false, supportsErasure: false, supportsPortability: false, supportsObjection: false, responseTimelineDays: 90 },
      dpia: { conductedForHighRisk: false, documentedRisks: false, mitigationMeasures: false },
      breach: { hasNotificationProcess: false, notifiesWithin72Hours: false, hasRiskAssessment: false, hasRecordKeeping: false },
      policy: { hasPrivacyPolicy: false, isPubliclyAccessible: false, lastUpdated: '2020-01-01', coversAllSections: false },
      lawfulBasis: { documentedForAllProcessing: false, hasLegitimateInterestAssessment: false },
      crossBorder: { hasTransferMechanisms: false, adequacyAssessed: false, ndpcApprovalObtained: false },
      ropa: { maintained: false, includesAllProcessing: false, lastReviewed: '2020-01-01' },
    };
    const report = getComplianceScore(criticalInput);
    expect(report.rating).toBe('critical');
    expect(report.score).toBeLessThanOrEqual(25);
  });
});
