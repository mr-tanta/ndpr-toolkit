import { sessionStorageAdapter } from '../../adapters/session-storage';
import { StorageAdapterError } from '../../adapters/types';

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('sessionStorageAdapter', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });

  it('returns null when no data is stored', () => {
    expect(sessionStorageAdapter('test_key').load()).toBeNull();
  });

  it('saves, loads, and removes data', () => {
    const adapter = sessionStorageAdapter<{ name: string }>('test_key');
    const data = { name: 'test' };
    adapter.save(data);
    expect(adapter.load()).toEqual(data);
    adapter.remove();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('reports corrupted JSON and returns null', () => {
    mockSessionStorage.setItem('test_key', 'not-json');
    const onError = jest.fn();
    const adapter = sessionStorageAdapter('test_key', { onError });
    expect(adapter.load()).toBeNull();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'load',
        medium: 'session-storage',
      }),
    );
  });

  it('throws on quota failure by default', () => {
    mockSessionStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
    });
    const adapter = sessionStorageAdapter('test_key', {
      onError: jest.fn(),
    });
    expect(() => adapter.save({ big: 'data' })).toThrow(StorageAdapterError);
  });

  it('throws on security failure during remove by default', () => {
    mockSessionStorage.removeItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = sessionStorageAdapter('test_key', {
      onError: jest.fn(),
    });
    expect(() => adapter.remove()).toThrow(StorageAdapterError);
  });

  it('supports explicitly graceful best-effort mutations', () => {
    mockSessionStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const onError = jest.fn();
    const adapter = sessionStorageAdapter('test_key', {
      mutationFailureMode: 'graceful',
      onError,
    });
    expect(() => adapter.save({ secret: 'data' })).not.toThrow();
    expect(onError).toHaveBeenCalled();
  });

  it('declares session-scoped, client-state-only capabilities', () => {
    expect(sessionStorageAdapter('test_key').capabilities).toEqual(
      expect.objectContaining({
        durability: 'session',
        evidenceSuitability: 'ux-state-only',
        serverReadable: false,
      }),
    );
  });

  it('returns safely when window is undefined (SSR)', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as Record<string, unknown>).window;
    try {
      const adapter = sessionStorageAdapter('ssr_key');
      expect(() => adapter.save({ ssr: true })).not.toThrow();
      expect(() => adapter.remove()).not.toThrow();
      expect(adapter.load()).toBeNull();
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
