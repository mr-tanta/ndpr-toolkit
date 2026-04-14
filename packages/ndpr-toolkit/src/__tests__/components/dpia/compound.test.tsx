import React from 'react';
import { render, screen } from '@testing-library/react';
import { DPIA } from '../../../components/dpia/compound';
import type { DPIASection } from '../../../types/dpia';
import { memoryAdapter } from '../../../adapters/memory';

const mockSections: DPIASection[] = [
  {
    id: 'section1',
    title: 'Processing Overview',
    description: 'General information',
    order: 1,
    questions: [
      {
        id: 'q1',
        text: 'Describe the processing activity',
        type: 'textarea',
        required: true,
      },
    ],
  },
];

describe('DPIA compound components', () => {
  it('DPIA namespace exports exist', () => {
    expect(DPIA.Provider).toBeDefined();
    expect(DPIA.Questionnaire).toBeDefined();
    expect(DPIA.Report).toBeDefined();
    expect(DPIA.StepIndicator).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <DPIA.Provider sections={mockSections} adapter={memoryAdapter()}>
        <div data-testid="child">hello</div>
      </DPIA.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <DPIA.Provider sections={mockSections} useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </DPIA.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
