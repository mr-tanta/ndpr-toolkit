import type { StorageAdapter } from './types';

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
