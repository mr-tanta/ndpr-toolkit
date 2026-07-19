import type {
  StorageAdapter,
  StorageAdapterCapabilities,
} from './types';

const CAPABILITIES: Readonly<StorageAdapterCapabilities> = Object.freeze({
  medium: 'memory',
  durability: 'ephemeral',
  integrity: 'none',
  concurrency: 'none',
  evidenceSuitability: 'none',
  serverReadable: false,
});

/**
 * Storage adapter backed by an in-memory value. Useful in tests, Storybook,
 * SSR previews, or anywhere persistence across reloads is undesirable.
 */
export function memoryAdapter<T = unknown>(initialData?: T): StorageAdapter<T> {
  let data: T | null = initialData ?? null;
  return {
    capabilities: CAPABILITIES,
    load(): T | null {
      return data;
    },
    save(newData: T): void {
      data = newData;
    },
    remove(): void {
      data = null;
    },
  };
}
