/**
 * Regression test for the 3.10.3 audit finding: NDPRProvider exposed
 * `locale` and `useNDPRLocale()` but no component consumed the hook, so
 * passing a locale to the provider had zero visible effect — the i18n
 * docs page was misleading.
 *
 * This test proves `<NDPRProvider locale={...}>` now actually changes
 * the strings rendered by ConsentBanner. The same wiring follows for
 * DSRRequestForm and BreachReportForm (see their sibling test files).
 *
 * Precedence asserted:
 *   1. explicit prop (e.g. `acceptAllButtonText`) — highest
 *   2. provider's locale (`useNDPRLocale().consent.acceptAll`)
 *   3. English default — lowest
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { ConsentBanner } from '../../../components/consent/ConsentBanner';
import type { NDPRLocale } from '../../../types/locale';
import type { ConsentOption } from '../../../types/consent';

const yorubaLocale: NDPRLocale = {
  consent: {
    title: 'Aṣiri Rẹ Ṣe Pataki Fun Wa',
    description: 'A nlo awọn kuki ati awọn imọ-ẹrọ ti o jọra.',
    acceptAll: 'Gba Gbogbo Rẹ',
    rejectAll: 'Kọ Gbogbo Rẹ',
    customize: 'Tunṣe',
    savePreferences: 'Fi Awọn Yiyan Pamọ',
  },
};

const minimalOptions: ConsentOption[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'usage measurement',
    required: false,
    purpose: 'product analytics',
  },
];

describe('ConsentBanner — locale wiring (3.10.4 fix for B14)', () => {
  it('renders English defaults when no NDPRProvider is mounted', () => {
    render(<ConsentBanner options={minimalOptions} onSave={() => {}} show />);
    expect(screen.getByRole('heading', { name: /We Value Your Privacy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customize/i })).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <ConsentBanner options={minimalOptions} onSave={() => {}} show />
      </NDPRProvider>,
    );

    expect(screen.getByRole('heading', { name: /Aṣiri Rẹ Ṣe Pataki Fun Wa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gba Gbogbo Rẹ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kọ Gbogbo Rẹ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tunṣe/i })).toBeInTheDocument();
    // English fallback must NOT also appear.
    expect(screen.queryByRole('heading', { name: /We Value Your Privacy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Accept All/i })).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <ConsentBanner
          options={minimalOptions}
          onSave={() => {}}
          show
          acceptAllButtonText="OK!"
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('button', { name: 'OK!' })).toBeInTheDocument();
    // Yoruba "Accept All" must NOT show because the prop overrode it.
    expect(screen.queryByRole('button', { name: /Gba Gbogbo Rẹ/i })).not.toBeInTheDocument();
    // But other Yoruba strings still apply.
    expect(screen.getByRole('button', { name: /Kọ Gbogbo Rẹ/i })).toBeInTheDocument();
  });

  it('falls back to English when only some locale keys are provided', () => {
    render(
      <NDPRProvider locale={{ consent: { acceptAll: 'Yes!' } }}>
        <ConsentBanner options={minimalOptions} onSave={() => {}} show />
      </NDPRProvider>,
    );
    // Provided key wins.
    expect(screen.getByRole('button', { name: 'Yes!' })).toBeInTheDocument();
    // Other keys fall back to English (NOT to `undefined`).
    expect(screen.getByRole('button', { name: /Reject All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customize/i })).toBeInTheDocument();
  });
});
