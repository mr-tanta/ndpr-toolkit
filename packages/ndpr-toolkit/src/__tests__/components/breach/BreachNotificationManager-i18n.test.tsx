/**
 * Locale wiring regression test for BreachNotificationManager — companion to
 * the ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { BreachNotificationManager } from '../../../components/breach/BreachNotificationManager';
import type { NDPRLocale } from '../../../types/locale';
import type { BreachReport } from '../../../types/breach';

const yorubaLocale: NDPRLocale = {
  breach: {
    notificationManagerTitle: 'Olùṣàkóso Ìfitónilétí Ìrúfin',
    notificationManagerDescription: 'Ṣàkóso ìfitónilétí ìrúfin dátà.',
  },
};

const sampleBreaches: BreachReport[] = [
  {
    id: 'breach-1',
    title: 'Test Breach',
    description: 'A test data breach',
    category: 'unauthorized-access',
    discoveredAt: Date.now() - 24 * 60 * 60 * 1000,
    reportedAt: Date.now() - 23 * 60 * 60 * 1000,
    reporter: { name: 'Jane Doe', email: 'jane@example.com', department: 'IT' },
    affectedSystems: ['Database'],
    dataTypes: ['email'],
    estimatedAffectedSubjects: 10,
    status: 'ongoing',
  },
];

describe('BreachNotificationManager — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(
      <BreachNotificationManager
        breachReports={sampleBreaches}
        riskAssessments={[]}
        regulatoryNotifications={[]}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /Breach Notification Manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/manage data breach notifications/i)).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <BreachNotificationManager
          breachReports={sampleBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
        />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Olùṣàkóso Ìfitónilétí Ìrúfin/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Breach Notification Manager/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <BreachNotificationManager
          breachReports={sampleBreaches}
          riskAssessments={[]}
          regulatoryNotifications={[]}
          title="Custom Manager"
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Custom Manager' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Olùṣàkóso Ìfitónilétí Ìrúfin/i }),
    ).not.toBeInTheDocument();
  });
});
