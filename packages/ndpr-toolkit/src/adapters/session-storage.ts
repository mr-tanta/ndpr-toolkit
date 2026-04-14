import type { StorageAdapter } from './types';

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
      sessionStorage.setItem(key, JSON.stringify(data));
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(key);
    },
  };
}
