import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrossBorderTransferManagerLite } from '../../../components/cross-border/CrossBorderTransferManagerLite';
import type { CrossBorderTransfer } from '../../../types/cross-border';

const NOW = 1_700_000_000_000;

const createTransfer = (overrides: Partial<CrossBorderTransfer> = {}): CrossBorderTransfer => ({
  id: 'xfer-001',
  destinationCountry: 'United Kingdom',
  destinationCountryCode: 'GB',
  adequacyStatus: 'adequate',
  transferMechanism: 'adequacy_decision',
  dataCategories: ['name', 'email'],
  includesSensitiveData: false,
  recipientOrganization: 'Acme UK Ltd',
  recipientContact: {
    name: 'Jane Williams',
    email: 'jane@acme.example.com',
  },
  purpose: 'Customer order fulfilment',
  safeguards: ['TLS 1.3', 'AES-256 at rest'],
  riskAssessment: 'Low risk — UK has adequacy.',
  riskLevel: 'low',
  tiaCompleted: true,
  frequency: 'periodic',
  startDate: NOW - 86_400_000 * 90,
  status: 'active',
  createdAt: NOW - 86_400_000 * 90,
  updatedAt: NOW,
  ...overrides,
});

describe('CrossBorderTransferManagerLite', () => {
  it('renders default title and description, and overrides when provided', () => {
    const { rerender } = render(
      <CrossBorderTransferManagerLite transfers={[createTransfer()]} />,
    );
    expect(
      screen.getByRole('heading', { name: /Cross-Border Data Transfer Manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NDPA 2023 Part VI/i)).toBeInTheDocument();

    rerender(
      <CrossBorderTransferManagerLite
        transfers={[createTransfer()]}
        title="Custom Transfer Title"
        description="Custom transfer description"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Custom Transfer Title' })).toBeInTheDocument();
    expect(screen.getByText('Custom transfer description')).toBeInTheDocument();
  });

  it('renders a row for every transfer in the prop array', () => {
    const transfers = [
      createTransfer({ id: 't-1', destinationCountry: 'United Kingdom', updatedAt: NOW - 1 }),
      createTransfer({ id: 't-2', destinationCountry: 'Germany', updatedAt: NOW - 2 }),
      createTransfer({ id: 't-3', destinationCountry: 'Kenya', updatedAt: NOW - 3 }),
    ];
    render(
      <CrossBorderTransferManagerLite
        transfers={transfers}
        showSummary={false}
        showRiskAlerts={false}
      />,
    );
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 body rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Kenya')).toBeInTheDocument();
  });

  it('shows the summary when showSummary is true and hides it when false', () => {
    const { rerender } = render(
      <CrossBorderTransferManagerLite transfers={[createTransfer()]} showRiskAlerts={false} />,
    );
    expect(screen.getByRole('status', { name: /Transfer compliance summary/i })).toBeInTheDocument();
    expect(screen.getByText('Active Transfers')).toBeInTheDocument();

    rerender(
      <CrossBorderTransferManagerLite
        transfers={[createTransfer()]}
        showSummary={false}
        showRiskAlerts={false}
      />,
    );
    expect(
      screen.queryByRole('status', { name: /Transfer compliance summary/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Active Transfers')).not.toBeInTheDocument();
  });

  it('shows risk alerts when high-risk active transfers exist and toggle is on', () => {
    const transfers = [createTransfer({ id: 'hi-1', riskLevel: 'high', status: 'active' })];
    render(<CrossBorderTransferManagerLite transfers={transfers} showSummary={false} />);
    const alert = screen.getByRole('alert', { name: /Cross-border transfer risk alerts/i });
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/high-risk active transfer/i);
  });

  it('hides risk alerts when showRiskAlerts is false even with high-risk transfers', () => {
    const transfers = [createTransfer({ id: 'hi-1', riskLevel: 'high', status: 'active' })];
    render(
      <CrossBorderTransferManagerLite
        transfers={transfers}
        showSummary={false}
        showRiskAlerts={false}
      />,
    );
    expect(
      screen.queryByRole('alert', { name: /Cross-border transfer risk alerts/i }),
    ).not.toBeInTheDocument();
  });

  it('renders no write-path buttons (no add/edit/delete/archive/export/save/submit affordances)', () => {
    render(
      <CrossBorderTransferManagerLite
        transfers={[createTransfer(), createTransfer({ id: 't-2' })]}
      />,
    );
    const writeButtons = screen
      .queryAllByRole('button')
      .filter(el => /add|edit|delete|archive|export|save|submit/i.test(el.textContent || ''));
    expect(writeButtons).toHaveLength(0);
  });

  it('makes rows interactive only when onTransferClick is provided, and fires with the right payload', () => {
    const transfer = createTransfer({ id: 't-1', destinationCountry: 'United Kingdom' });
    const onTransferClick = jest.fn();

    const { rerender } = render(
      <CrossBorderTransferManagerLite
        transfers={[transfer]}
        showSummary={false}
        showRiskAlerts={false}
      />,
    );
    // No handler => no role="button" on rows.
    expect(
      screen.queryByRole('button', { name: /View transfer to United Kingdom/i }),
    ).not.toBeInTheDocument();

    rerender(
      <CrossBorderTransferManagerLite
        transfers={[transfer]}
        showSummary={false}
        showRiskAlerts={false}
        onTransferClick={onTransferClick}
      />,
    );
    const row = screen.getByRole('button', { name: /View transfer to United Kingdom/i });
    fireEvent.click(row);
    expect(onTransferClick).toHaveBeenCalledTimes(1);
    expect(onTransferClick).toHaveBeenCalledWith(transfer);
  });

  it('renders the root with no default tailwind classes when unstyled is true (only consumer classNames)', () => {
    const { container } = render(
      <CrossBorderTransferManagerLite
        transfers={[createTransfer()]}
        unstyled
        classNames={{ root: 'my-xb-root' }}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-xb-root');
    expect(root.className).toBe('my-xb-root');
    expect(root).not.toHaveClass('bg-white');
    expect(root).not.toHaveClass('rounded-lg');
    expect(root).not.toHaveClass('shadow-md');
  });
});
