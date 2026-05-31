import { runNdprAudit, formatNdprAuditReport } from '../../utils/audit';
import type { NdprAuditInput } from '../../utils/audit';
import type { ComplianceInput } from '../../utils/compliance-score';
import type { BreachReport } from '../../types/breach';

const HOUR = 3600_000;

function perfectCompliance(): ComplianceInput {
  return {
    consent: {
      hasConsentMechanism: true,
      hasPurposeSpecification: true,
      hasWithdrawalMechanism: true,
      hasMinorProtection: true,
      consentRecordsRetained: true,
    },
    dsr: {
      hasRequestMechanism: true,
      supportsAccess: true,
      supportsRectification: true,
      supportsErasure: true,
      supportsPortability: true,
      supportsObjection: true,
      responseTimelineDays: 14,
    },
    dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
    breach: { hasNotificationProcess: true, notifiesWithin72Hours: true, hasRiskAssessment: true, hasRecordKeeping: true },
    policy: { hasPrivacyPolicy: true, isPubliclyAccessible: true, lastUpdated: '2026-05-01', coversAllSections: true },
    lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: true },
    crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: true },
    ropa: { maintained: true, includesAllProcessing: true, lastReviewed: '2026-05-01' },
  };
}

describe('runNdprAudit', () => {
  it('passes for a complete compliance posture', () => {
    const result = runNdprAudit({ compliance: perfectCompliance() });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.summary.fail).toBe(0);
    expect(result.minScore).toBe(70);
  });

  it('fails when a critical NDPA gap is present', () => {
    const compliance = perfectCompliance();
    compliance.consent.hasConsentMechanism = false; // critical-priority gap
    const result = runNdprAudit({ compliance });
    expect(result.passed).toBe(false);
    expect(result.checks.some((c) => c.status === 'fail')).toBe(true);
  });

  it('fails when the score is below the configured minimum', () => {
    const compliance = perfectCompliance();
    // Knock out several non-critical items to drop the score without a critical gap.
    compliance.crossBorder.adequacyAssessed = false;
    compliance.crossBorder.ndpcApprovalObtained = false;
    compliance.lawfulBasis.hasLegitimateInterestAssessment = false;
    const result = runNdprAudit({ compliance }, { minScore: 100 });
    expect(result.passed).toBe(false);
    const overall = result.checks.find((c) => c.id === 'compliance-score');
    expect(overall?.status).toBe('fail');
  });

  it('flags an overdue, un-notified breach as a hard failure', () => {
    const discoveredAt = Date.UTC(2026, 0, 1);
    const breach: BreachReport = {
      id: 'b1',
      title: 'Exposed export',
      description: 'A bucket was exposed.',
      category: 'unauthorised-access',
      discoveredAt,
      reportedAt: discoveredAt,
      reporter: { name: 'Ada', email: 'ada@example.com', department: 'Security' },
      affectedSystems: ['crm'],
      dataTypes: ['email'],
      status: 'contained',
    };
    const result = runNdprAudit(
      { compliance: perfectCompliance(), breaches: [breach] },
      { breachOptions: { asOf: discoveredAt + 100 * HOUR } },
    );
    expect(result.breaches).toHaveLength(1);
    const breachCheck = result.checks.find((c) => c.id.startsWith('breach:'));
    expect(breachCheck?.status).toBe('fail');
    expect(result.passed).toBe(false);
  });

  it('includes DCPMI classification and CAR schedule when provided', () => {
    const result = runNdprAudit({
      compliance: perfectCompliance(),
      dcpmi: { dataSubjectsInSixMonths: 6200 },
      car: { commencementDate: '2025-01-15', asOf: '2026-03-21' },
    });
    expect(result.dcpmi?.tier).toBe('UHL');
    expect(result.car?.schedule.nextFilingDeadline).toBe('2026-03-31');
    expect(result.checks.some((c) => c.id === 'dcpmi')).toBe(true);
    expect(result.checks.some((c) => c.id === 'car')).toBe(true);
  });
});

describe('formatNdprAuditReport', () => {
  it('renders a readable report with a verdict and the score', () => {
    const report = formatNdprAuditReport(runNdprAudit({ compliance: perfectCompliance() }));
    expect(report).toMatch(/PASS/);
    expect(report).toMatch(/100/);
  });

  it('renders FAIL when the audit does not pass', () => {
    const compliance = perfectCompliance();
    compliance.consent.hasConsentMechanism = false;
    const report = formatNdprAuditReport(runNdprAudit({ compliance }));
    expect(report).toMatch(/FAIL/);
  });
});
