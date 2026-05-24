import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ROPAManagerLite } from '../../../components/ropa/ROPAManagerLite';
import type { ProcessingRecord } from '../../../types/ropa';

const NOW = 1_700_000_000_000;

const createRecord = (overrides: Partial<ProcessingRecord> = {}): ProcessingRecord => ({
  id: 'rec-001',
  name: 'Employee Payroll Processing',
  description: 'Monthly payroll computation and disbursement.',
  controllerDetails: {
    name: 'NaijaTech Solutions Ltd',
    contact: 'privacy@naijatech.example.com',
    address: '15 Broad Street, Lagos',
  },
  lawfulBasis: 'contract',
  lawfulBasisJustification:
    'Processing is necessary to fulfil the employment contract with each employee.',
  purposes: ['salary computation', 'tax remittance'],
  dataCategories: ['name', 'bank account number'],
  dataSubjectCategories: ['employees'],
  recipients: ['payroll processor', 'tax authority'],
  retentionPeriod: '7 years after employment ends',
  securityMeasures: ['encrypted database', 'role-based access'],
  dataSource: 'data_subject',
  dpiaRequired: false,
  automatedDecisionMaking: false,
  status: 'active',
  department: 'Human Resources',
  createdAt: NOW - 86_400_000 * 365,
  updatedAt: NOW,
  lastReviewedAt: NOW - 86_400_000 * 30,
  nextReviewDate: NOW + 86_400_000 * 335,
  ...overrides,
});

describe('ROPAManagerLite', () => {
  it('renders default title and description, and overrides when provided', () => {
    const { rerender } = render(<ROPAManagerLite records={[createRecord()]} />);
    expect(
      screen.getByRole('heading', { name: /Record of Processing Activities/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/accountability principle/i)).toBeInTheDocument();

    rerender(
      <ROPAManagerLite
        records={[createRecord()]}
        title="Custom ROPA Title"
        description="Custom ROPA description"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Custom ROPA Title' })).toBeInTheDocument();
    expect(screen.getByText('Custom ROPA description')).toBeInTheDocument();
  });

  it('renders a row for every record in the prop array', () => {
    const records = [
      createRecord({ id: 'r-1', name: 'Payroll' }),
      createRecord({ id: 'r-2', name: 'Recruiting' }),
      createRecord({ id: 'r-3', name: 'Marketing CRM' }),
    ];
    render(<ROPAManagerLite records={records} showSummary={false} showComplianceGaps={false} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 body rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('Recruiting')).toBeInTheDocument();
    expect(screen.getByText('Marketing CRM')).toBeInTheDocument();
  });

  it('shows the summary when showSummary is true and hides it when false', () => {
    const { rerender } = render(
      <ROPAManagerLite records={[createRecord()]} showComplianceGaps={false} />,
    );
    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('By Lawful Basis')).toBeInTheDocument();

    rerender(
      <ROPAManagerLite records={[createRecord()]} showSummary={false} showComplianceGaps={false} />,
    );
    expect(screen.queryByText('Total Records')).not.toBeInTheDocument();
    expect(screen.queryByText('By Lawful Basis')).not.toBeInTheDocument();
  });

  it('shows compliance gap alerts when gaps exist and toggle is on', () => {
    // Create a record that is missing required fields to trigger gaps.
    const recordWithGaps = createRecord({
      id: 'gap-1',
      name: 'Incomplete Record',
      // Force gaps: empty data categories + missing security measures
      dataCategories: [],
      securityMeasures: [],
    });
    render(<ROPAManagerLite records={[recordWithGaps]} showSummary={false} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Compliance Gaps Detected/i)).toBeInTheDocument();
  });

  it('renders no write-path buttons (no add/edit/delete/archive/export/save/submit affordances)', () => {
    render(<ROPAManagerLite records={[createRecord(), createRecord({ id: 'r-2' })]} />);
    const writeButtons = screen
      .queryAllByRole('button')
      .filter(el => /add|edit|delete|archive|export|save|submit/i.test(el.textContent || ''));
    expect(writeButtons).toHaveLength(0);
  });

  it('makes rows interactive only when onRecordClick is provided, and fires with the right payload', () => {
    const record = createRecord({ id: 'r-1', name: 'Clickable Record' });
    const onRecordClick = jest.fn();

    const { rerender } = render(
      <ROPAManagerLite records={[record]} showSummary={false} showComplianceGaps={false} />,
    );
    // No handler => no row buttons.
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    rerender(
      <ROPAManagerLite
        records={[record]}
        showSummary={false}
        showComplianceGaps={false}
        onRecordClick={onRecordClick}
      />,
    );
    const rowButtons = screen.getAllByRole('button');
    expect(rowButtons).toHaveLength(1);
    fireEvent.click(rowButtons[0]);
    expect(onRecordClick).toHaveBeenCalledTimes(1);
    expect(onRecordClick).toHaveBeenCalledWith(record);
  });

  it('renders the root with no default tailwind classes when unstyled is true (only consumer classNames)', () => {
    const { container } = render(
      <ROPAManagerLite records={[createRecord()]} unstyled classNames={{ root: 'my-ropa-root' }} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-ropa-root');
    expect(root.className).toBe('my-ropa-root');
    expect(root).not.toHaveClass('bg-white');
    expect(root).not.toHaveClass('rounded-lg');
    expect(root).not.toHaveClass('shadow-md');
  });
});
