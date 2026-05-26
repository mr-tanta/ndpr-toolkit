/**
 * Locale wiring regression test for DSRRequestForm — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { DSRRequestForm } from '../../../components/dsr/DSRRequestForm';
import type { NDPRLocale } from '../../../types/locale';

const yorubaLocale: NDPRLocale = {
  dsr: {
    title: 'Bere Iwe Eto Ojuse Olukopa',
    description: 'Lo iwe yi lati lo awọn ẹtọ rẹ.',
    submitRequest: 'Fi Bere ranṣẹ',
  },
};

const requestTypes = [
  {
    id: 'access',
    label: 'Access',
    description: 'View my data',
    estimatedCompletionDays: 30,
  },
];

describe('DSRRequestForm — locale wiring (3.10.4)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<DSRRequestForm requestTypes={requestTypes} onSubmit={() => {}} />);
    expect(screen.getByRole('heading', { name: /Submit a Data Subject Request/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DSRRequestForm requestTypes={requestTypes} onSubmit={() => {}} />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: /Bere Iwe Eto Ojuse Olukopa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fi Bere ranṣẹ/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Submit a Data Subject Request/i })).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DSRRequestForm
          requestTypes={requestTypes}
          onSubmit={() => {}}
          submitButtonText="Send!"
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('button', { name: 'Send!' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fi Bere ranṣẹ/i })).not.toBeInTheDocument();
  });
});
