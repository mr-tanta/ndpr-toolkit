import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breach } from '../../../components/breach/compound';
import type { BreachCategory } from '../../../types/breach';
import { memoryAdapter } from '../../../adapters/memory';

const mockCategories: BreachCategory[] = [
  {
    id: 'unauthorized-access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to systems or data',
    defaultSeverity: 'high',
  },
];

describe('Breach compound components', () => {
  it('Breach namespace exports exist', () => {
    expect(Breach.Provider).toBeDefined();
    expect(Breach.ReportForm).toBeDefined();
    expect(Breach.RiskAssessment).toBeDefined();
    expect(Breach.NotificationManager).toBeDefined();
    expect(Breach.ReportGenerator).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <Breach.Provider categories={mockCategories} adapter={memoryAdapter()}>
        <div data-testid="child">hello</div>
      </Breach.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <Breach.Provider categories={mockCategories} useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </Breach.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
