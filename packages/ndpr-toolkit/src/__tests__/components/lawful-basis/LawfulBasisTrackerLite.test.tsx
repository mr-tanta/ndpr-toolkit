import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LawfulBasisTrackerLite } from '../../../components/lawful-basis/LawfulBasisTrackerLite';
import type { ProcessingActivity } from '../../../types/lawful-basis';

const NOW = 1_700_000_000_000;

const createActivity = (overrides: Partial<ProcessingActivity> = {}): ProcessingActivity => ({
  id: 'act-001',
  name: 'Customer Onboarding',
  description: 'Collecting personal data during signup',
  lawfulBasis: 'consent',
  lawfulBasisJustification: 'Explicit consent gathered via signup form with clear notice.',
  dataCategories: ['name', 'email'],
  involvesSensitiveData: false,
  dataSubjectCategories: ['customers'],
  purposes: ['account creation'],
  retentionPeriod: '3 years after account closure',
  crossBorderTransfer: false,
  createdAt: NOW - 86_400_000,
  updatedAt: NOW,
  status: 'active',
  dpoApproval: {
    approved: true,
    approvedBy: 'Adaeze Okafor',
    approvedAt: NOW - 86_400_000,
  },
  ...overrides,
});

describe('LawfulBasisTrackerLite', () => {
  it('renders default title and description, and overrides when provided', () => {
    const { rerender } = render(<LawfulBasisTrackerLite activities={[createActivity()]} />);
    expect(screen.getByRole('heading', { name: /Lawful Basis Tracker/i })).toBeInTheDocument();
    expect(screen.getByText(/NDPA 2023 Section 25/i)).toBeInTheDocument();

    rerender(
      <LawfulBasisTrackerLite
        activities={[createActivity()]}
        title="Custom Title"
        description="Custom description text"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders a row for every activity in the prop array', () => {
    const activities = [
      createActivity({ id: 'a-1', name: 'Activity One' }),
      createActivity({ id: 'a-2', name: 'Activity Two' }),
      createActivity({ id: 'a-3', name: 'Activity Three' }),
    ];
    render(<LawfulBasisTrackerLite activities={activities} showSummary={false} showComplianceGaps={false} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 body rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('Activity One')).toBeInTheDocument();
    expect(screen.getByText('Activity Two')).toBeInTheDocument();
    expect(screen.getByText('Activity Three')).toBeInTheDocument();
  });

  it('shows the summary when showSummary is true and hides it when false', () => {
    const { rerender } = render(
      <LawfulBasisTrackerLite activities={[createActivity()]} showComplianceGaps={false} />,
    );
    expect(screen.getByRole('status', { name: /Compliance summary/i })).toBeInTheDocument();
    expect(screen.getByText('Total Activities')).toBeInTheDocument();

    rerender(
      <LawfulBasisTrackerLite
        activities={[createActivity()]}
        showSummary={false}
        showComplianceGaps={false}
      />,
    );
    expect(screen.queryByRole('status', { name: /Compliance summary/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Total Activities')).not.toBeInTheDocument();
  });

  it('shows compliance gap alerts when gaps exist and toggle is on', () => {
    const activities = [
      createActivity({
        id: 'g-1',
        name: 'Gap Activity',
        dpoApproval: undefined,
      }),
    ];
    render(<LawfulBasisTrackerLite activities={activities} showSummary={false} />);
    expect(screen.getByRole('status', { name: /compliance gaps detected/i })).toBeInTheDocument();
    expect(screen.getByText(/High Priority/i)).toBeInTheDocument();
  });

  it('hides compliance gap alerts when showComplianceGaps is false', () => {
    const activities = [createActivity({ dpoApproval: undefined })];
    render(
      <LawfulBasisTrackerLite
        activities={activities}
        showSummary={false}
        showComplianceGaps={false}
      />,
    );
    expect(screen.queryByText(/High Priority/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /compliance gaps/i })).not.toBeInTheDocument();
  });

  it('renders no write-path buttons (no add/edit/delete/archive/export/save/submit affordances)', () => {
    render(<LawfulBasisTrackerLite activities={[createActivity(), createActivity({ id: 'a-2' })]} />);
    const writeButtons = screen
      .queryAllByRole('button')
      .filter(el => /add|edit|delete|archive|export|save|submit/i.test(el.textContent || ''));
    expect(writeButtons).toHaveLength(0);
  });

  it('makes rows interactive only when onActivityClick is provided, and fires with the right payload', () => {
    const activity = createActivity({ id: 'a-1', name: 'Clickable' });
    const onActivityClick = jest.fn();

    const { rerender } = render(
      <LawfulBasisTrackerLite
        activities={[activity]}
        showSummary={false}
        showComplianceGaps={false}
      />,
    );
    // No handler => row should NOT have role="button"
    expect(screen.queryByRole('button', { name: /View Clickable/i })).not.toBeInTheDocument();

    rerender(
      <LawfulBasisTrackerLite
        activities={[activity]}
        showSummary={false}
        showComplianceGaps={false}
        onActivityClick={onActivityClick}
      />,
    );
    const row = screen.getByRole('button', { name: /View Clickable/i });
    fireEvent.click(row);
    expect(onActivityClick).toHaveBeenCalledTimes(1);
    expect(onActivityClick).toHaveBeenCalledWith(activity);
  });

  it('renders the root with no default tailwind classes when unstyled is true (only consumer classNames)', () => {
    const { container } = render(
      <LawfulBasisTrackerLite
        activities={[createActivity()]}
        unstyled
        classNames={{ root: 'my-root' }}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-root');
    expect(root.className).toBe('my-root');
    expect(root).not.toHaveClass('bg-white');
    expect(root).not.toHaveClass('rounded-lg');
    expect(root).not.toHaveClass('shadow-md');
  });
});
