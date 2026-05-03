/**
 * Structural smoke test for the 3.5 BEM migration.
 *
 * For every migrated public component, asserts:
 *   1. The rendered root element carries a `data-ndpr-component` attribute,
 *      so consumers can target it with their own CSS without depending on
 *      our internal class names.
 *   2. At least one `.ndpr-*` BEM class lands on the rendered tree, proving
 *      the component reaches the styled defaults from `dist/styles.css`
 *      with no consumer config.
 *
 * This is the regression guard that complements the per-component class
 * tests: if a future refactor accidentally drops the structural BEM root
 * from any component, this test fires.
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';

import { ConsentBanner } from '../components/consent/ConsentBanner';
import { ConsentManager } from '../components/consent/ConsentManager';
import { DSRRequestForm } from '../components/dsr/DSRRequestForm';
import { DPIAQuestionnaire } from '../components/dpia/DPIAQuestionnaire';

import type { ConsentOption } from '../types/consent';
import type { DPIASection } from '../types/dpia';

afterEach(cleanup);

const consentOptions: ConsentOption[] = [
  { id: 'necessary', label: 'Necessary', description: 'Essential.', purpose: 'core', required: true },
];

const dpiaSections: DPIASection[] = [
  {
    id: 's1',
    title: 'Section 1',
    description: 'Test section.',
    questions: [
      { id: 'q1', text: 'Question one?', type: 'text', required: false },
    ],
  },
];

const dsrRequestTypes = [
  { id: 'access', name: 'Access', description: 'Access your data.', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
];

interface Case {
  name: string;
  slug: string;
  render: () => ReturnType<typeof render>;
}

const cases: Case[] = [
  {
    name: 'ConsentBanner',
    slug: 'consent-banner',
    render: () => render(
      <ConsentBanner options={consentOptions} onSave={jest.fn()} position="inline" />,
    ),
  },
  {
    name: 'ConsentManager',
    slug: 'consent-manager',
    render: () => render(
      <ConsentManager options={consentOptions} onSave={jest.fn()} />,
    ),
  },
  {
    name: 'DSRRequestForm',
    slug: 'dsr-request-form',
    render: () => render(
      <DSRRequestForm onSubmit={jest.fn()} requestTypes={dsrRequestTypes} />,
    ),
  },
  {
    name: 'DPIAQuestionnaire',
    slug: 'dpia-questionnaire',
    render: () => render(
      <DPIAQuestionnaire
        sections={dpiaSections}
        answers={{}}
        onAnswerChange={jest.fn()}
        currentSectionIndex={0}
      />,
    ),
  },
];

describe('Structural BEM smoke tests', () => {
  describe.each(cases)('$name', ({ slug, render: renderCase }) => {
    it(`exposes data-ndpr-component="${slug}"`, () => {
      const { container } = renderCase();
      const root = container.querySelector(`[data-ndpr-component="${slug}"]`);
      expect(root).not.toBeNull();
    });

    it('renders at least one .ndpr-* BEM class somewhere in the tree', () => {
      const { container } = renderCase();
      // Scan the rendered HTML for any class starting with `ndpr-`.
      const html = container.innerHTML;
      expect(html).toMatch(/class="[^"]*\bndpr-[a-z][a-z0-9_-]*/);
    });
  });
});
