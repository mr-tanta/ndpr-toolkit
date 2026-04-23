import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreachNotificationManager } from '../../../components/breach/BreachNotificationManager';
import type { BreachReport, RiskAssessment, RegulatoryNotification } from '../../../types/breach';

/**
 * Helper: create a BreachReport with sensible defaults.
 */
function createBreachReport(overrides: Partial<BreachReport> & { id: string }): BreachReport {
  return {
    title: 'Test Breach',
    description: 'A test data breach incident',
    category: 'unauthorized-access',
    discoveredAt: Date.now() - 24 * 60 * 60 * 1000,
    reportedAt: Date.now() - 23 * 60 * 60 * 1000,
    reporter: { name: 'Jane Doe', email: 'jane@example.com', department: 'IT' },
    affectedSystems: ['Database'],
    dataTypes: ['email'],
    estimatedAffectedSubjects: 100,
    status: 'ongoing',
    ...overrides,
  };
}

/**
 * Helper: create a RiskAssessment.
 */
function createRiskAssessment(
  breachId: string,
  overrides: Partial<RiskAssessment> = {}
): RiskAssessment {
  return {
    id: `assessment-${breachId}`,
    breachId,
    assessedAt: Date.now() - 20 * 60 * 60 * 1000,
    assessor: { name: 'DPO', role: 'Data Protection Officer', email: 'dpo@example.com' },
    confidentialityImpact: 3,
    integrityImpact: 3,
    availabilityImpact: 3,
    harmLikelihood: 3,
    harmSeverity: 3,
    overallRiskScore: 3,
    riskLevel: 'high',
    risksToRightsAndFreedoms: true,
    highRisksToRightsAndFreedoms: false,
    justification: 'Significant data exposure',
    ...overrides,
  };
}

/**
 * Helper: create a RegulatoryNotification.
 */
function createNotification(
  breachId: string,
  overrides: Partial<RegulatoryNotification> = {}
): RegulatoryNotification {
  return {
    id: `notification-${breachId}`,
    breachId,
    sentAt: Date.now() - 10 * 60 * 60 * 1000,
    method: 'email',
    content: 'NDPC notification content',
    referenceNumber: 'REF-001',
    ndpcContact: { name: 'NDPC Officer', email: 'officer@ndpc.gov.ng' },
    ...overrides,
  };
}

// Shared test data
const breachOngoing = createBreachReport({
  id: 'breach-1',
  title: 'Customer DB Breach',
  status: 'ongoing',
  affectedSystems: ['Customer DB'],
  dataTypes: ['email', 'phone'],
  estimatedAffectedSubjects: 5000,
  description: 'Unauthorized access to customer database',
});

const breachContained = createBreachReport({
  id: 'breach-2',
  title: 'Email Server Incident',
  status: 'contained',
  affectedSystems: ['Email Server'],
  dataTypes: ['email'],
  estimatedAffectedSubjects: 200,
  description: 'Email server compromise',
});

const breachResolved = createBreachReport({
  id: 'breach-3',
  title: 'Resolved Minor Leak',
  status: 'resolved',
  affectedSystems: ['Internal Wiki'],
  dataTypes: ['name'],
  estimatedAffectedSubjects: 10,
  description: 'Minor data leak now resolved',
});

const allBreaches = [breachOngoing, breachContained, breachResolved];

describe('BreachNotificationManager', () => {
  const mockOnSelectBreach = jest.fn();
  const mockOnRequestAssessment = jest.fn();
  const mockOnRequestNotification = jest.fn();

  beforeEach(() => {
    mockOnSelectBreach.mockClear();
    mockOnRequestAssessment.mockClear();
    mockOnRequestNotification.mockClear();
  });

  describe('rendering', () => {
    it('renders with default title and description', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText('Breach Notification Manager')).toBeInTheDocument();
      expect(
        screen.getByText(/manage data breach notifications/i)
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          title="Custom Manager"
          description="Custom description"
        />
      );

      expect(screen.getByText('Custom Manager')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('shows empty state when no breaches exist', () => {
      render(
        <BreachNotificationManager
          breachReports={[]}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText(/no breach reports found/i)).toBeInTheDocument();
    });
  });

  describe('breach list', () => {
    it('renders all breaches in the list', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      // First breach appears in both the list and detail panel (auto-selected)
      expect(screen.getAllByText('Customer DB Breach').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Email Server Incident')).toBeInTheDocument();
      expect(screen.getByText('Resolved Minor Leak')).toBeInTheDocument();
    });

    it('displays status badges for each breach', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      // Status text appears in both filter <option> elements and badge <span> elements.
      // Use getAllByText to account for duplicates.
      expect(screen.getAllByText('Ongoing').length).toBeGreaterThanOrEqual(2); // option + badge(s)
      expect(screen.getAllByText('Contained').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Resolved').length).toBeGreaterThanOrEqual(2);
    });

    it('shows risk level badge when assessment exists', () => {
      const assessment = createRiskAssessment('breach-1', { riskLevel: 'high' });
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      // "High" appears in list badge and detail panel
      expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('status filtering', () => {
    it('filters breaches by ongoing status', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const statusFilter = screen.getByLabelText(/status filter/i);
      fireEvent.change(statusFilter, { target: { value: 'ongoing' } });

      // Customer DB Breach may appear in both list and detail panel
      expect(screen.getAllByText('Customer DB Breach').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Email Server Incident')).not.toBeInTheDocument();
      expect(screen.queryByText('Resolved Minor Leak')).not.toBeInTheDocument();
    });

    it('filters breaches by contained status', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const statusFilter = screen.getByLabelText(/status filter/i);
      fireEvent.change(statusFilter, { target: { value: 'contained' } });

      expect(screen.queryByText('Customer DB Breach')).not.toBeInTheDocument();
      // Email Server Incident appears in both list and detail panel (auto-selected)
      expect(screen.getAllByText('Email Server Incident').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Resolved Minor Leak')).not.toBeInTheDocument();
    });

    it('filters breaches by resolved status', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const statusFilter = screen.getByLabelText(/status filter/i);
      fireEvent.change(statusFilter, { target: { value: 'resolved' } });

      expect(screen.queryByText('Customer DB Breach')).not.toBeInTheDocument();
      expect(screen.queryByText('Email Server Incident')).not.toBeInTheDocument();
      // Resolved Minor Leak appears in both list and detail panel (auto-selected)
      expect(screen.getAllByText('Resolved Minor Leak').length).toBeGreaterThanOrEqual(1);
    });

    it('shows all breaches when filter is set to all', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const statusFilter = screen.getByLabelText(/status filter/i);

      // First filter to ongoing, then back to all
      fireEvent.change(statusFilter, { target: { value: 'ongoing' } });
      fireEvent.change(statusFilter, { target: { value: 'all' } });

      expect(screen.getAllByText('Customer DB Breach').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Email Server Incident')).toBeInTheDocument();
      expect(screen.getByText('Resolved Minor Leak')).toBeInTheDocument();
    });
  });

  describe('breach selection and details', () => {
    it('auto-selects the first breach and shows its details', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      // The first breach details should be visible (title appears in detail panel)
      // The breach list shows titles, and the detail panel also shows the selected breach title
      expect(screen.getByText(/Unauthorized access to customer database/)).toBeInTheDocument();
    });

    it('calls onSelectBreach when a breach is clicked', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          onSelectBreach={mockOnSelectBreach}
        />
      );

      fireEvent.click(screen.getByText('Email Server Incident'));

      expect(mockOnSelectBreach).toHaveBeenCalledWith('breach-2');
    });

    it('shows breach details when selected', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      fireEvent.click(screen.getByText('Email Server Incident'));

      expect(screen.getByText(/Email server compromise/)).toBeInTheDocument();
    });

    it('shows affected systems and data types in breach details', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      // First breach is auto-selected, its details are shown
      expect(screen.getByText(/Unauthorized access to customer database/)).toBeInTheDocument();
      expect(screen.getByText(/email, phone/)).toBeInTheDocument();
      expect(screen.getByText(/5000/)).toBeInTheDocument();
    });
  });

  describe('risk assessment section', () => {
    it('shows "not conducted" message when no assessment exists', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          onRequestAssessment={mockOnRequestAssessment}
        />
      );

      expect(screen.getByText(/risk assessment has not been conducted/i)).toBeInTheDocument();
    });

    it('shows Conduct Risk Assessment button when no assessment exists', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          onRequestAssessment={mockOnRequestAssessment}
        />
      );

      const assessButton = screen.getByRole('button', { name: /conduct risk assessment/i });
      fireEvent.click(assessButton);

      expect(mockOnRequestAssessment).toHaveBeenCalledWith('breach-1');
    });

    it('shows risk assessment details when assessment exists', () => {
      const assessment = createRiskAssessment('breach-1', {
        riskLevel: 'high',
        overallRiskScore: 3.5,
        risksToRightsAndFreedoms: true,
        highRisksToRightsAndFreedoms: false,
        justification: 'Significant exposure of personal data',
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText('3.5 / 5')).toBeInTheDocument();
      expect(screen.getByText(/Significant exposure of personal data/)).toBeInTheDocument();
    });
  });

  describe('72-hour countdown and notification status', () => {
    it('shows notification required when assessment indicates risk to rights', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      // "notification is required" appears in multiple places (deadline alert + notification status)
      const requiredElements = screen.getAllByText(/notification is required/i);
      expect(requiredElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows notification not required for low-risk breach without rights risk', () => {
      const assessment = createRiskAssessment('breach-1', {
        riskLevel: 'low',
        risksToRightsAndFreedoms: false,
        highRisksToRightsAndFreedoms: false,
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      // "not required" text can appear in both deadline alert and notification status sections
      const notRequiredElements = screen.getAllByText(/not required/i);
      expect(notRequiredElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows notification sent status when notification exists', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });
      const notification = createNotification('breach-1');

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[notification]}
        />
      );

      // "Notification Sent" may appear in both the deadline alert and notification status
      const sentElements = screen.getAllByText('Notification Sent');
      expect(sentElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows Generate Notification button when notification is required but not sent', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
          onRequestNotification={mockOnRequestNotification}
        />
      );

      const notifyButton = screen.getByRole('button', { name: /generate notification/i });
      fireEvent.click(notifyButton);

      expect(mockOnRequestNotification).toHaveBeenCalledWith('breach-1');
    });

    it('shows deadline passed alert for expired 72-hour window', () => {
      const expiredBreach = createBreachReport({
        id: 'breach-expired',
        title: 'Expired Deadline Breach',
        discoveredAt: Date.now() - 80 * 60 * 60 * 1000, // 80 hours ago (past 72h)
        status: 'ongoing',
      });

      const assessment = createRiskAssessment('breach-expired', {
        risksToRightsAndFreedoms: true,
      });

      render(
        <BreachNotificationManager
          breachReports={[expiredBreach]}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      const deadlineElements = screen.getAllByText(/deadline passed/i);
      expect(deadlineElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('notification timeline', () => {
    it('shows breach discovered step as completed', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText('Notification Timeline')).toBeInTheDocument();
      expect(screen.getByText('Breach Discovered')).toBeInTheDocument();
    });

    it('shows risk assessment step as pending when no assessment', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      // "Risk Assessment" appears as both a section heading and a timeline step
      expect(screen.getAllByText('Risk Assessment').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/risk assessment has not been completed/i)).toBeInTheDocument();
    });

    it('shows risk assessment step as completed when assessment exists', () => {
      const assessment = createRiskAssessment('breach-1');

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText(/risk assessment completed on/i)).toBeInTheDocument();
    });

    it('shows NDPC notification step when notification is required', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText('NDPC Notification')).toBeInTheDocument();
      expect(screen.getByText(/notification must be sent to the NDPC by/i)).toBeInTheDocument();
    });

    it('shows data subject notification step when high risks flagged', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
        highRisksToRightsAndFreedoms: true,
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[]}
        />
      );

      expect(screen.getByText('Data Subject Notification')).toBeInTheDocument();
    });

    it('hides timeline when showNotificationTimeline is false', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          showNotificationTimeline={false}
        />
      );

      expect(screen.queryByText('Notification Timeline')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters breaches by search term matching title', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Customer' } });

      // Customer DB Breach appears in list and detail panel
      expect(screen.getAllByText('Customer DB Breach').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Email Server Incident')).not.toBeInTheDocument();
      expect(screen.queryByText('Resolved Minor Leak')).not.toBeInTheDocument();
    });

    it('shows no results when search yields nothing', () => {
      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      );

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent-xyz' } });

      expect(screen.getByText(/no breach reports found/i)).toBeInTheDocument();
    });
  });

  describe('notification details', () => {
    it('shows notification reference number and contact', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });
      const notification = createNotification('breach-1', {
        referenceNumber: 'NDPC-2024-001',
        ndpcContact: { name: 'Commissioner Adeyemi', email: 'adeyemi@ndpc.gov.ng' },
      });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[notification]}
        />
      );

      expect(screen.getByText(/NDPC-2024-001/)).toBeInTheDocument();
      expect(screen.getByText(/Commissioner Adeyemi/)).toBeInTheDocument();
    });

    it('shows notification method', () => {
      const assessment = createRiskAssessment('breach-1', {
        risksToRightsAndFreedoms: true,
      });
      const notification = createNotification('breach-1', { method: 'portal' });

      render(
        <BreachNotificationManager
          breachReports={allBreaches}
          riskAssessments={[assessment]}
          regulatoryNotifications={[notification]}
        />
      );

      expect(screen.getByText(/Portal/)).toBeInTheDocument();
    });
  });
});
