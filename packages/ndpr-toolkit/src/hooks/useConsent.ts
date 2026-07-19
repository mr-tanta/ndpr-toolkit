import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ConsentOption,
  ConsentSettings,
  ConsentStorageOptions,
} from '../types/consent';
import { validateConsentStructured } from '../utils/consent';
import type { StructuredValidationError } from '../utils/consent';
import type {
  StorageAdapter,
  StorageAdapterCapabilities,
} from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';
import { sessionStorageAdapter } from '../adapters/session-storage';
import { cookieAdapter } from '../adapters/cookie';

export interface UseConsentOptions {
  /** Consent options to present to the user. */
  options: ConsentOption[];
  /** Pluggable storage adapter. Takes precedence over storageOptions. */
  adapter?: StorageAdapter<ConsentSettings>;
  /** @deprecated Use adapter instead. */
  storageOptions?: ConsentStorageOptions;
  /** @default "1.0" */
  version?: string;
  /** Called after a valid local choice is installed. */
  onChange?: (settings: ConsentSettings) => void;
}

export type ConsentPersistenceOperation = 'load' | 'save' | 'remove';

export class ConsentPersistenceError extends Error {
  readonly operation: ConsentPersistenceOperation;
  readonly originalError: unknown;

  constructor(operation: ConsentPersistenceOperation, originalError: unknown) {
    super(`[ndpr-toolkit] Consent ${operation} persistence failed`);
    this.name = 'ConsentPersistenceError';
    this.operation = operation;
    this.originalError = originalError;
  }
}

export interface UseConsentReturn {
  settings: ConsentSettings | null;
  hasConsent: (optionId: string) => boolean;
  updateConsent: (
    consents: Record<string, boolean>,
  ) => void | Promise<void>;
  acceptAll: () => void | Promise<void>;
  rejectAll: () => void | Promise<void>;
  shouldShowBanner: boolean;
  isValid: boolean;
  validationErrors: StructuredValidationError[];
  resetConsent: () => void | Promise<void>;
  /** Whether initial adapter hydration is still pending. */
  isLoading: boolean;
  /** Whether the latest save/remove operation is still pending. */
  isPersisting: boolean;
  /** Latest load/save/remove failure, cleared on the next operation. */
  persistenceError: ConsentPersistenceError | null;
  clearPersistenceError: () => void;
  /** Declared guarantees of the active adapter, when supplied. */
  storageCapabilities?: Readonly<StorageAdapterCapabilities>;
}

function resolveAdapter(
  storageOptions?: ConsentStorageOptions,
): StorageAdapter<ConsentSettings> {
  if (!storageOptions) {
    return localStorageAdapter<ConsentSettings>('ndpr_consent');
  }
  const {
    storageKey = 'ndpr_consent',
    storageType = 'localStorage',
  } = storageOptions;
  if (storageType === 'sessionStorage') {
    return sessionStorageAdapter<ConsentSettings>(storageKey);
  }
  if (storageType === 'cookie') {
    return cookieAdapter<ConsentSettings>(
      storageKey,
      storageOptions.cookieOptions,
    );
  }
  return localStorageAdapter<ConsentSettings>(storageKey);
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

interface LoadedStateSetters {
  setSettings: (settings: ConsentSettings | null) => void;
  setIsValid: (valid: boolean) => void;
  setValidationErrors: (errors: StructuredValidationError[]) => void;
  setShouldShowBanner: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

function applyLoaded(
  loaded: ConsentSettings | null,
  version: string,
  setters: LoadedStateSetters,
): void {
  const {
    setSettings,
    setIsValid,
    setValidationErrors,
    setShouldShowBanner,
    setIsLoading,
  } = setters;

  if (!loaded) {
    setSettings(null);
    setIsValid(false);
    setValidationErrors([]);
    setShouldShowBanner(true);
    setIsLoading(false);
    return;
  }

  const { valid, errors } = validateConsentStructured(loaded);
  if (!valid) {
    // Never expose malformed persisted data through settings/hasConsent.
    setSettings(null);
    setIsValid(false);
    setValidationErrors(errors);
    setShouldShowBanner(true);
    setIsLoading(false);
    return;
  }

  setSettings(loaded);
  setIsValid(true);
  setValidationErrors([]);
  setShouldShowBanner(
    loaded.version !== version || loaded.hasInteracted !== true,
  );
  setIsLoading(false);
}

/** Manage an explicit consent choice and its persistence state. */
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
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    StructuredValidationError[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersisting, setIsPersisting] = useState(false);
  const [persistenceError, setPersistenceError] =
    useState<ConsentPersistenceError | null>(null);
  const persistenceSequenceRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sequenceAtLoad = persistenceSequenceRef.current;
    const setters: LoadedStateSetters = {
      setSettings,
      setIsValid,
      setValidationErrors,
      setShouldShowBanner,
      setIsLoading,
    };

    const finishLoad = (loaded: ConsentSettings | null) => {
      if (cancelled) return;
      // A user mutation made while an async load was pending wins.
      if (sequenceAtLoad !== persistenceSequenceRef.current) {
        setIsLoading(false);
        return;
      }
      applyLoaded(loaded, version, setters);
    };

    const failLoad = (error: unknown) => {
      if (cancelled) return;
      setSettings(null);
      setIsValid(false);
      setValidationErrors([]);
      setShouldShowBanner(true);
      setPersistenceError(new ConsentPersistenceError('load', error));
      setIsLoading(false);
    };

    try {
      const result = adapterRef.current.load();
      if (isPromiseLike<ConsentSettings | null>(result)) {
        void Promise.resolve(result).then(finishLoad, failLoad);
      } else {
        finishLoad(result);
      }
    } catch (error) {
      failLoad(error);
    }

    return () => {
      cancelled = true;
    };
  }, [version]);

  const persist = useCallback(
    (
      operation: 'save' | 'remove',
      invoke: () => void | Promise<void>,
      onSuccess?: () => void,
    ): void | Promise<void> => {
      const sequence = ++persistenceSequenceRef.current;
      setPersistenceError(null);
      setIsPersisting(true);

      const succeed = () => {
        if (!mountedRef.current || sequence !== persistenceSequenceRef.current) {
          return;
        }
        setIsPersisting(false);
        onSuccess?.();
      };
      const fail = (error: unknown) => {
        if (!mountedRef.current || sequence !== persistenceSequenceRef.current) {
          return;
        }
        setIsPersisting(false);
        setPersistenceError(new ConsentPersistenceError(operation, error));
        setShouldShowBanner(true);
      };

      try {
        const result = invoke();
        if (isPromiseLike<void>(result)) {
          // Convert rejection into observable hook state rather than leaving an
          // unhandled promise rejection in a React event handler.
          return Promise.resolve(result).then(succeed, fail);
        }
        succeed();
      } catch (error) {
        fail(error);
      }
    },
    [],
  );

  const updateConsent = useCallback(
    (consents: Record<string, boolean>): void | Promise<void> => {
      const newSettings: ConsentSettings = {
        consents,
        timestamp: Date.now(),
        version,
        method: 'explicit',
        hasInteracted: true,
      };
      const { valid, errors } = validateConsentStructured(newSettings);
      if (!valid) {
        setIsValid(false);
        setValidationErrors(errors);
        setShouldShowBanner(true);
        return;
      }

      setSettings(newSettings);
      setIsValid(true);
      setValidationErrors([]);
      onChange?.(newSettings);
      return persist(
        'save',
        () => adapterRef.current.save(newSettings),
        () => setShouldShowBanner(false),
      );
    },
    [onChange, persist, version],
  );

  const acceptAll = useCallback((): void | Promise<void> => {
    const allConsents: Record<string, boolean> = {};
    options.forEach((option) => {
      allConsents[option.id] = true;
    });
    return updateConsent(allConsents);
  }, [options, updateConsent]);

  const rejectAll = useCallback((): void | Promise<void> => {
    const rejected: Record<string, boolean> = {};
    options.forEach((option) => {
      rejected[option.id] = option.required || false;
    });
    return updateConsent(rejected);
  }, [options, updateConsent]);

  const hasConsent = useCallback(
    (optionId: string): boolean =>
      isValid &&
      settings?.version === version &&
      settings.hasInteracted === true &&
      settings.consents[optionId] === true,
    [isValid, settings, version],
  );

  const resetConsent = useCallback((): void | Promise<void> => {
    setSettings(null);
    setShouldShowBanner(true);
    setIsValid(false);
    setValidationErrors([]);
    return persist('remove', () => adapterRef.current.remove());
  }, [persist]);

  const clearPersistenceError = useCallback(() => {
    setPersistenceError(null);
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
    isPersisting,
    persistenceError,
    clearPersistenceError,
    storageCapabilities: resolvedAdapter.capabilities,
  };
}
