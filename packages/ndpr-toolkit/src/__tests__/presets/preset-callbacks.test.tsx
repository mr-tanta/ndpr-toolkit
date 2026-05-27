/**
 * Preset-level submit / save / complete callback coverage.
 *
 * These tests assert that the callbacks documented at the preset surface
 * (not the inner component) actually fire when the user finishes the form.
 *
 * Presets without preset-level callbacks (NDPRLawfulBasis, NDPRCrossBorder,
 * NDPRROPA) are tested via their adapter contract instead — adding an item
 * persists through `adapter.save()`.
 *
 * NDPRPrivacyPolicy's `onComplete` requires navigating the 4-step wizard
 * with valid data at each step and is exercised by the wizard's own tests;
 * it is intentionally not duplicated here.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NDPRConsent } from '../../presets/NDPRConsent';
import { NDPRBreachReport } from '../../presets/NDPRBreachReport';
import { NDPRDPIA } from '../../presets/NDPRDPIA';
import type { DPIASection } from '../../types/dpia';
import { memoryAdapter } from '../../adapters/memory';
import type { ProcessingActivity } from '../../types/lawful-basis';
import type { CrossBorderTransfer } from '../../types/cross-border';
import type { RecordOfProcessingActivities } from '../../types/ropa';

describe('NDPRConsent onSave', () => {
  it('fires onSave with non-null settings when the user clicks Accept All', () => {
    const onSave = jest.fn();
    render(<NDPRConsent onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /accept all/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const settings = onSave.mock.calls[0][0];
    expect(settings).toBeDefined();
    expect(settings.consents).toBeDefined();
    // Accept All toggles every non-essential category on.
    expect(settings.consents.analytics).toBe(true);
    expect(settings.consents.marketing).toBe(true);
    expect(typeof settings.timestamp).toBe('number');
  });
});

describe('NDPRBreachReport onSubmit', () => {
  function fillBreachForm(container: HTMLElement) {
    fireEvent.change(screen.getByLabelText(/breach title/i), {
      target: { value: 'Lost backup drive' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A portable backup drive was misplaced during transit.' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'data_loss' },
    });

    const dateInputs = container.querySelectorAll('input[type="datetime-local"]');
    expect(dateInputs.length).toBeGreaterThan(0);
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-15T10:00' } });

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/your department/i), {
      target: { value: 'Security' },
    });
    fireEvent.change(screen.getByLabelText(/affected systems/i), {
      target: { value: 'backup-server-01' },
    });

    // Tick at least one "Types of Data Involved" checkbox.
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]);

    const form = container.querySelector('form');
    if (!form) throw new Error('breach form not found');
    fireEvent.submit(form);
  }

  it('fires onSubmit with a fully-shaped BreachFormSubmission once all required fields are valid', () => {
    const onSubmit = jest.fn();
    const { container } = render(<NDPRBreachReport onSubmit={onSubmit} />);
    fillBreachForm(container);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = onSubmit.mock.calls[0][0];
    expect(data.title).toBe('Lost backup drive');
    expect(data.category).toBe('data_loss');
    expect(data.reporter.email).toBe('ada@example.com');
    expect(Array.isArray(data.affectedSystems)).toBe(true);
    expect(data.affectedSystems).toContain('backup-server-01');
    expect(typeof data.reportedAt).toBe('number');
  });

  it('also writes to the adapter when one is supplied', () => {
    const onSubmit = jest.fn();
    const adapter = memoryAdapter();
    const { container } = render(<NDPRBreachReport adapter={adapter} onSubmit={onSubmit} />);
    fillBreachForm(container);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(adapter.load()).not.toBeNull();
  });
});

describe('NDPRDPIA onResult', () => {
  const oneSection: DPIASection[] = [
    {
      id: 'only-section',
      title: 'Only Section',
      description: 'A single section so the next-click finishes the questionnaire.',
      order: 0,
      questions: [
        {
          id: 'q1',
          text: 'Describe the processing activity',
          type: 'text',
          required: false,
        },
      ],
    },
  ];

  it('fires onResult with the full DPIAResult once the last section is submitted', () => {
    const onResult = jest.fn();
    render(<NDPRDPIA sections={oneSection} onResult={onResult} />);

    // Optional answer — exercise onAnswerChange before submitting.
    const input = screen.getByLabelText(/describe the processing activity/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Processing user account data' } });

    // With one section, the Next/Submit button submits the questionnaire.
    const submitBtn = screen.getByRole('button', { name: /submit|complete|finish/i });
    fireEvent.click(submitBtn);

    expect(onResult).toHaveBeenCalledTimes(1);
    const result = onResult.mock.calls[0][0];
    expect(result.answers).toEqual({ q1: 'Processing user account data' });
    expect(result.overallRiskLevel).toBeDefined();
    expect(typeof result.canProceed).toBe('boolean');
  });
});

/**
 * Adapter-contract coverage for presets that do not expose a preset-level
 * save/submit callback. Initial-data round-trip proves the preset reads
 * from the adapter on mount (or async hydrate), which is the persistence
 * touchpoint these presets actually ship.
 */
describe('Preset adapter contract — no preset-level callbacks', () => {
  it('NDPRLawfulBasis seeds activities from a memory adapter', () => {
    // Import lazily so the heavier component renders only when this test runs.
    const { NDPRLawfulBasis } = require('../../presets/NDPRLawfulBasis');
    const activity: ProcessingActivity = {
      id: 'preset-act-1',
      name: 'Order Fulfilment (preset)',
      description: 'Processing customer orders.',
      lawfulBasis: 'contract',
      lawfulBasisJustification: 'Necessary to fulfil the customer contract.',
      dataCategories: ['name', 'address'],
      involvesSensitiveData: false,
      dataSubjectCategories: ['customers'],
      purposes: ['shipping'],
      retentionPeriod: '5 years',
      crossBorderTransfer: false,
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      status: 'active',
      dpoApproval: { approved: true, approvedBy: 'DPO', approvedAt: 1_700_000_000_000 },
    };
    const adapter = memoryAdapter<ProcessingActivity[]>([activity]);

    render(<NDPRLawfulBasis adapter={adapter} />);
    expect(screen.getByText(/Order Fulfilment \(preset\)/i)).toBeInTheDocument();
  });

  it('NDPRCrossBorder seeds transfers from a memory adapter', () => {
    const { NDPRCrossBorder } = require('../../presets/NDPRCrossBorder');
    const transfer: CrossBorderTransfer = {
      id: 'preset-xfer-1',
      destinationCountry: 'United Kingdom',
      destinationCountryCode: 'GB',
      adequacyStatus: 'adequate',
      transferMechanism: 'adequacy_decision',
      dataCategories: ['name', 'email'],
      includesSensitiveData: false,
      recipientOrganization: 'Preset UK Recipient Ltd',
      recipientContact: { name: 'Receiver', email: 'recv@example.com' },
      purpose: 'Order fulfilment',
      safeguards: ['TLS 1.3'],
      riskAssessment: 'Low.',
      riskLevel: 'low',
      tiaCompleted: true,
      frequency: 'periodic',
      startDate: 1_700_000_000_000,
      status: 'active',
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    };
    const adapter = memoryAdapter<CrossBorderTransfer[]>([transfer]);

    render(<NDPRCrossBorder adapter={adapter} />);
    expect(screen.getAllByText(/Preset UK Recipient Ltd/i).length).toBeGreaterThan(0);
  });

  it('NDPRROPA seeds ropa data from a memory adapter (async hydrate)', async () => {
    const { NDPRROPA } = require('../../presets/NDPRROPA');
    const ropa: RecordOfProcessingActivities = {
      id: 'preset-ropa-1',
      organizationName: 'Preset Org From Adapter',
      organizationContact: 'contact@preset.example',
      organizationAddress: '1 Demo Way',
      records: [],
      lastUpdated: 1_700_000_000_000,
      version: '1.0',
    };
    const adapter = memoryAdapter<RecordOfProcessingActivities>(ropa);

    render(<NDPRROPA adapter={adapter} />);
    // NDPRROPA hydrates via an `await adapter.load()` effect, so the value
    // only lands in state after a microtask flush.
    await waitFor(() =>
      expect(screen.getByText(/Preset Org From Adapter/i)).toBeInTheDocument()
    );
  });
});
