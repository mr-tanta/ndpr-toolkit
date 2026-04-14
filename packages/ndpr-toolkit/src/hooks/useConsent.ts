import { useState, useEffect, useCallback, useRef } from 'react';
import { ConsentOption, ConsentSettings, ConsentStorageOptions } from '../types/consent';
import { validateConsent } from '../utils/consent';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';
import { sessionStorageAdapter } from '../adapters/session-storage';
import { cookieAdapter } from '../adapters/cookie';

interface UseConsentOptions {
  /**
   * Consent options to present to the user
   */
  options: ConsentOption[];

  /**
   * Pluggable storage adapter. When provided, takes precedence over storageOptions.
   */
  adapter?: StorageAdapter<ConsentSettings>;

  /**
   * Storage options for consent settings
   * @deprecated Use adapter instead
   */
  storageOptions?: ConsentStorageOptions;

  /**
   * Version of the consent form
   * @default "1.0"
   */
  version?: string;

  /**
   * Callback function called when consent settings change
   */
  onChange?: (settings: ConsentSettings) => void;
}

interface UseConsentReturn {
  /**
   * Current consent settings
   */
  settings: ConsentSettings | null;

  /**
   * Whether consent has been given for a specific option
   */
  hasConsent: (optionId: string) => boolean;

  /**
   * Update consent settings
   */
  updateConsent: (consents: Record<string, boolean>) => void;

  /**
   * Accept all consent options
   */
  acceptAll: () => void;

  /**
   * Reject all non-required consent options
   */
  rejectAll: () => void;

  /**
   * Whether the consent banner should be shown
   */
  shouldShowBanner: boolean;

  /**
   * Whether consent settings are valid
   */
  isValid: boolean;

  /**
   * Validation errors (if any)
   */
  validationErrors: string[];

  /**
   * Reset consent settings (clear from storage)
   */
  resetConsent: () => void;

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

function resolveAdapter(storageOptions?: ConsentStorageOptions): StorageAdapter<ConsentSettings> {
  if (!storageOptions) return localStorageAdapter<ConsentSettings>('ndpr_consent');
  const { storageKey = 'ndpr_consent', storageType = 'localStorage' } = storageOptions;
  if (storageType === 'sessionStorage') return sessionStorageAdapter<ConsentSettings>(storageKey);
  if (storageType === 'cookie') return cookieAdapter<ConsentSettings>(storageKey, storageOptions.cookieOptions);
  return localStorageAdapter<ConsentSettings>(storageKey);
}

function applyLoaded(
  loaded: ConsentSettings | null,
  version: string,
  setSettings: (s: ConsentSettings | null) => void,
  setIsValid: (v: boolean) => void,
  setValidationErrors: (e: string[]) => void,
  setShouldShowBanner: (v: boolean) => void,
  setIsLoading: (v: boolean) => void,
) {
  if (loaded) {
    setSettings(loaded);
    const { valid, errors } = validateConsent(loaded);
    setIsValid(valid);
    setValidationErrors(errors);
    setShouldShowBanner(!(valid && loaded.version === version));
  } else {
    setShouldShowBanner(true);
  }
  setIsLoading(false);
}

/**
 * Hook for managing user consent in compliance with NDPA
 */
export function useConsent({
  options,
  adapter,
  storageOptions,
  version = '1.0',
  onChange,
}: UseConsentOptions): UseConsentReturn {
  const resolvedAdapter = adapter ?? resolveAdapter(storageOptions);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [shouldShowBanner, setShouldShowBanner] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load consent settings from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      if (result instanceof Promise) {
        // Async adapter path
        result.then(
          (loaded) => {
            if (cancelled) return;
            applyLoaded(loaded, version, setSettings, setIsValid, setValidationErrors, setShouldShowBanner, setIsLoading);
          },
          () => {
            if (!cancelled) {
              setShouldShowBanner(true);
              setIsLoading(false);
            }
          }
        );
      } else {
        // Sync adapter path — apply immediately, no async batching issues
        applyLoaded(result, version, setSettings, setIsValid, setValidationErrors, setShouldShowBanner, setIsLoading);
      }
    } catch {
      if (!cancelled) {
        setShouldShowBanner(true);
        setIsLoading(false);
      }
    }

    return () => { cancelled = true; };
  }, [version]);

  // Save settings to storage — state updates are synchronous, persistence is fire-and-forget async
  const saveSettings = useCallback(
    (newSettings: ConsentSettings) => {
      // Update state synchronously first
      const { valid, errors } = validateConsent(newSettings);
      setIsValid(valid);
      setValidationErrors(errors);
      onChange?.(newSettings);
      // Persist asynchronously (fire-and-forget)
      Promise.resolve(adapterRef.current.save(newSettings)).catch((err) => {
        console.warn('[ndpr-toolkit] Failed to save consent:', err);
      });
    },
    [onChange]
  );

  // Update consent settings
  const updateConsent = useCallback(
    (consents: Record<string, boolean>) => {
      const newSettings: ConsentSettings = {
        consents,
        timestamp: Date.now(),
        version,
        method: 'explicit',
        hasInteracted: true,
      };
      setSettings(newSettings);
      saveSettings(newSettings);
      setShouldShowBanner(false);
    },
    [version, saveSettings]
  );

  // Accept all consent options
  const acceptAll = useCallback(() => {
    const allConsents: Record<string, boolean> = {};
    options.forEach(opt => { allConsents[opt.id] = true; });
    updateConsent(allConsents);
  }, [options, updateConsent]);

  // Reject all non-required consent options
  const rejectAll = useCallback(() => {
    const rejected: Record<string, boolean> = {};
    options.forEach(opt => { rejected[opt.id] = opt.required || false; });
    updateConsent(rejected);
  }, [options, updateConsent]);

  // Check if consent has been given for a specific option
  const hasConsent = useCallback(
    (optionId: string): boolean => !!settings?.consents[optionId],
    [settings]
  );

  // Reset consent settings
  const resetConsent = useCallback(() => {
    // Update state synchronously
    setSettings(null);
    setShouldShowBanner(true);
    setIsValid(false);
    setValidationErrors([]);
    // Persist removal asynchronously (fire-and-forget)
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove consent:', err);
    });
  }, []);

  return {
    settings,
    hasConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    shouldShowBanner,
    isValid,
    validationErrors,
    resetConsent,
    isLoading,
  };
}
