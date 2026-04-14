import type { StorageAdapter } from './types';

export interface CookieAdapterOptions {
  domain?: string;
  path?: string;
  expires?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export function cookieAdapter<T = unknown>(
  key: string,
  options: CookieAdapterOptions = {}
): StorageAdapter<T> {
  const { domain, path = '/', expires = 365, secure = true, sameSite = 'Lax' } = options;
  return {
    load(): T | null {
      if (typeof document === 'undefined') return null;
      try {
        const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${key}=`));
        if (!match) return null;
        return JSON.parse(decodeURIComponent(match.split('=')[1])) as T;
      } catch { return null; }
    },
    save(data: T): void {
      if (typeof document === 'undefined') return;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expires);
      let cookie = `${key}=${encodeURIComponent(JSON.stringify(data))}; path=${path}; expires=${expiryDate.toUTCString()}; samesite=${sameSite}`;
      if (domain) cookie += `; domain=${domain}`;
      if (secure) cookie += '; secure';
      document.cookie = cookie;
    },
    remove(): void {
      if (typeof document === 'undefined') return;
      let cookie = `${key}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (domain) cookie += `; domain=${domain}`;
      document.cookie = cookie;
    },
  };
}
