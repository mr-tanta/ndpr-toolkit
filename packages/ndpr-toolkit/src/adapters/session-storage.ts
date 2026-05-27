import type { StorageAdapter } from './types';

/**
 * Storage adapter backed by `window.sessionStorage`. Data is scoped to the
 * current tab and discarded when the tab closes — useful for consent
 * choices that should not survive a fresh session.
 *
 * @example
 * ```ts
 * import { sessionStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
 * import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * const adapter = sessionStorageAdapter('ndpr_consent');
 * useConsent({ options, adapter });
 * ```
 */
export function sessionStorageAdapter<T = unknown>(key: string): StorageAdapter<T> {
  return {
    load(): T | null {
      if (typeof window === 'undefined') return null;
      try {
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch { return null; }
    },
    save(data: T): void {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
      } catch { /* QuotaExceededError or SecurityError */ }
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.removeItem(key);
      } catch { /* SecurityError */ }
    },
  };
}
