import {
  StorageAdapterError,
  type StorageAdapter,
  type StorageAdapterCapabilities,
  type StorageAdapterErrorContext,
  type StorageAdapterFailureOptions,
  type StorageAdapterOperation,
} from './types';

export type LocalStorageAdapterOptions = StorageAdapterFailureOptions;

const CAPABILITIES: Readonly<StorageAdapterCapabilities> = Object.freeze({
  medium: 'local-storage',
  durability: 'best-effort',
  integrity: 'unverified-client-state',
  concurrency: 'last-write-wins',
  evidenceSuitability: 'ux-state-only',
  serverReadable: false,
});

/**
 * Storage adapter backed by `window.localStorage`. This is convenient UX
 * state, but it is mutable client data and is not authoritative compliance
 * evidence.
 *
 * Safe to import server-side — every method short-circuits when `window` is
 * undefined. Read/parse failures return `null`; failed mutations throw by
 * default after being reported. Set `mutationFailureMode: 'graceful'` only
 * when best-effort persistence is intentional.
 */
export function localStorageAdapter<T = unknown>(
  key: string,
  options: LocalStorageAdapterOptions = {},
): StorageAdapter<T> {
  const { onError, mutationFailureMode = 'throw' } = options;

  function report(operation: StorageAdapterOperation, error: unknown): StorageAdapterError {
    const context: StorageAdapterErrorContext = {
      operation,
      medium: 'local-storage',
      error,
      key,
    };
    if (onError) {
      onError(context);
    } else {
      console.warn(new StorageAdapterError(context).message);
    }
    return new StorageAdapterError(context);
  }

  return {
    capabilities: CAPABILITIES,
    load(): T | null {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch (error) {
        report('load', error);
        return null;
      }
    },
    save(data: T): void {
      if (typeof window === 'undefined') return;
      try {
        const serialized = JSON.stringify(data);
        if (typeof serialized !== 'string') {
          throw new TypeError('Value is not JSON-serializable');
        }
        localStorage.setItem(key, serialized);
      } catch (error) {
        const adapterError = report('save', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch (error) {
        const adapterError = report('remove', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
  };
}
