import React from 'react';
import { render, screen } from '@testing-library/react';
import { CrossBorder } from '../../../components/cross-border/compound';
import { memoryAdapter } from '../../../adapters/memory';
import type { CrossBorderTransfer } from '../../../types/cross-border';

describe('CrossBorder compound components', () => {
  it('CrossBorder namespace exports exist', () => {
    expect(CrossBorder.Provider).toBeDefined();
    expect(CrossBorder.Manager).toBeDefined();
  });

  it('Provider renders children', () => {
    render(
      <CrossBorder.Provider adapter={memoryAdapter<CrossBorderTransfer[]>()}>
        <div data-testid="child">hello</div>
      </CrossBorder.Provider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('Provider renders without crashing when no adapter provided', () => {
    render(
      <CrossBorder.Provider useLocalStorage={false}>
        <span data-testid="no-adapter-child">ok</span>
      </CrossBorder.Provider>
    );
    expect(screen.getByTestId('no-adapter-child')).toBeInTheDocument();
  });
});
