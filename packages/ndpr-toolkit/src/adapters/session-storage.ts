import {
  StorageAdapterError,
  type StorageAdapter,
  type StorageAdapterCapabilities,
  type StorageAdapterErrorContext,
  type StorageAdapterFailureOptions,
  type StorageAdapterOperation,
} from './types';

export type SessionStorageAdapterOptions = StorageAdapterFailureOptions;

const CAPABILITIES: Readonly<StorageAdapterCapabilities> = Object.freeze({
  medium: 'session-storage',
  durability: 'session',
  integrity: 'unverified-client-state',
  concurrency: 'last-write-wins',
  evidenceSuitability: 'ux-state-only',
  serverReadable: false,
});

/**
 * Storage adapter backed by `window.sessionStorage`. Data is scoped to the
 * current tab and discarded when that tab closes. It is mutable UX state,
 * not authoritative compliance evidence.
 */
export function sessionStorageAdapter<T = unknown>(
  key: string,
  options: SessionStorageAdapterOptions = {},
): StorageAdapter<T> {
  const { onError, mutationFailureMode = 'throw' } = options;

  function report(operation: StorageAdapterOperation, error: unknown): StorageAdapterError {
    const context: StorageAdapterErrorContext = {
      operation,
      medium: 'session-storage',
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
        const raw = sessionStorage.getItem(key);
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
        sessionStorage.setItem(key, serialized);
      } catch (error) {
        const adapterError = report('save', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        const adapterError = report('remove', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
  };
}
