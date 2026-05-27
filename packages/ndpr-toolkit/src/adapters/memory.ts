import type { StorageAdapter } from './types';

/**
 * Storage adapter backed by an in-memory value. Useful in tests, Storybook,
 * SSR previews, or anywhere persistence across reloads is undesirable.
 *
 * @example
 * ```ts
 * import { memoryAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
 * import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';
 *
 * const adapter = memoryAdapter({ consents: {}, version: '1.0' });
 * useConsent({ options, adapter });
 * ```
 */
export function memoryAdapter<T = unknown>(initialData?: T): StorageAdapter<T> {
  let data: T | null = initialData ?? null;
  return {
    load(): T | null { return data; },
    save(newData: T): void { data = newData; },
    remove(): void { data = null; },
  };
}
