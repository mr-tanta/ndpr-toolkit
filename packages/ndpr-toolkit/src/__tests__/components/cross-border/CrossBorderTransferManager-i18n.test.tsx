/**
 * Locale wiring regression test for CrossBorderTransferManager — companion to
 * the ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { CrossBorderTransferManager } from '../../../components/cross-border/CrossBorderTransferManager';
import type { NDPRLocale } from '../../../types/locale';
import type { CrossBorderTransfer } from '../../../types/cross-border';

const NOW = 1_700_000_000_000;

const transfers: CrossBorderTransfer[] = [
  {
    id: 'xfer-1',
    destinationCountry: 'United Kingdom',
    destinationCountryCode: 'GB',
    adequacyStatus: 'adequate',
    transferMechanism: 'adequacy_decision',
    dataCategories: ['name', 'email'],
    includesSensitiveData: false,
    recipientOrganization: 'Acme UK Ltd',
    recipientContact: { name: 'Jane', email: 'jane@acme.example.com' },
    purpose: 'Fulfilment',
    safeguards: ['TLS'],
    riskAssessment: 'Low risk',
    riskLevel: 'low',
    tiaCompleted: true,
    frequency: 'periodic',
    startDate: NOW - 86_400_000 * 30,
    status: 'active',
    createdAt: NOW - 86_400_000 * 30,
    updatedAt: NOW,
  },
];

const yorubaLocale: NDPRLocale = {
  crossBorder: {
    title: 'Olùṣàkóso Gbígbé Dátà Kọjá-Ààlà',
    description: 'Ṣàkóso gbígbé dátà.',
  },
};

describe('CrossBorderTransferManager — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<CrossBorderTransferManager transfers={transfers} />);
    expect(
      screen.getByRole('heading', { name: /Cross-Border Data Transfer Manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NDPA 2023 Part VI/i)).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <CrossBorderTransferManager transfers={transfers} />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Olùṣàkóso Gbígbé Dátà Kọjá-Ààlà/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Cross-Border Data Transfer Manager/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <CrossBorderTransferManager transfers={transfers} title="Custom Transfer Manager" />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Custom Transfer Manager' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Olùṣàkóso Gbígbé Dátà Kọjá-Ààlà/i }),
    ).not.toBeInTheDocument();
  });
});
