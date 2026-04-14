import React from 'react';
import { render, screen } from '@testing-library/react';
import { DSR } from '../../../components/dsr/compound';
import type { RequestType } from '../../../types/dsr';
import { memoryAdapter } from '../../../adapters/memory';

const mockRequestTypes: RequestType[] = [
  {
    id: 'access',
    name: 'Access Request',
    description: 'Request to access your personal data',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

describe('DSR compound components', () => {
  it('DSR namespace exports exist', () => {
    expect(DSR.Provider).toBeDefined();
    expect(DSR.Form).toBeDefined();
    expect(DSR.Dashboard).toBeDefined();
    expect(DSR.Tracker).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <DSR.Provider requestTypes={mockRequestTypes} adapter={memoryAdapter()}>
        <div data-testid="child">hello</div>
      </DSR.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <DSR.Provider requestTypes={mockRequestTypes} useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </DSR.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
