import React from 'react';
import { render, screen } from '@testing-library/react';
import { ROPA } from '../../../components/ropa/compound';
import { memoryAdapter } from '../../../adapters/memory';
import type { RecordOfProcessingActivities } from '../../../types/ropa';

const initialROPA: RecordOfProcessingActivities = {
  id: 'ropa-test-001',
  organizationName: 'Test Org',
  organizationContact: 'privacy@test.com',
  organizationAddress: '1 Test Street',
  records: [],
  lastUpdated: Date.now(),
  version: '1.0',
};

describe('ROPA compound components', () => {
  it('ROPA namespace exports exist', () => {
    expect(ROPA.Provider).toBeDefined();
    expect(ROPA.Manager).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <ROPA.Provider
        initialData={initialROPA}
        adapter={memoryAdapter<RecordOfProcessingActivities>()}
      >
        <div data-testid="child">hello</div>
      </ROPA.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <ROPA.Provider initialData={initialROPA}>
        <span data-testid="no-adapter-child">ok</span>
      </ROPA.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
