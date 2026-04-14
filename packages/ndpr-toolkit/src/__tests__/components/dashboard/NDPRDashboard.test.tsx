import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRDashboard } from '../../../components/dashboard/NDPRDashboard';
import { getComplianceScore } from '../../../utils/compliance-score';

const fullInput = {
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
  dpia: {
    conductedForHighRisk: true,
    documentedRisks: true,
    mitigationMeasures: true,
  },
  breach: {
    hasNotificationProcess: true,
    notifiesWithin72Hours: true,
    hasRiskAssessment: true,
    hasRecordKeeping: true,
  },
  policy: {
    hasPrivacyPolicy: true,
    isPubliclyAccessible: true,
    lastUpdated: new Date().toISOString().split('T')[0],
    coversAllSections: true,
  },
  lawfulBasis: {
    documentedForAllProcessing: true,
    hasLegitimateInterestAssessment: true,
  },
  crossBorder: {
    hasTransferMechanisms: true,
    adequacyAssessed: true,
    ndpcApprovalObtained: true,
  },
  ropa: {
    maintained: true,
    includesAllProcessing: true,
    lastReviewed: new Date().toISOString().split('T')[0],
  },
};

describe('NDPRDashboard', () => {
  it('renders the compliance score', () => {
    const report = getComplianceScore(fullInput);
    render(<NDPRDashboard report={report} />);
    // Score "100" appears in both the ring and the module cards when all modules pass
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getByText(/excellent/i)).toBeInTheDocument();
  });

  it('renders all 8 module cards', () => {
    const report = getComplianceScore(fullInput);
    render(<NDPRDashboard report={report} />);
    expect(screen.getByText('Consent')).toBeInTheDocument();
    expect(screen.getByText('Data Subject Rights')).toBeInTheDocument();
    expect(screen.getByText('DPIA')).toBeInTheDocument();
    expect(screen.getByText('Breach Notification')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Lawful Basis')).toBeInTheDocument();
    expect(screen.getByText('Cross-Border')).toBeInTheDocument();
    expect(screen.getByText('ROPA')).toBeInTheDocument();
  });

  it('shows recommendations when score is not perfect', () => {
    const partialInput = {
      ...fullInput,
      consent: { ...fullInput.consent, hasConsentMechanism: false },
    };
    const report = getComplianceScore(partialInput);
    render(<NDPRDashboard report={report} />);
    expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
  });

  it('hides recommendations when showRecommendations is false', () => {
    const partialInput = {
      ...fullInput,
      consent: { ...fullInput.consent, hasConsentMechanism: false },
    };
    const report = getComplianceScore(partialInput);
    render(<NDPRDashboard report={report} showRecommendations={false} />);
    expect(screen.queryByText(/Recommendations/i)).not.toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const report = getComplianceScore(fullInput);
    render(<NDPRDashboard report={report} title="My Compliance Report" />);
    expect(screen.getByText('My Compliance Report')).toBeInTheDocument();
  });

  it('renders the default title when none is provided', () => {
    const report = getComplianceScore(fullInput);
    render(<NDPRDashboard report={report} />);
    expect(screen.getByText('NDPA Compliance Dashboard')).toBeInTheDocument();
  });

  it('limits recommendations to maxRecommendations', () => {
    const lowInput = {
      consent: {
        hasConsentMechanism: false,
        hasPurposeSpecification: false,
        hasWithdrawalMechanism: false,
        hasMinorProtection: false,
        consentRecordsRetained: false,
      },
      dsr: {
        hasRequestMechanism: false,
        supportsAccess: false,
        supportsRectification: false,
        supportsErasure: false,
        supportsPortability: false,
        supportsObjection: false,
        responseTimelineDays: 60,
      },
      dpia: {
        conductedForHighRisk: false,
        documentedRisks: false,
        mitigationMeasures: false,
      },
      breach: {
        hasNotificationProcess: false,
        notifiesWithin72Hours: false,
        hasRiskAssessment: false,
        hasRecordKeeping: false,
      },
      policy: {
        hasPrivacyPolicy: false,
        isPubliclyAccessible: false,
        lastUpdated: '2020-01-01',
        coversAllSections: false,
      },
      lawfulBasis: {
        documentedForAllProcessing: false,
        hasLegitimateInterestAssessment: false,
      },
      crossBorder: {
        hasTransferMechanisms: false,
        adequacyAssessed: false,
        ndpcApprovalObtained: false,
      },
      ropa: {
        maintained: false,
        includesAllProcessing: false,
        lastReviewed: '2020-01-01',
      },
    };
    const report = getComplianceScore(lowInput);
    render(<NDPRDashboard report={report} maxRecommendations={2} />);
    // Each recommendation item has data-testid="recommendation-item"
    const items = screen.getAllByTestId('recommendation-item');
    expect(items.length).toBe(2);
  });

  it('has the data-ndpr-component attribute on root element', () => {
    const report = getComplianceScore(fullInput);
    const { container } = render(<NDPRDashboard report={report} />);
    expect(container.querySelector('[data-ndpr-component="compliance-dashboard"]')).not.toBeNull();
  });

  it('applies custom classNames', () => {
    const report = getComplianceScore(fullInput);
    const { container } = render(
      <NDPRDashboard report={report} classNames={{ root: 'custom-root-class' }} />,
    );
    expect(container.querySelector('.custom-root-class')).not.toBeNull();
  });

  it('removes default classes when unstyled is true', () => {
    const report = getComplianceScore(fullInput);
    const { container } = render(
      <NDPRDashboard report={report} unstyled classNames={{ root: 'bare-root' }} />,
    );
    const root = container.querySelector('[data-ndpr-component="compliance-dashboard"]');
    expect(root).not.toBeNull();
    expect(root?.className).toBe('bare-root');
  });
});
