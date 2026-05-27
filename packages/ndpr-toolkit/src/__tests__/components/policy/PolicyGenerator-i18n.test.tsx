/**
 * Locale wiring regression test for PolicyGenerator — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { PolicyGenerator } from '../../../components/policy/PolicyGenerator';
import type { NDPRLocale } from '../../../types/locale';

const yorubaLocale: NDPRLocale = {
  policy: {
    generatorTitle: 'Olùpilẹ̀ṣẹ̀ Ìlànà Àṣírí NDPA',
    generatorDescription: 'Ṣẹ̀dá ìlànà àṣírí.',
    generate: 'Ṣẹ̀dá Ìlànà',
  },
};

describe('PolicyGenerator — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<PolicyGenerator onGenerate={() => {}} />);
    expect(
      screen.getByRole('heading', { name: /NDPA Privacy Policy Generator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Generate an NDPA-compliant privacy policy/i),
    ).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <PolicyGenerator onGenerate={() => {}} />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Olùpilẹ̀ṣẹ̀ Ìlànà Àṣírí NDPA/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /NDPA Privacy Policy Generator/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <PolicyGenerator onGenerate={() => {}} title="Custom Policy Tool" />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Custom Policy Tool' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Olùpilẹ̀ṣẹ̀ Ìlànà Àṣírí NDPA/i }),
    ).not.toBeInTheDocument();
  });
});
