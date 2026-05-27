/**
 * Locale wiring regression test for DPIAQuestionnaire — companion to the
 * ConsentBanner-i18n suite. See that file for full rationale.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider } from '../../../components/NDPRProvider';
import { DPIAQuestionnaire } from '../../../components/dpia/DPIAQuestionnaire';
import type { NDPRLocale } from '../../../types/locale';
import type { DPIASection } from '../../../types/dpia';

const yorubaLocale: NDPRLocale = {
  dpia: {
    next: 'Tẹ̀lé',
    previous: 'Sẹ́yìn',
    submit: 'Fi Sílẹ̀',
  },
};

const sections: DPIASection[] = [
  {
    id: 's1',
    title: 'Section 1',
    questions: [{ id: 'q1', text: 'Question one?', type: 'text', required: false }],
  },
  {
    id: 's2',
    title: 'Section 2',
    questions: [{ id: 'q2', text: 'Question two?', type: 'text', required: false }],
  },
];

describe('DPIAQuestionnaire — locale wiring (B14 fix)', () => {
  it('renders English defaults with no NDPRProvider', () => {
    render(
      <DPIAQuestionnaire
        sections={sections}
        answers={{}}
        onAnswerChange={() => {}}
        currentSectionIndex={0}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
  });

  it('renders locale strings when wrapped in <NDPRProvider locale={...}>', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DPIAQuestionnaire
          sections={sections}
          answers={{}}
          onAnswerChange={() => {}}
          currentSectionIndex={0}
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('button', { name: 'Tẹ̀lé' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sẹ́yìn' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('explicit prop overrides win over provider locale', () => {
    render(
      <NDPRProvider locale={yorubaLocale}>
        <DPIAQuestionnaire
          sections={sections}
          answers={{}}
          onAnswerChange={() => {}}
          currentSectionIndex={0}
          nextButtonText="Forward!"
        />
      </NDPRProvider>,
    );
    expect(screen.getByRole('button', { name: 'Forward!' })).toBeInTheDocument();
    // Yoruba "Tẹ̀lé" must NOT show because the prop overrode it.
    expect(screen.queryByRole('button', { name: 'Tẹ̀lé' })).not.toBeInTheDocument();
    // But other locale strings still apply.
    expect(screen.getByRole('button', { name: 'Sẹ́yìn' })).toBeInTheDocument();
  });
});
