import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NDPRConsent } from '../../presets/NDPRConsent';
import { memoryAdapter } from '../../adapters/memory';
import type { ConsentSettings } from '../../types/consent';

describe('NDPRConsent preset', () => {
  it('renders with zero props', () => {
    render(<NDPRConsent />);
    expect(screen.getByText('We Value Your Privacy')).toBeInTheDocument();
  });

  it('shows default consent options', () => {
    render(<NDPRConsent />);
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Reject All')).toBeInTheDocument();
  });

  it('accepts a custom adapter', () => {
    const adapter = memoryAdapter<ConsentSettings>();
    render(<NDPRConsent adapter={adapter} />);
    fireEvent.click(screen.getByText('Accept All'));
    expect(adapter.load()).not.toBeNull();
  });

  it('accepts extraOptions', () => {
    render(
      <NDPRConsent
        extraOptions={[
          { id: 'research', label: 'Research', description: 'For research', purpose: 'Research', required: false },
        ]}
      />
    );
    fireEvent.click(screen.getByText('Customize'));
    expect(screen.getByText('Research')).toBeInTheDocument();
  });
});
