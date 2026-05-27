/**
 * Locale wiring regression test for LawfulBasisTracker — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { LawfulBasisTracker } from '../../../components/lawful-basis/LawfulBasisTracker';
import type { NDPRLocale } from '../../../types/locale';
import type { ProcessingActivity } from '../../../types/lawful-basis';

const NOW = 1_700_000_000_000;

const activities: ProcessingActivity[] = [
  {
    id: 'act-1',
    name: 'Customer Onboarding',
    description: 'Collecting personal data',
    lawfulBasis: 'consent',
    lawfulBasisJustification: 'Explicit consent gathered.',
    dataCategories: ['name', 'email'],
    involvesSensitiveData: false,
    dataSubjectCategories: ['customers'],
    purposes: ['signup'],
    retentionPeriod: '3 years',
    crossBorderTransfer: false,
    createdAt: NOW - 86_400_000,
    updatedAt: NOW,
    status: 'active',
  },
];

const yorubaLocale: NDPRLocale = {
  lawfulBasis: {
    title: 'Olùtọpa Ìpilẹ̀ Òfin',
    description: 'Ṣe àkọsílẹ̀ ìpilẹ̀ òfin.',
  },
};

describe('LawfulBasisTracker — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<LawfulBasisTracker activities={activities} />);
    expect(screen.getByRole('heading', { name: /Lawful Basis Tracker/i })).toBeInTheDocument();
    expect(screen.getByText(/NDPA 2023 Section 25/i)).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <LawfulBasisTracker activities={activities} />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Olùtọpa Ìpilẹ̀ Òfin/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Lawful Basis Tracker/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <LawfulBasisTracker activities={activities} title="Custom LB Title" />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Custom LB Title' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Olùtọpa Ìpilẹ̀ Òfin/i }),
    ).not.toBeInTheDocument();
  });
});
