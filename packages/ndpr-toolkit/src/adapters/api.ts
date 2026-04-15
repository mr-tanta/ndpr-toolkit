import type { StorageAdapter } from './types';

export interface ApiAdapterOptions {
  headers?: Record<string, string>;
}

export function apiAdapter<T = unknown>(
  endpoint: string,
  options: ApiAdapterOptions = {}
): StorageAdapter<T> {
  const baseHeaders = options.headers ?? {};
  return {
    async load(): Promise<T | null> {
      try {
        const res = await fetch(endpoint, { method: 'GET', headers: { ...baseHeaders } });
        if (!res.ok) return null;
        return (await res.json()) as T;
      } catch { return null; }
    },
    async save(data: T): Promise<void> {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...baseHeaders },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          console.warn(`[ndpr-toolkit] Failed to save to ${endpoint}: ${res.status}`);
        }
      } catch { console.warn(`[ndpr-toolkit] Failed to save to ${endpoint}`); }
    },
    async remove(): Promise<void> {
      try {
        const res = await fetch(endpoint, { method: 'DELETE', headers: { ...baseHeaders } });
        if (!res.ok) {
          console.warn(`[ndpr-toolkit] Failed to delete from ${endpoint}: ${res.status}`);
        }
      } catch { console.warn(`[ndpr-toolkit] Failed to delete from ${endpoint}`); }
    },
  };
}
