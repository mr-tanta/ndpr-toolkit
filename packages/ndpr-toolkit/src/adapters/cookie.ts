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
        const encodedKey = encodeURIComponent(key);
        const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${encodedKey}=`));
        if (!match) return null;
        const eqIdx = match.indexOf('=');
        return JSON.parse(decodeURIComponent(match.slice(eqIdx + 1))) as T;
      } catch { return null; }
    },
    save(data: T): void {
      if (typeof document === 'undefined') return;
      const effectiveSecure = secure || sameSite === 'None';
      let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(data))}; path=${path}; samesite=${sameSite}`;
      if (expires > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expires);
        cookie += `; expires=${expiryDate.toUTCString()}`;
      }
      if (domain) cookie += `; domain=${domain}`;
      if (effectiveSecure) cookie += '; secure';
      document.cookie = cookie;
    },
    remove(): void {
      if (typeof document === 'undefined') return;
      let cookie = `${encodeURIComponent(key)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (domain) cookie += `; domain=${domain}`;
      document.cookie = cookie;
    },
  };
}
