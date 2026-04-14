import React from 'react';
import { render, screen } from '@testing-library/react';
import { Policy } from '../../../components/policy/compound';
import type { PolicyTemplate } from '../../../types/privacy';
import { memoryAdapter } from '../../../adapters/memory';

const mockTemplate: PolicyTemplate = {
  id: 'tpl-basic',
  name: 'Basic Privacy Policy',
  description: 'A basic NDPA-compliant privacy policy',
  organizationType: 'business',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      required: true,
      included: true,
      template: 'This is the introduction.',
    },
  ],
  variables: {},
  version: '1.0',
  lastUpdated: Date.now(),
  ndpaCompliant: true,
};

describe('Policy compound components', () => {
  it('Policy namespace exports exist', () => {
    expect(Policy.Provider).toBeDefined();
    expect(Policy.Generator).toBeDefined();
    expect(Policy.Preview).toBeDefined();
    expect(Policy.Exporter).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <Policy.Provider templates={[mockTemplate]} adapter={memoryAdapter()}>
        <div data-testid="child">hello</div>
      </Policy.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <Policy.Provider templates={[mockTemplate]} useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </Policy.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
