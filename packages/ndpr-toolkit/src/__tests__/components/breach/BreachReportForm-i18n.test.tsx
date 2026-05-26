/**
 * Locale wiring regression test for BreachReportForm.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { BreachReportForm } from '../../../components/breach/BreachReportForm';
import type { NDPRLocale } from '../../../types/locale';

const yorubaLocale: NDPRLocale = {
  breach: {
    title: 'Sọ Nipa Iṣẹlẹ Data',
    description: 'Lo iwe yii lati sọ nipa iṣẹlẹ data.',
    submitReport: 'Fi Ijabọ ranṣẹ',
  },
};

const categories = [
  { id: 'unauthorized_access', label: 'Unauthorized access', description: 'Someone accessed data without permission' },
];

describe('BreachReportForm — locale wiring (3.10.4)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<BreachReportForm categories={categories} onSubmit={() => {}} />);
    expect(screen.getByRole('heading', { name: /Report a Data Breach/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Report/i })).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <BreachReportForm categories={categories} onSubmit={() => {}} />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: /Sọ Nipa Iṣẹlẹ Data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fi Ijabọ ranṣẹ/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Report a Data Breach/i })).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <BreachReportForm
          categories={categories}
          onSubmit={() => {}}
          submitButtonText="Go"
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fi Ijabọ ranṣẹ/i })).not.toBeInTheDocument();
  });
});
