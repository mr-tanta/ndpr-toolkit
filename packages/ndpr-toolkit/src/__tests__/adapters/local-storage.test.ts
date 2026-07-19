import { localStorageAdapter } from '../../adapters/local-storage';
import { StorageAdapterError } from '../../adapters/types';

const mockLocalStorage = (() => {
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

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('localStorageAdapter', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('returns null when no data is stored', () => {
    expect(localStorageAdapter('test_key').load()).toBeNull();
  });

  it('saves and loads data', () => {
    const adapter = localStorageAdapter<{ name: string }>('test_key');
    const data = { name: 'test' };
    adapter.save(data);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test_key',
      JSON.stringify(data),
    );
    expect(adapter.load()).toEqual(data);
  });

  it('removes data', () => {
    const adapter = localStorageAdapter('test_key');
    adapter.save({ value: 1 });
    adapter.remove();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('reports corrupted JSON and returns null', () => {
    mockLocalStorage.setItem('test_key', 'not-json');
    const onError = jest.fn();
    const adapter = localStorageAdapter('test_key', { onError });
    expect(adapter.load()).toBeNull();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'load', medium: 'local-storage' }),
    );
  });

  it('throws an observable error on quota failure by default', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
    });
    const onError = jest.fn();
    const adapter = localStorageAdapter('test_key', { onError });
    expect(() => adapter.save({ big: 'data' })).toThrow(StorageAdapterError);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'save', key: 'test_key' }),
    );
  });

  it('throws an observable error on security failure during remove', () => {
    mockLocalStorage.removeItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = localStorageAdapter('test_key', { onError: jest.fn() });
    expect(() => adapter.remove()).toThrow(StorageAdapterError);
  });

  it('supports explicitly graceful best-effort mutations', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const onError = jest.fn();
    const adapter = localStorageAdapter('test_key', {
      mutationFailureMode: 'graceful',
      onError,
    });
    expect(() => adapter.save({ secret: 'data' })).not.toThrow();
    expect(onError).toHaveBeenCalled();
  });

  it('declares client-state-only capabilities', () => {
    expect(localStorageAdapter('test_key').capabilities).toEqual(
      expect.objectContaining({
        durability: 'best-effort',
        evidenceSuitability: 'ux-state-only',
        serverReadable: false,
      }),
    );
  });

  it('returns safely when window is undefined (SSR)', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as Record<string, unknown>).window;
    try {
      const adapter = localStorageAdapter('ssr_key');
      expect(() => adapter.save({ ssr: true })).not.toThrow();
      expect(() => adapter.remove()).not.toThrow();
      expect(adapter.load()).toBeNull();
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
