import React from 'react';
import { render, screen } from '@testing-library/react';
import { LawfulBasis } from '../../../components/lawful-basis/compound';
import { memoryAdapter } from '../../../adapters/memory';
import type { ProcessingActivity } from '../../../types/lawful-basis';

describe('LawfulBasis compound components', () => {
  it('LawfulBasis namespace exports exist', () => {
    expect(LawfulBasis.Provider).toBeDefined();
    expect(LawfulBasis.Tracker).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <LawfulBasis.Provider adapter={memoryAdapter<ProcessingActivity[]>()}>
        <div data-testid="child">hello</div>
      </LawfulBasis.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <LawfulBasis.Provider useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </LawfulBasis.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
