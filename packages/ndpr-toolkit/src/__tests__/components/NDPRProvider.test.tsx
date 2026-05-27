import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRProvider, useNDPRConfig, useNDPRLocale } from '../../components/NDPRProvider';
import { defaultLocale } from '../../locales/en';

function ConfigProbe() {
  const config = useNDPRConfig();
  return (
    <div>
      <span data-testid="org">{config.organizationName ?? '—'}</span>
      <span data-testid="dpo">{config.dpoEmail ?? '—'}</span>
      <span data-testid="ndpc">{config.ndpcRegistrationNumber ?? '—'}</span>
    </div>
  );
}

function LocaleProbe() {
  const locale = useNDPRLocale();
  return (
    <div>
      <span data-testid="consent-title">{locale.consent.title}</span>
      <span data-testid="consent-accept">{locale.consent.acceptAll}</span>
      <span data-testid="dsr-submit">{locale.dsr.submitRequest}</span>
    </div>
  );
}

describe('NDPRProvider', () => {
  it('useNDPRConfig returns the provided config to descendants', () => {
    render(
      <NDPRProvider
        organizationName="Acme Nigeria Ltd"
        dpoEmail="dpo@acme.example"
        ndpcRegistrationNumber="NDPC-2024-001"
      >
        <ConfigProbe />
      </NDPRProvider>
    );

    expect(screen.getByTestId('org')).toHaveTextContent('Acme Nigeria Ltd');
    expect(screen.getByTestId('dpo')).toHaveTextContent('dpo@acme.example');
    expect(screen.getByTestId('ndpc')).toHaveTextContent('NDPC-2024-001');
  });

  it('useNDPRLocale merges partial locale overrides with English defaults', () => {
    render(
      <NDPRProvider
        locale={{
          consent: { title: 'Custom Consent Heading' },
        }}
      >
        <LocaleProbe />
      </NDPRProvider>
    );

    // Overridden key reflects custom string.
    expect(screen.getByTestId('consent-title')).toHaveTextContent('Custom Consent Heading');
    // Sibling key in the same section falls back to the English default.
    expect(screen.getByTestId('consent-accept')).toHaveTextContent(
      defaultLocale.consent.acceptAll
    );
    // Untouched section is fully populated from defaults.
    expect(screen.getByTestId('dsr-submit')).toHaveTextContent(
      defaultLocale.dsr.submitRequest
    );
  });

  it('innermost provider wins when providers are nested', () => {
    render(
      <NDPRProvider organizationName="Outer Org" dpoEmail="outer@example.com">
        <NDPRProvider organizationName="Inner Org">
          <ConfigProbe />
        </NDPRProvider>
      </NDPRProvider>
    );

    expect(screen.getByTestId('org')).toHaveTextContent('Inner Org');
    // Inner provider does not inherit outer fields — context replaces, not merges.
    expect(screen.getByTestId('dpo')).toHaveTextContent('—');
  });
});
