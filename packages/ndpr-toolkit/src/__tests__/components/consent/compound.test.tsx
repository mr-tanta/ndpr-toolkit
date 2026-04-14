import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Consent } from '../../../components/consent/compound';
import type { ConsentOption } from '../../../types/consent';
import { memoryAdapter } from '../../../adapters/memory';

const options: ConsentOption[] = [
  { id: 'essential', label: 'Essential', description: 'Required', purpose: 'Core', required: true },
  { id: 'analytics', label: 'Analytics', description: 'Track usage', purpose: 'Analytics', required: false },
];

describe('Consent compound components', () => {
  it('renders OptionList with all options', () => {
    render(
      <Consent.Provider options={options} adapter={memoryAdapter()}>
        <Consent.OptionList />
      </Consent.Provider>
    );
    expect(screen.getByLabelText(/Essential/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Analytics/)).toBeInTheDocument();
  });

  it('AcceptButton calls acceptAll', () => {
    const adapter = memoryAdapter();
    render(
      <Consent.Provider options={options} adapter={adapter}>
        <Consent.AcceptButton />
      </Consent.Provider>
    );
    fireEvent.click(screen.getByText('Accept All'));
    const saved = adapter.load() as any;
    expect(saved.consents.analytics).toBe(true);
  });

  it('RejectButton calls rejectAll', () => {
    const adapter = memoryAdapter();
    render(
      <Consent.Provider options={options} adapter={adapter}>
        <Consent.RejectButton />
      </Consent.Provider>
    );
    fireEvent.click(screen.getByText('Reject All'));
    const saved = adapter.load() as any;
    expect(saved.consents.essential).toBe(true);
    expect(saved.consents.analytics).toBe(false);
  });

  it('throws when used without Provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(() => render(<Consent.AcceptButton />)).toThrow(
      /must be wrapped in <Consent.Provider>/
    );
    consoleSpy.mockRestore();
  });
});
