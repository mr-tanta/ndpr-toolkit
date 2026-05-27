import React from 'react';
import { render } from '@testing-library/react';
import { useComplianceScore } from '../../hooks/useComplianceScore';
import type { ComplianceInput, ComplianceReport } from '../../utils/compliance-score';

const TODAY = new Date().toISOString().split('T')[0];

const baseInput: ComplianceInput = {
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
    responseTimelineDays: 30,
  },
  dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
  breach: {
    hasNotificationProcess: true,
    notifiesWithin72Hours: true,
    hasRiskAssessment: true,
    hasRecordKeeping: true,
  },
  policy: {
    hasPrivacyPolicy: true,
    isPubliclyAccessible: true,
    lastUpdated: TODAY,
    coversAllSections: true,
  },
  lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: true },
  crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: true },
  ropa: { maintained: true, includesAllProcessing: true, lastReviewed: TODAY },
};

function makeHarness() {
  const reports: ComplianceReport[] = [];
  const Harness: React.FC<{ input: ComplianceInput }> = ({ input }) => {
    const report = useComplianceScore({ input });
    reports.push(report);
    return <span data-testid="score">{report.score}</span>;
  };
  return { Harness, reports };
}

describe('useComplianceScore', () => {
  it('memoises by deep equality of input — no re-compute when same shape recreated', () => {
    const { Harness, reports } = makeHarness();
    const { rerender } = render(<Harness input={baseInput} />);
    const initialReport = reports[0];

    // Re-render with a brand-new object literal carrying the same values.
    const clonedInput: ComplianceInput = JSON.parse(JSON.stringify(baseInput));
    rerender(<Harness input={clonedInput} />);

    const secondReport = reports[reports.length - 1];
    // Reference equality of the memoised return value proves the inner
    // useMemo did not recompute (it returned the cached object).
    expect(secondReport).toBe(initialReport);
  });

  it('recomputes when an inner field changes', () => {
    const { Harness, reports } = makeHarness();
    const { rerender } = render(<Harness input={baseInput} />);
    const initialReport = reports[0];
    expect(initialReport.score).toBe(100);

    const degraded: ComplianceInput = {
      ...baseInput,
      consent: { ...baseInput.consent, hasConsentMechanism: false },
    };
    rerender(<Harness input={degraded} />);

    const secondReport = reports[reports.length - 1];
    expect(secondReport).not.toBe(initialReport);
    expect(secondReport.score).toBeLessThan(100);
    expect(secondReport.modules.consent.score).toBeLessThan(100);
  });
});
