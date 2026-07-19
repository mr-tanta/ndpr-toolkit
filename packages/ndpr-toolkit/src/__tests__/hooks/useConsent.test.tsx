import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  useConsent,
  ConsentPersistenceError,
} from '../../hooks/useConsent';
import type { ConsentOption, ConsentSettings } from '../../types/consent';
import type { StorageAdapter } from '../../adapters/types';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const consentOptions: ConsentOption[] = [
  {
    id: 'necessary',
    label: 'Necessary',
    description: 'Essential cookies',
    purpose: 'Core website functionality',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Analytics cookies',
    purpose: 'Usage analytics',
    required: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Marketing cookies',
    purpose: 'Personalized advertising',
    required: false,
  },
];

describe('useConsent', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes without granting consent', () => {
    const { result } = renderHook(() =>
      useConsent({
        options: consentOptions,
        storageOptions: { storageKey: 'test-consent' },
      }),
    );

    expect(result.current.settings).toBeNull();
    expect(result.current.shouldShowBanner).toBe(true);
    expect(result.current.hasConsent('necessary')).toBe(false);
    expect(result.current.hasConsent('analytics')).toBe(false);
  });

  it('updates and persists valid consent settings', () => {
    const { result } = renderHook(() =>
      useConsent({
        options: consentOptions,
        storageOptions: { storageKey: 'test-consent' },
      }),
    );

    act(() => {
      result.current.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false,
      });
    });

    expect(result.current.settings?.consents).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    });
    expect(result.current.hasConsent('analytics')).toBe(true);
    expect(result.current.isValid).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('accepts all and rejects only non-required options', () => {
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions }),
    );

    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.settings?.consents).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    });

    act(() => {
      result.current.rejectAll();
    });
    expect(result.current.settings?.consents).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it('resets consent and removes persisted state', () => {
    const { result } = renderHook(() =>
      useConsent({
        options: consentOptions,
        storageOptions: { storageKey: 'test-consent' },
      }),
    );
    act(() => {
      result.current.acceptAll();
      result.current.resetConsent();
    });
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-consent');
    expect(result.current.settings).toBeNull();
    expect(result.current.shouldShowBanner).toBe(true);
    expect(result.current.hasConsent('analytics')).toBe(false);
  });

  it('does not install malformed hydrated settings', () => {
    const invalid = {
      consents: {},
      timestamp: 0,
      version: '1.0',
      method: '',
      hasInteracted: true,
    } as ConsentSettings;
    const adapter: StorageAdapter<ConsentSettings> = {
      load: () => invalid,
      save: () => {},
      remove: () => {},
    };
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions, adapter }),
    );

    expect(result.current.settings).toBeNull();
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasConsent('analytics')).toBe(false);
    expect(result.current.validationErrors.length).toBeGreaterThan(0);
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it('does not activate stale-version hydrated consent', () => {
    const adapter: StorageAdapter<ConsentSettings> = {
      load: () => ({
        consents: { analytics: true },
        timestamp: Date.now(),
        version: 'old',
        method: 'explicit',
        hasInteracted: true,
      }),
      save: () => {},
      remove: () => {},
    };
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions, adapter, version: 'current' }),
    );

    expect(result.current.settings?.version).toBe('old');
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasConsent('analytics')).toBe(false);
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it('keeps the banner visible until asynchronous persistence succeeds', async () => {
    let resolveSave!: () => void;
    const adapter: StorageAdapter<ConsentSettings> = {
      load: () => null,
      save: () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
      remove: () => {},
    };
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions, adapter }),
    );

    let pending: void | Promise<void>;
    act(() => {
      pending = result.current.acceptAll();
    });
    expect(result.current.isPersisting).toBe(true);
    expect(result.current.shouldShowBanner).toBe(true);

    await act(async () => {
      resolveSave();
      await pending;
    });
    expect(result.current.isPersisting).toBe(false);
    expect(result.current.persistenceError).toBeNull();
    expect(result.current.shouldShowBanner).toBe(false);
  });

  it('retains the local choice but exposes asynchronous persistence failure', async () => {
    const adapter: StorageAdapter<ConsentSettings> = {
      load: () => null,
      save: async () => {
        throw new Error('backend unavailable');
      },
      remove: () => {},
    };
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions, adapter }),
    );

    await act(async () => {
      await result.current.acceptAll();
    });
    expect(result.current.settings?.consents.analytics).toBe(true);
    expect(result.current.persistenceError).toBeInstanceOf(
      ConsentPersistenceError,
    );
    expect(result.current.persistenceError?.operation).toBe('save');
    expect(result.current.shouldShowBanner).toBe(true);

    act(() => result.current.clearPersistenceError());
    expect(result.current.persistenceError).toBeNull();
  });

  it('exposes active adapter capabilities', () => {
    const adapter: StorageAdapter<ConsentSettings> = {
      capabilities: {
        medium: 'remote-api',
        durability: 'server-acknowledged',
        integrity: 'application-defined',
        concurrency: 'application-defined',
        evidenceSuitability: 'application-defined',
        serverReadable: true,
      },
      load: () => null,
      save: () => {},
      remove: () => {},
    };
    const { result } = renderHook(() =>
      useConsent({ options: consentOptions, adapter }),
    );
    expect(result.current.storageCapabilities).toBe(adapter.capabilities);
  });
});
