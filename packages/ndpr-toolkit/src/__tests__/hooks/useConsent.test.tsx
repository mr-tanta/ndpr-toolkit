import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useConsent } from '../../hooks/useConsent';
import { ConsentOption, ConsentSettings } from '../../types/consent';

// Mock localStorage
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

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useConsent (NDPA Consent Management Hook)', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  const consentOptions: ConsentOption[] = [
    {
      id: 'necessary',
      label: 'Necessary',
      description: 'Essential cookies',
      required: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Analytics cookies',
      required: false,
    },
    {
      id: 'marketing',
      label: 'Marketing',
      description: 'Marketing cookies',
      required: false,
    },
  ];

  it('should initialize with default consent settings per NDPA requirements', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    expect(result.current.settings).toBe(null);
    expect(result.current.shouldShowBanner).toBe(true);
    expect(result.current.hasConsent('necessary')).toBe(false);
    expect(result.current.hasConsent('analytics')).toBe(false);
  });

  it('should update consent settings', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    act(() => {
      result.current.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false
      });
    });

    expect(result.current.settings?.consents.necessary).toBe(true);
    expect(result.current.settings?.consents.analytics).toBe(true);
    expect(result.current.settings?.consents.marketing).toBe(false);
    expect(result.current.hasConsent('analytics')).toBe(true);
  });

  it('should accept all consent options', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    act(() => {
      result.current.acceptAll();
    });

    expect(result.current.settings?.consents.necessary).toBe(true);
    expect(result.current.settings?.consents.analytics).toBe(true);
    expect(result.current.settings?.consents.marketing).toBe(true);
  });

  it('should save and reset consent settings', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    act(() => {
      result.current.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(result.current.shouldShowBanner).toBe(false);

    // Reset the consent settings
    act(() => {
      result.current.resetConsent();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-consent');
    expect(result.current.settings).toBe(null);
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it('should reject all non-required consent options per NDPA Section 26 withdrawal right', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    act(() => {
      result.current.rejectAll();
    });

    // Necessary is required, so it should be true
    expect(result.current.settings?.consents.necessary).toBe(true);
    // Non-required options should be false
    expect(result.current.settings?.consents.analytics).toBe(false);
    expect(result.current.settings?.consents.marketing).toBe(false);
  });

  it('should handle validation', () => {
    const { result } = renderHook(() => useConsent({
      options: consentOptions,
      storageOptions: { storageKey: 'test-consent' }
    }));

    expect(result.current.isValid).toBe(false);
    
    act(() => {
      result.current.acceptAll();
    });

    // After accepting all, settings should be valid
    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toEqual([]);
  });
});
