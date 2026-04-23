import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ConsentBanner } from '../../components/consent/ConsentBanner';
import { NDPRConsent } from '../../presets/NDPRConsent';
import { useConsent } from '../../hooks/useConsent';
import { memoryAdapter } from '../../adapters/memory';
import type { ConsentOption, ConsentSettings } from '../../types/consent';

/**
 * Integration tests for consent management flows.
 *
 * These tests exercise full user journeys rather than individual units,
 * verifying that ConsentBanner, useConsent, adapters, and presets work
 * together end-to-end.
 */

const OPTIONS: ConsentOption[] = [
  { id: 'essential', label: 'Essential', description: 'Required cookies', purpose: 'Core functionality', required: true },
  { id: 'analytics', label: 'Analytics', description: 'Usage data', purpose: 'Analytics', required: false },
  { id: 'marketing', label: 'Marketing', description: 'Ads tracking', purpose: 'Advertising', required: false },
  { id: 'preferences', label: 'Preferences', description: 'User settings', purpose: 'Personalisation', required: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Renders a ConsentBanner wired to useConsent via a shared adapter. */
function ConsentFlow({
  adapter,
  version = '1.0',
  options = OPTIONS,
}: {
  adapter: ReturnType<typeof memoryAdapter<ConsentSettings>>;
  version?: string;
  options?: ConsentOption[];
}) {
  const consent = useConsent({ options, adapter, version });

  if (consent.isLoading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <ConsentBanner
        options={options}
        onSave={(settings) => consent.updateConsent(settings.consents)}
        show={consent.shouldShowBanner}
        position="inline"
        version={version}
        manageStorage={false}
      />
      <div data-testid="banner-visible">{String(consent.shouldShowBanner)}</div>
      <div data-testid="has-analytics">{String(consent.hasConsent('analytics'))}</div>
      <div data-testid="has-marketing">{String(consent.hasConsent('marketing'))}</div>
      <div data-testid="has-preferences">{String(consent.hasConsent('preferences'))}</div>
      <button data-testid="reset-btn" onClick={() => consent.resetConsent()}>
        Reset
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Full consent flow — accept all, persist, "reload"
// ---------------------------------------------------------------------------
describe('Full consent flow', () => {
  it('accept all hides the banner, and re-render with same adapter keeps it hidden', async () => {
    const adapter = memoryAdapter<ConsentSettings>();

    // First render — banner should be visible
    const { unmount, getByText, getByTestId } = render(
      <ConsentFlow adapter={adapter} />,
    );
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('true'));
    expect(getByText('Accept All')).toBeInTheDocument();

    // User clicks Accept All
    fireEvent.click(getByText('Accept All'));
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('false'));

    // Consent settings persisted in adapter
    const saved = adapter.load() as ConsentSettings;
    expect(saved).not.toBeNull();
    expect(saved.consents.analytics).toBe(true);
    expect(saved.consents.marketing).toBe(true);

    // Simulate "page reload" by unmounting and re-rendering with the same adapter
    unmount();
    const { getByTestId: getByTestId2, queryByText } = render(
      <ConsentFlow adapter={adapter} />,
    );
    await waitFor(() => expect(getByTestId2('banner-visible').textContent).toBe('false'));
    // Banner buttons should not be visible
    expect(queryByText('Accept All')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Reject and re-prompt
// ---------------------------------------------------------------------------
describe('Reject and re-prompt', () => {
  it('reject all hides the banner, reset makes it reappear', async () => {
    const adapter = memoryAdapter<ConsentSettings>();

    const { getByText, getByTestId } = render(
      <ConsentFlow adapter={adapter} />,
    );
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('true'));

    // Reject all
    fireEvent.click(getByText('Reject All'));
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('false'));

    // Required cookies should still be true
    const saved = adapter.load() as ConsentSettings;
    expect(saved.consents.essential).toBe(true);
    expect(saved.consents.analytics).toBe(false);

    // Reset consent — banner should show again
    fireEvent.click(getByTestId('reset-btn'));
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('true'));
    expect(adapter.load()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Selective consent — customize and enable only analytics
// ---------------------------------------------------------------------------
describe('Selective consent', () => {
  it('customize to enable only analytics, verify per-category consent', async () => {
    const adapter = memoryAdapter<ConsentSettings>();

    const { getByText, getByTestId } = render(
      <ConsentFlow adapter={adapter} />,
    );
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('true'));

    // Open customization panel
    fireEvent.click(getByText('Customize'));

    // Toggle analytics on
    const analyticsCheckbox = screen.getByLabelText(/Analytics/);
    fireEvent.click(analyticsCheckbox);

    // Save preferences
    fireEvent.click(getByText('Save Preferences'));
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('false'));

    // Verify selective consent
    expect(getByTestId('has-analytics').textContent).toBe('true');
    expect(getByTestId('has-marketing').textContent).toBe('false');
    expect(getByTestId('has-preferences').textContent).toBe('false');

    // Adapter should reflect the same
    const saved = adapter.load() as ConsentSettings;
    expect(saved.consents.analytics).toBe(true);
    expect(saved.consents.marketing).toBe(false);
    expect(saved.consents.essential).toBe(false); // checkbox defaults not checked; required only enforced by disabled state
  });
});

// ---------------------------------------------------------------------------
// 4. Version change re-prompts
// ---------------------------------------------------------------------------
describe('Version change re-prompts', () => {
  it('banner reappears when version changes from 1.0 to 2.0', async () => {
    const adapter = memoryAdapter<ConsentSettings>();

    // Accept consent at version 1.0
    const { unmount, getByText, getByTestId } = render(
      <ConsentFlow adapter={adapter} version="1.0" />,
    );
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('true'));
    fireEvent.click(getByText('Accept All'));
    await waitFor(() => expect(getByTestId('banner-visible').textContent).toBe('false'));
    unmount();

    // "Reload" with version 2.0 — should re-prompt
    const { getByTestId: getByTestId2 } = render(
      <ConsentFlow adapter={adapter} version="2.0" />,
    );
    await waitFor(() => expect(getByTestId2('banner-visible').textContent).toBe('true'));
  });
});

// ---------------------------------------------------------------------------
// 5. Adapter persistence round-trip via useConsent hook
// ---------------------------------------------------------------------------
describe('Adapter persistence round-trip', () => {
  it('saves consent via one hook instance, loads correctly in a new instance', async () => {
    const adapter = memoryAdapter<ConsentSettings>();

    // First hook instance — accept all
    const { result: result1, unmount: unmount1 } = renderHook(() =>
      useConsent({ options: OPTIONS, adapter }),
    );
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    act(() => result1.current.acceptAll());

    expect(result1.current.hasConsent('analytics')).toBe(true);
    expect(result1.current.hasConsent('marketing')).toBe(true);
    expect(result1.current.shouldShowBanner).toBe(false);
    unmount1();

    // Second hook instance — same adapter, should load persisted settings
    const { result: result2 } = renderHook(() =>
      useConsent({ options: OPTIONS, adapter }),
    );
    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.shouldShowBanner).toBe(false);
    expect(result2.current.hasConsent('analytics')).toBe(true);
    expect(result2.current.hasConsent('marketing')).toBe(true);
    expect(result2.current.settings).not.toBeNull();
    expect(result2.current.settings?.version).toBe('1.0');
  });
});

// ---------------------------------------------------------------------------
// 6. NDPRConsent preset renders with zero config
// ---------------------------------------------------------------------------
describe('NDPRConsent preset with zero config', () => {
  it('renders without crashing and shows expected UI elements', () => {
    const { getByText } = render(<NDPRConsent />);

    // Title
    expect(getByText('We Value Your Privacy')).toBeInTheDocument();
    // Action buttons
    expect(getByText('Accept All')).toBeInTheDocument();
    expect(getByText('Reject All')).toBeInTheDocument();
    expect(getByText('Customize')).toBeInTheDocument();
  });

  it('customize panel shows all four default categories', () => {
    render(<NDPRConsent />);
    fireEvent.click(screen.getByText('Customize'));

    expect(screen.getByLabelText(/Essential Cookies/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Analytics/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Marketing/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferences/)).toBeInTheDocument();
  });

  it('essential cookies checkbox is disabled (required)', () => {
    render(<NDPRConsent />);
    fireEvent.click(screen.getByText('Customize'));

    const essential = screen.getByLabelText(/Essential Cookies/);
    expect(essential).toBeDisabled();
  });
});
