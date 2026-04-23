import { createAuditEntry, getAuditLog, appendAuditEntry, ConsentAuditEntry } from '../../utils/consent-audit';
import { ConsentSettings } from '../../types/consent';

// Helper to build a ConsentSettings object
function makeSettings(overrides: Partial<ConsentSettings> = {}): ConsentSettings {
  return {
    consents: { necessary: true, analytics: false },
    timestamp: 1700000000000,
    version: '1.0',
    method: 'banner',
    hasInteracted: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createAuditEntry
// ---------------------------------------------------------------------------
describe('createAuditEntry', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('creates an entry with correct fields (action, categories, timestamp, userAgent)', () => {
    // Ensure navigator.userAgent is available
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'TestBrowser/1.0' },
      writable: true,
      configurable: true,
    });

    const settings = makeSettings();
    const entry = createAuditEntry(settings);

    expect(entry.action).toBe('consent_given');
    expect(entry.timestamp).toBe(1700000000000);
    expect(entry.version).toBe('1.0');
    expect(entry.categories).toEqual({ necessary: true, analytics: false });
    expect(entry.method).toBe('banner');
    expect(entry.userAgent).toBe('TestBrowser/1.0');
  });

  it('determines consent_withdrawn when all consents are false', () => {
    const previous = makeSettings({ consents: { necessary: true, analytics: true } });
    const current = makeSettings({ consents: { necessary: false, analytics: false } });
    const entry = createAuditEntry(current, previous);

    expect(entry.action).toBe('consent_withdrawn');
  });

  it('determines consent_withdrawn when a previously-true consent becomes false', () => {
    const previous = makeSettings({ consents: { necessary: true, analytics: true } });
    const current = makeSettings({ consents: { necessary: true, analytics: false } });
    const entry = createAuditEntry(current, previous);

    expect(entry.action).toBe('consent_withdrawn');
  });

  it('determines consent_updated when consents change without revocation', () => {
    const previous = makeSettings({ consents: { necessary: true, analytics: false } });
    const current = makeSettings({ consents: { necessary: true, analytics: true } });
    const entry = createAuditEntry(current, previous);

    expect(entry.action).toBe('consent_updated');
  });

  it('respects actionOverride when provided', () => {
    const settings = makeSettings();
    const entry = createAuditEntry(settings, null, 'consent_expired');

    expect(entry.action).toBe('consent_expired');
  });

  it('handles missing navigator gracefully (SSR)', () => {
    // Remove navigator to simulate SSR
    // @ts-expect-error intentionally removing navigator for SSR test
    delete globalThis.navigator;

    const settings = makeSettings();
    const entry = createAuditEntry(settings);

    expect(entry.userAgent).toBeUndefined();
  });

  it('uses Date.now() when settings.timestamp is falsy', () => {
    const now = Date.now();
    const settings = makeSettings({ timestamp: 0 });
    const entry = createAuditEntry(settings);

    expect(entry.timestamp).toBeGreaterThanOrEqual(now);
  });
});

// ---------------------------------------------------------------------------
// getAuditLog
// ---------------------------------------------------------------------------
describe('getAuditLog', () => {
  const originalWindow = globalThis.window;

  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    // Ensure window is defined
    if (typeof globalThis.window === 'undefined') {
      // @ts-expect-error minimal window stub for testing
      globalThis.window = {};
    }
    // Mock localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => storage[key] ?? null),
        setItem: jest.fn((key: string, value: string) => { storage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete storage[key]; }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error restoring original undefined state
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it('returns empty array when no log exists in localStorage', () => {
    const result = getAuditLog();
    expect(result).toEqual([]);
  });

  it('returns parsed entries from localStorage', () => {
    const entries: ConsentAuditEntry[] = [
      {
        action: 'consent_given',
        timestamp: 1700000000000,
        version: '1.0',
        categories: { necessary: true },
        method: 'banner',
      },
    ];
    storage['ndpr_consent_audit'] = JSON.stringify(entries);

    const result = getAuditLog();
    expect(result).toEqual(entries);
  });

  it('uses custom storage key', () => {
    const entries: ConsentAuditEntry[] = [
      {
        action: 'consent_updated',
        timestamp: 1700000000000,
        version: '2.0',
        categories: { analytics: true },
        method: 'settings',
      },
    ];
    storage['my_key_audit'] = JSON.stringify(entries);

    const result = getAuditLog('my_key');
    expect(result).toEqual(entries);
  });

  it('returns empty array when window is undefined (SSR)', () => {
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    const result = getAuditLog();
    expect(result).toEqual([]);
  });

  it('handles malformed JSON in localStorage gracefully', () => {
    storage['ndpr_consent_audit'] = '{not valid json';

    const result = getAuditLog();
    expect(result).toEqual([]);
  });

  it('returns empty array when stored value is not an array', () => {
    storage['ndpr_consent_audit'] = JSON.stringify({ not: 'an array' });

    const result = getAuditLog();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// appendAuditEntry
// ---------------------------------------------------------------------------
describe('appendAuditEntry', () => {
  const originalWindow = globalThis.window;

  let storage: Record<string, string>;

  const sampleEntry: ConsentAuditEntry = {
    action: 'consent_given',
    timestamp: 1700000000000,
    version: '1.0',
    categories: { necessary: true },
    method: 'banner',
  };

  beforeEach(() => {
    storage = {};
    if (typeof globalThis.window === 'undefined') {
      // @ts-expect-error minimal window stub for testing
      globalThis.window = {};
    }
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => storage[key] ?? null),
        setItem: jest.fn((key: string, value: string) => { storage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete storage[key]; }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error restoring original undefined state
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it('adds entry to existing log', () => {
    const existing: ConsentAuditEntry[] = [
      {
        action: 'consent_given',
        timestamp: 1699999999999,
        version: '1.0',
        categories: { necessary: true },
        method: 'banner',
      },
    ];
    storage['ndpr_consent_audit'] = JSON.stringify(existing);

    appendAuditEntry(sampleEntry);

    const stored = JSON.parse(storage['ndpr_consent_audit']);
    expect(stored).toHaveLength(2);
    expect(stored[1]).toEqual(sampleEntry);
  });

  it('creates new log when none exists', () => {
    appendAuditEntry(sampleEntry);

    const stored = JSON.parse(storage['ndpr_consent_audit']);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(sampleEntry);
  });

  it('handles SSR (no window) gracefully', () => {
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    // Should not throw
    expect(() => appendAuditEntry(sampleEntry)).not.toThrow();
  });

  it('uses custom storage key', () => {
    appendAuditEntry(sampleEntry, 'custom_key');

    const stored = JSON.parse(storage['custom_key_audit']);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(sampleEntry);
  });

  it('handles localStorage errors gracefully', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => { throw new Error('QuotaExceededError'); }),
      },
      writable: true,
      configurable: true,
    });

    // Should not throw even when setItem fails
    expect(() => appendAuditEntry(sampleEntry)).not.toThrow();
  });
});
