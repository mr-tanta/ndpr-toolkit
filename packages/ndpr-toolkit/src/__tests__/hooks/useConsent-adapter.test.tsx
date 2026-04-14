import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConsent } from '../../hooks/useConsent';
import { memoryAdapter } from '../../adapters/memory';
import type { ConsentOption, ConsentSettings } from '../../types/consent';

const options: ConsentOption[] = [
  { id: 'essential', label: 'Essential', description: 'Required', purpose: 'Core functionality', required: true },
  { id: 'analytics', label: 'Analytics', description: 'Usage data', purpose: 'Analytics', required: false },
];

describe('useConsent with adapter', () => {
  it('uses the provided adapter instead of localStorage', async () => {
    const adapter = memoryAdapter<ConsentSettings>();
    const { result } = renderHook(() => useConsent({ options, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.shouldShowBanner).toBe(true);
    expect(result.current.settings).toBeNull();
  });

  it('loads existing data from adapter on mount', async () => {
    const existing = {
      consents: { essential: true, analytics: true },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };
    const adapter = memoryAdapter(existing);
    const { result } = renderHook(() => useConsent({ options, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.shouldShowBanner).toBe(false);
    expect(result.current.hasConsent('analytics')).toBe(true);
  });

  it('saves to adapter when consent is updated', async () => {
    const adapter = memoryAdapter<ConsentSettings>();
    const { result } = renderHook(() => useConsent({ options, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => { result.current.acceptAll(); });
    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect((saved as any).consents.analytics).toBe(true);
  });

  it('clears adapter on resetConsent', async () => {
    const existing = {
      consents: { essential: true, analytics: true },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };
    const adapter = memoryAdapter(existing);
    const { result } = renderHook(() => useConsent({ options, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => { result.current.resetConsent(); });
    expect(adapter.load()).toBeNull();
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it('exposes isLoading for async adapters', async () => {
    const asyncAdapter = {
      load: () => new Promise<ConsentSettings | null>(resolve => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useConsent({ options, adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('still works with legacy storageOptions (backward compat)', async () => {
    const { result } = renderHook(() =>
      useConsent({
        options,
        storageOptions: { storageKey: 'legacy_key', storageType: 'localStorage' },
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.shouldShowBanner).toBe(true);
  });
});
