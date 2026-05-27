import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRDashboard } from '../../presets/NDPRDashboard';
import type { ComplianceInput } from '../../utils/compliance-score';

const TODAY = new Date().toISOString().split('T')[0];

const fullyCompliantInput: ComplianceInput = {
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

describe('NDPRDashboard preset (compliance dashboard)', () => {
  it('computes report from raw ComplianceInput and renders score ring', () => {
    render(<NDPRDashboard input={fullyCompliantInput} />);

    // Score ring exposes the overall score via aria-label.
    const ring = screen.getByLabelText(/Compliance score: 100 out of 100/i);
    expect(ring).toBeInTheDocument();
    // The numeric score is rendered as text inside the ring.
    expect(ring.textContent).toMatch(/100/);
  });

  it('reflects degraded input by lowering the overall score', () => {
    const degraded: ComplianceInput = {
      ...fullyCompliantInput,
      consent: { ...fullyCompliantInput.consent, hasConsentMechanism: false },
      breach: { ...fullyCompliantInput.breach, notifiesWithin72Hours: false },
    };

    render(<NDPRDashboard input={degraded} />);

    // No longer a perfect score — the aria-label must NOT say "100 out of 100".
    expect(screen.queryByLabelText(/Compliance score: 100 out of 100/i)).toBeNull();
    // Some ring is still rendered with a numeric score in 0-99 range.
    const ring = screen.getByLabelText(/Compliance score: \d+ out of 100/i);
    expect(ring).toBeInTheDocument();
  });
});
