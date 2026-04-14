import type { StorageAdapter } from './types';

export function memoryAdapter<T = unknown>(initialData?: T): StorageAdapter<T> {
  let data: T | null = initialData ?? null;
  return {
    load(): T | null { return data; },
    save(newData: T): void { data = newData; },
    remove(): void { data = null; },
  };
}
