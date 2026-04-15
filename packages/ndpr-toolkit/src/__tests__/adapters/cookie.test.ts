import { cookieAdapter } from '../../adapters/cookie';

/**
 * Mock document.cookie as a getter/setter that behaves like a real
 * cookie jar: setter appends (keyed by name), getter returns the
 * semicolon-separated "name=value" pairs.
 */
function createCookieJar() {
  const jar: Record<string, string> = {};
  let lastSetRaw = '';

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return Object.entries(jar)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    },
    set(raw: string) {
      lastSetRaw = raw;
      // Extract the first "key=value" portion (before any ";")
      const semi = raw.indexOf(';');
      const pair = semi === -1 ? raw : raw.slice(0, semi);
      const eqIdx = pair.indexOf('=');
      const name = pair.slice(0, eqIdx);
      const value = pair.slice(eqIdx + 1);

      // If the cookie is being expired, remove it from the jar
      if (raw.includes('expires=Thu, 01 Jan 1970')) {
        delete jar[name];
      } else {
        jar[name] = value;
      }
    },
  });

  return {
    jar,
    /** Returns the raw string that was last assigned to document.cookie */
    getLastSetRaw: () => lastSetRaw,
    clear() {
      for (const k of Object.keys(jar)) delete jar[k];
      lastSetRaw = '';
    },
  };
}

describe('cookieAdapter', () => {
  const cookieJar = createCookieJar();

  beforeEach(() => {
    cookieJar.clear();
  });

  // -----------------------------------------------------------
  // 1. Value with `=` characters
  // -----------------------------------------------------------
  describe('value with = characters', () => {
    it('round-trips a value containing equals signs', () => {
      const adapter = cookieAdapter<{ token: string }>('auth');
      const data = { token: 'abc=def==' };

      adapter.save(data);
      const loaded = adapter.load() as { token: string } | null;

      expect(loaded).toEqual(data);
      expect(loaded!.token).toBe('abc=def==');
    });
  });

  // -----------------------------------------------------------
  // 2. SameSite=None forces Secure
  // -----------------------------------------------------------
  describe('SameSite=None forces Secure', () => {
    it('adds Secure flag even when secure option is false', () => {
      const adapter = cookieAdapter('sess', { sameSite: 'None', secure: false });
      adapter.save({ ok: true });

      const raw = cookieJar.getLastSetRaw();
      expect(raw).toContain('; secure');
      expect(raw).toContain('samesite=None');
    });

    it('does not double-add Secure when both sameSite=None and secure=true', () => {
      const adapter = cookieAdapter('sess', { sameSite: 'None', secure: true });
      adapter.save({ ok: true });

      const raw = cookieJar.getLastSetRaw();
      // Should contain exactly one "; secure"
      const matches = raw.match(/; secure/g);
      expect(matches).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------
  // 3. Key encoding (spaces / special chars)
  // -----------------------------------------------------------
  describe('key encoding', () => {
    it('encodes a key with spaces and special characters', () => {
      const adapter = cookieAdapter<string>('my key;test');
      adapter.save('hello');

      const raw = cookieJar.getLastSetRaw();
      const encodedKey = encodeURIComponent('my key;test');
      // The raw cookie string should start with the encoded key
      expect(raw.startsWith(`${encodedKey}=`)).toBe(true);

      // Round-trip: load should still work
      expect(adapter.load()).toBe('hello');
    });

    it('does not corrupt the jar when key contains =', () => {
      const adapter = cookieAdapter<number>('k=ey');
      adapter.save(42);
      expect(adapter.load()).toBe(42);
    });
  });

  // -----------------------------------------------------------
  // 4. Expires <= 0 (session cookie)
  // -----------------------------------------------------------
  describe('expires <= 0 produces session cookie', () => {
    it('omits expires attribute when expires is 0', () => {
      const adapter = cookieAdapter('sess', { expires: 0 });
      adapter.save({ a: 1 });

      const raw = cookieJar.getLastSetRaw();
      expect(raw).not.toContain('expires=');
    });

    it('omits expires attribute when expires is negative', () => {
      const adapter = cookieAdapter('sess', { expires: -1 });
      adapter.save({ a: 1 });

      const raw = cookieJar.getLastSetRaw();
      expect(raw).not.toContain('expires=');
    });
  });

  // -----------------------------------------------------------
  // 5. Expires > 0 sets a future date
  // -----------------------------------------------------------
  describe('expires > 0 sets future expiry', () => {
    it('includes a future expires date when expires is 30', () => {
      const now = new Date();
      const adapter = cookieAdapter('pref', { expires: 30 });
      adapter.save({ theme: 'dark' });

      const raw = cookieJar.getLastSetRaw();
      expect(raw).toContain('expires=');

      // Extract the date from the raw cookie string
      const expiresMatch = raw.match(/expires=([^;]+)/);
      expect(expiresMatch).not.toBeNull();

      const expiryDate = new Date(expiresMatch![1]);
      // The expiry should be roughly 30 days from now (allow 1 second tolerance)
      const expectedMs = now.getTime() + 30 * 24 * 60 * 60 * 1000;
      expect(Math.abs(expiryDate.getTime() - expectedMs)).toBeLessThan(2000);
    });
  });

  // -----------------------------------------------------------
  // 6. SSR safety (document is undefined)
  // -----------------------------------------------------------
  describe('SSR safety', () => {
    // In jsdom, `document` is non-configurable on globalThis, so we
    // cannot delete or redefine it. Instead we mock `typeof document`
    // by temporarily shadowing it on `global` via delete + restore.
    const docDescriptor = Object.getOwnPropertyDescriptor(global, 'document')!;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).document;
    });

    afterEach(() => {
      Object.defineProperty(global, 'document', docDescriptor);
    });

    it('load returns null when document is undefined', () => {
      const adapter = cookieAdapter('key');
      expect(adapter.load()).toBeNull();
    });

    it('save does not throw when document is undefined', () => {
      const adapter = cookieAdapter('key');
      expect(() => adapter.save({ x: 1 })).not.toThrow();
    });

    it('remove does not throw when document is undefined', () => {
      const adapter = cookieAdapter('key');
      expect(() => adapter.remove()).not.toThrow();
    });
  });

  // -----------------------------------------------------------
  // 7. Round-trip with complex JSON
  // -----------------------------------------------------------
  describe('round-trip with complex JSON', () => {
    it('preserves deeply nested objects', () => {
      const adapter = cookieAdapter<Record<string, unknown>>('complex');
      const data = {
        user: {
          name: 'Ada Lovelace',
          roles: ['admin', 'editor'],
          settings: {
            theme: 'dark',
            notifications: { email: true, sms: false },
          },
        },
        meta: { version: 2, tags: ['a', 'b', 'c'] },
        flag: true,
        count: 0,
        nothing: null,
      };

      adapter.save(data);
      const loaded = adapter.load();

      expect(loaded).toEqual(data);
    });

    it('preserves strings with special characters', () => {
      const adapter = cookieAdapter<{ msg: string }>('msg');
      const data = { msg: 'hello "world" & <foo>; bar=baz' };

      adapter.save(data);
      expect(adapter.load()).toEqual(data);
    });
  });

  // -----------------------------------------------------------
  // Bonus: remove deletes the cookie
  // -----------------------------------------------------------
  describe('remove', () => {
    it('removes a previously saved cookie', () => {
      const adapter = cookieAdapter('rm-test');
      adapter.save({ v: 1 });
      expect(adapter.load()).toEqual({ v: 1 });

      adapter.remove();
      expect(adapter.load()).toBeNull();
    });
  });
});
