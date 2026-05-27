import type { StorageAdapter } from './types';

/**
 * Storage adapter backed by `window.localStorage`. The default adapter used
 * by every hook in the toolkit when no `adapter` prop is supplied.
 *
 * Safe to import server-side — every method short-circuits when
 * `window` is undefined, so calling `load()` on the server returns `null`.
 *
 * @example
 * ```ts
 * import { localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
 * import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * const adapter = localStorageAdapter('ndpr_consent');
 * useConsent({ options, adapter });
 * ```
 */
export function localStorageAdapter<T = unknown>(key: string): StorageAdapter<T> {
  return {
    load(): T | null {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    save(data: T): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch { /* QuotaExceededError or SecurityError */ }
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch { /* SecurityError */ }
    },
  };
}
