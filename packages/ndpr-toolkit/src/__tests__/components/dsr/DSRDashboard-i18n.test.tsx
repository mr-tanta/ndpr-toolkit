/**
 * Locale wiring regression test for DSRDashboard — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { DSRDashboard } from '../../../components/dsr/DSRDashboard';
import type { NDPRLocale } from '../../../types/locale';
import type { DSRRequest } from '../../../types/dsr';

const yorubaLocale: NDPRLocale = {
  dsr: {
    dashboardTitle: 'Pápá Iṣẹ́ Ìbéèrè Oní-dátà',
    dashboardDescription: 'Tọpa àti ṣàkóso àwọn ìbéèrè oní-dátà.',
  },
};

const requests: DSRRequest[] = [
  {
    id: '1',
    type: 'access',
    status: 'pending',
    createdAt: 1620000000000,
    updatedAt: 1620000000000,
    subject: { name: 'John Doe', email: 'john@example.com' },
  },
];

describe('DSRDashboard — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<DSRDashboard requests={requests} />);
    expect(
      screen.getByRole('heading', { name: /Data Subject Request Dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Track and manage data subject requests in compliance with NDPA Part IV/i),
    ).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DSRDashboard requests={requests} />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Pápá Iṣẹ́ Ìbéèrè Oní-dátà/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Data Subject Request Dashboard/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DSRDashboard requests={requests} title="My Custom Dashboard" />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: 'My Custom Dashboard' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Pápá Iṣẹ́ Ìbéèrè Oní-dátà/i }),
    ).not.toBeInTheDocument();
  });
});
