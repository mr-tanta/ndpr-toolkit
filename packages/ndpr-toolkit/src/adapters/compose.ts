import type { StorageAdapter } from './types';

/**
 * Compose a primary adapter with one or more secondary adapters. Reads
 * always go to the primary; writes (`save` / `remove`) fan out to the
 * primary first, then each secondary. Secondary failures are logged but
 * never propagated.
 *
 * Useful for shadowing localStorage to an API endpoint, mirroring consent
 * to a cookie for SSR, or building offline-first sync.
 *
 * @example
 * ```ts
 * import {
 *   composeAdapters,
 *   localStorageAdapter,
 *   apiAdapter,
 * } from '@tantainnovative/ndpr-toolkit/adapters';
 * import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * const adapter = composeAdapters(
 *   localStorageAdapter('ndpr_consent'),
 *   apiAdapter('/api/consent'),
 * );
 * useConsent({ options, adapter });
 * ```
 */
export function composeAdapters<T = unknown>(
  primary: StorageAdapter<T>,
  ...secondaries: StorageAdapter<T>[]
): StorageAdapter<T> {
  return {
    load(): T | null | Promise<T | null> {
      return primary.load();
    },
    save(data: T): void | Promise<void> {
      const primaryResult = primary.save(data);
      const runSecondaries = () => {
        for (const adapter of secondaries) {
          try {
            const result = adapter.save(data);
            if (result instanceof Promise) {
              result.catch((err) => console.warn('[ndpr-toolkit] Secondary adapter save failed:', err));
            }
          }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter save failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      runSecondaries();
    },
    remove(): void | Promise<void> {
      const primaryResult = primary.remove();
      const runSecondaries = () => {
        for (const adapter of secondaries) {
          try {
            const result = adapter.remove();
            if (result instanceof Promise) {
              result.catch((err) => console.warn('[ndpr-toolkit] Secondary adapter remove failed:', err));
            }
          }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter remove failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      runSecondaries();
    },
  };
}
