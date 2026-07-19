import {
  StorageAdapterError,
  type StorageAdapter,
  type StorageAdapterCapabilities,
  type StorageAdapterErrorContext,
  type StorageAdapterFailureOptions,
  type StorageAdapterOperation,
} from './types';

export interface CookieAdapterOptions extends StorageAdapterFailureOptions {
  domain?: string;
  path?: string;
  expires?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  /** Maximum serialized cookie size in bytes. Defaults to 3800. */
  maxBytes?: number;
}

const CAPABILITIES: Readonly<StorageAdapterCapabilities> = Object.freeze({
  medium: 'cookie',
  durability: 'best-effort',
  integrity: 'unverified-client-state',
  concurrency: 'last-write-wins',
  evidenceSuitability: 'ux-state-only',
  serverReadable: true,
});

function assertSafeAttribute(name: string, value: string): void {
  if (/[^\x20-\x7E]|[;]/.test(value)) {
    throw new TypeError(`Invalid cookie ${name}`);
  }
}

/**
 * Storage adapter backed by a browser-written cookie. The resulting cookie
 * cannot be HttpOnly or cryptographically signed by this client adapter, so
 * treat it as mutable UX/SSR hint state rather than authoritative evidence.
 */
export function cookieAdapter<T = unknown>(
  key: string,
  options: CookieAdapterOptions = {},
): StorageAdapter<T> {
  const {
    domain,
    path = '/',
    expires = 180,
    secure = true,
    sameSite = 'Lax',
    maxBytes = 3800,
    onError,
    mutationFailureMode = 'throw',
  } = options;

  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new RangeError('Cookie maxBytes must be a positive finite number');
  }

  function report(operation: StorageAdapterOperation, error: unknown): StorageAdapterError {
    const context: StorageAdapterErrorContext = {
      operation,
      medium: 'cookie',
      error,
      key,
    };
    if (onError) {
      onError(context);
    } else {
      console.warn(new StorageAdapterError(context).message);
    }
    return new StorageAdapterError(context);
  }

  function buildAttributes(includeExpiry: boolean): string {
    assertSafeAttribute('path', path);
    if (domain) assertSafeAttribute('domain', domain);

    const effectiveSecure = secure || sameSite === 'None';
    let attributes = `; path=${path}; samesite=${sameSite}`;
    if (includeExpiry && expires > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expires);
      attributes += `; expires=${expiryDate.toUTCString()}`;
    }
    if (domain) attributes += `; domain=${domain}`;
    if (effectiveSecure) attributes += '; secure';
    return attributes;
  }

  return {
    capabilities: CAPABILITIES,
    load(): T | null {
      if (typeof document === 'undefined') return null;
      try {
        const encodedKey = encodeURIComponent(key);
        const match = document.cookie
          .split(';')
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith(`${encodedKey}=`));
        if (!match) return null;
        const equalsIndex = match.indexOf('=');
        return JSON.parse(decodeURIComponent(match.slice(equalsIndex + 1))) as T;
      } catch (error) {
        report('load', error);
        return null;
      }
    },
    save(data: T): void {
      if (typeof document === 'undefined') return;
      try {
        const serialized = JSON.stringify(data);
        if (typeof serialized !== 'string') {
          throw new TypeError('Value is not JSON-serializable');
        }
        const cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
          serialized,
        )}${buildAttributes(true)}`;
        if (cookie.length > maxBytes) {
          throw new RangeError(
            `Serialized cookie is ${cookie.length} bytes; maximum is ${maxBytes}`,
          );
        }
        document.cookie = cookie;
      } catch (error) {
        const adapterError = report('save', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
    remove(): void {
      if (typeof document === 'undefined') return;
      try {
        assertSafeAttribute('path', path);
        if (domain) assertSafeAttribute('domain', domain);
        let cookie = `${encodeURIComponent(
          key,
        )}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (domain) cookie += `; domain=${domain}`;
        document.cookie = cookie;
      } catch (error) {
        const adapterError = report('remove', error);
        if (mutationFailureMode === 'throw') throw adapterError;
      }
    },
  };
}
