/**
 * Locale wiring regression test for ROPAManager — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { ROPAManager } from '../../../components/ropa/ROPAManager';
import type { NDPRLocale } from '../../../types/locale';
import type { RecordOfProcessingActivities } from '../../../types/ropa';

const NOW = 1_700_000_000_000;

const ropa: RecordOfProcessingActivities = {
  id: 'ropa-1',
  organizationName: 'Acme Corp',
  organizationContact: 'privacy@acme.example',
  organizationAddress: '123 Lagos St',
  records: [],
  lastUpdated: NOW,
  version: '1.0',
};

const yorubaLocale: NDPRLocale = {
  ropa: {
    title: 'Àkọsílẹ̀ Àwọn Iṣẹ́ Ìṣàkóso',
    description: 'Pa àkọsílẹ̀ mọ́.',
  },
};

describe('ROPAManager — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(<ROPAManager ropa={ropa} />);
    expect(
      screen.getByRole('heading', { name: /Record of Processing Activities/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/accountability principle/i)).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <ROPAManager ropa={ropa} />
      </NDPRProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /Àkọsílẹ̀ Àwọn Iṣẹ́ Ìṣàkóso/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Record of Processing Activities/i }),
    ).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <ROPAManager ropa={ropa} title="Custom ROPA Title" />
      </NDPRProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Custom ROPA Title' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Àkọsílẹ̀ Àwọn Iṣẹ́ Ìṣàkóso/i }),
    ).not.toBeInTheDocument();
  });
});
