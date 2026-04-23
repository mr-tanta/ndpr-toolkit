import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreachRiskAssessment } from '../../../components/breach/BreachRiskAssessment';
import type { BreachReport } from '../../../types/breach';

/**
 * Helper: create a minimal BreachReport for testing.
 */
function createBreachReport(overrides: Partial<BreachReport> = {}): BreachReport {
  return {
    id: 'breach-001',
    title: 'Test Data Breach',
    description: 'Unauthorized access to customer database',
    category: 'unauthorized-access',
    discoveredAt: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    reportedAt: Date.now() - 23 * 60 * 60 * 1000,
    reporter: {
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Security',
    },
    affectedSystems: ['Customer DB', 'Auth Service'],
    dataTypes: ['email', 'phone'],
    estimatedAffectedSubjects: 500,
    status: 'contained',
    ...overrides,
  };
}

/**
 * Helper: set a range slider to a specific value.
 */
function setSlider(labelPattern: RegExp, value: number) {
  const slider = screen.getByLabelText(labelPattern);
  fireEvent.change(slider, { target: { value: String(value) } });
}

/**
 * Helper: submit the assessment form with a justification.
 */
function submitForm(justification = 'Test justification for breach assessment') {
  const textarea = screen.getByLabelText(/justification/i);
  fireEvent.change(textarea, { target: { value: justification } });

  const submitButton = screen.getByRole('button', { name: /complete assessment/i });
  fireEvent.click(submitButton);
}

describe('BreachRiskAssessment', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  it('renders with default title and description', () => {
    render(
      <BreachRiskAssessment
        breachData={createBreachReport()}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Breach Risk Assessment')).toBeInTheDocument();
    expect(
      screen.getByText(/assess the risk level of this data breach/i)
    ).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(
      <BreachRiskAssessment
        breachData={createBreachReport()}
        onComplete={mockOnComplete}
        title="Custom Title"
        description="Custom description text"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('shows breach summary by default', () => {
    const breach = createBreachReport({ title: 'Sensitive Breach' });
    render(
      <BreachRiskAssessment
        breachData={breach}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Breach Summary')).toBeInTheDocument();
    expect(screen.getByText(/Sensitive Breach/)).toBeInTheDocument();
    expect(screen.getByText(/Customer DB, Auth Service/)).toBeInTheDocument();
    expect(screen.getByText(/email, phone/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('hides breach summary when showBreachSummary is false', () => {
    render(
      <BreachRiskAssessment
        breachData={createBreachReport()}
        onComplete={mockOnComplete}
        showBreachSummary={false}
      />
    );

    expect(screen.queryByText('Breach Summary')).not.toBeInTheDocument();
  });

  it('displays impact sliders with default moderate values', () => {
    render(
      <BreachRiskAssessment
        breachData={createBreachReport()}
        onComplete={mockOnComplete}
      />
    );

    // Default value is 3 for all sliders ("Moderate")
    const moderateLabels = screen.getAllByText(/Moderate \(3\)/);
    expect(moderateLabels.length).toBe(5); // 5 sliders: CI, II, AI, HL, HS
  });

  describe('risk level calculation', () => {
    it('calculates low risk when all impacts are set to 1', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 1);
      setSlider(/integrity impact/i, 1);
      setSlider(/availability impact/i, 1);
      setSlider(/likelihood of harm/i, 1);
      setSlider(/severity of harm/i, 1);

      // Score = 1*0.2 + 1*0.1 + 1*0.1 + 1*0.3 + 1*0.3 = 1.0 => low
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('1 / 5')).toBeInTheDocument();
    });

    it('calculates medium risk with moderate-low impacts', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 2);
      setSlider(/integrity impact/i, 2);
      setSlider(/availability impact/i, 2);
      setSlider(/likelihood of harm/i, 2);
      setSlider(/severity of harm/i, 2);

      // Score = 2*0.2 + 2*0.1 + 2*0.1 + 2*0.3 + 2*0.3 = 2.0 => medium
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
    });

    it('calculates high risk with default moderate impacts', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      // Default values are all 3
      // Score = 3*0.2 + 3*0.1 + 3*0.1 + 3*0.3 + 3*0.3 = 3.0 => high
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('calculates critical risk when all impacts are at maximum', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 5);
      setSlider(/integrity impact/i, 5);
      setSlider(/availability impact/i, 5);
      setSlider(/likelihood of harm/i, 5);
      setSlider(/severity of harm/i, 5);

      // Score = 5*0.2 + 5*0.1 + 5*0.1 + 5*0.3 + 5*0.3 = 5.0 => critical
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('5 / 5')).toBeInTheDocument();
    });
  });

  describe('notification requirements', () => {
    it('shows NDPC notification required when risk level is high', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      // Default is high risk (all sliders at 3)
      submitForm();

      expect(screen.getByText('NDPC Notification Required')).toBeInTheDocument();
      expect(screen.getByText(/reported to the NDPC within 72 hours/i)).toBeInTheDocument();
    });

    it('shows NDPC notification not required when risk level is low', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 1);
      setSlider(/integrity impact/i, 1);
      setSlider(/availability impact/i, 1);
      setSlider(/likelihood of harm/i, 1);
      setSlider(/severity of harm/i, 1);

      submitForm();

      expect(screen.getByText('NDPC Notification Not Required')).toBeInTheDocument();
    });

    it('shows NDPC notification required when risksToRightsAndFreedoms is checked even with low scores', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 1);
      setSlider(/integrity impact/i, 1);
      setSlider(/availability impact/i, 1);
      setSlider(/likelihood of harm/i, 1);
      setSlider(/severity of harm/i, 1);

      // Check the risks to rights and freedoms checkbox
      const rightsCheckbox = screen.getByLabelText(/this breach poses a risk to the rights and freedoms/i);
      fireEvent.click(rightsCheckbox);

      submitForm();

      expect(screen.getByText('NDPC Notification Required')).toBeInTheDocument();
    });

    it('shows data subject notification required when highRisksToRightsAndFreedoms is checked', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      const highRisksCheckbox = screen.getByLabelText(/this breach poses a high risk to the rights and freedoms/i);
      fireEvent.click(highRisksCheckbox);

      submitForm();

      expect(screen.getByText(/Required \(NDPA Section 40\(4\)\)/)).toBeInTheDocument();
      expect(screen.getByText(/Prepare communications for affected data subjects/)).toBeInTheDocument();
    });

    it('shows notification deadline and time remaining', () => {
      const discoveredAt = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
      render(
        <BreachRiskAssessment
          breachData={createBreachReport({ discoveredAt })}
          onComplete={mockOnComplete}
        />
      );

      submitForm();

      expect(screen.getByText(/Notification Deadline:/)).toBeInTheDocument();
      expect(screen.getByText(/Time Remaining:/)).toBeInTheDocument();
      // "hours" text appears in multiple places (72 hours text + remaining hours)
      expect(screen.getAllByText(/hours/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('form submission', () => {
    it('calls onComplete with assessment data on submit', () => {
      const breach = createBreachReport();
      render(
        <BreachRiskAssessment
          breachData={breach}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 4);
      setSlider(/likelihood of harm/i, 4);

      submitForm('The breach exposed sensitive customer data');

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      const assessment = mockOnComplete.mock.calls[0][0];
      expect(assessment.breachId).toBe('breach-001');
      expect(assessment.confidentialityImpact).toBe(4);
      expect(assessment.harmLikelihood).toBe(4);
      expect(assessment.justification).toBe('The breach exposed sensitive customer data');
      expect(assessment.riskLevel).toBeDefined();
      expect(assessment.overallRiskScore).toBeDefined();
      expect(assessment.assessedAt).toBeDefined();
    });

    it('shows assessment results after submission', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      submitForm();

      expect(screen.getByText('Assessment Results')).toBeInTheDocument();
      expect(screen.getByText(/Overall Risk Level:/)).toBeInTheDocument();
      expect(screen.getByText(/Risk Score:/)).toBeInTheDocument();
    });

    it('allows editing assessment after submission via Edit Assessment button', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      submitForm();
      expect(screen.getByText('Assessment Results')).toBeInTheDocument();

      const editButton = screen.getByRole('button', { name: /edit assessment/i });
      fireEvent.click(editButton);

      // Form should be visible again
      expect(screen.getByLabelText(/confidentiality impact/i)).toBeInTheDocument();
    });
  });

  describe('contributing factors display', () => {
    it('shows next steps for notification-required breach', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      // Default high risk triggers notification
      submitForm();

      expect(screen.getByText(/Prepare a notification report for the NDPC/)).toBeInTheDocument();
      expect(screen.getByText(/Document all aspects of the breach/)).toBeInTheDocument();
      expect(screen.getByText(/Implement measures to mitigate/)).toBeInTheDocument();
    });

    it('shows next steps for notification-not-required breach', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
        />
      );

      setSlider(/confidentiality impact/i, 1);
      setSlider(/integrity impact/i, 1);
      setSlider(/availability impact/i, 1);
      setSlider(/likelihood of harm/i, 1);
      setSlider(/severity of harm/i, 1);

      submitForm();

      expect(screen.getByText(/Document the breach and this assessment/)).toBeInTheDocument();
      expect(screen.getByText(/Implement measures to prevent similar breaches/)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders with minimal breach data', () => {
      const minimalBreach = createBreachReport({
        estimatedAffectedSubjects: undefined,
        affectedSystems: [],
        dataTypes: [],
      });

      render(
        <BreachRiskAssessment
          breachData={minimalBreach}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Breach Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText(/Unknown/)).toBeInTheDocument(); // estimatedAffectedSubjects
    });

    it('renders with initial assessment values', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
          initialAssessment={{
            confidentialityImpact: 5,
            integrityImpact: 4,
            availabilityImpact: 2,
            harmLikelihood: 5,
            harmSeverity: 5,
            risksToRightsAndFreedoms: true,
            highRisksToRightsAndFreedoms: true,
            justification: 'Pre-filled justification',
          }}
        />
      );

      // Severe (5) appears for confidentialityImpact, harmLikelihood, and harmSeverity
      const severeLabels = screen.getAllByText(/Severe \(5\)/);
      expect(severeLabels.length).toBe(3);
      const textarea = screen.getByLabelText(/justification/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Pre-filled justification');
    });

    it('renders with custom submit button text', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
          submitButtonText="Save Assessment"
        />
      );

      expect(screen.getByRole('button', { name: /save assessment/i })).toBeInTheDocument();
    });

    it('hides notification requirements when showNotificationRequirements is false', () => {
      render(
        <BreachRiskAssessment
          breachData={createBreachReport()}
          onComplete={mockOnComplete}
          showNotificationRequirements={false}
        />
      );

      submitForm();

      expect(screen.queryByText('Notification Requirements')).not.toBeInTheDocument();
    });
  });
});
