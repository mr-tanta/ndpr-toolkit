import { localStorageAdapter } from '../../adapters/local-storage';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('localStorageAdapter', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('returns null when no data is stored', () => {
    const adapter = localStorageAdapter('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('saves and loads data', () => {
    const adapter = localStorageAdapter<{ name: string }>('test_key');
    const data = { name: 'test' };
    adapter.save(data);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
    const loaded = adapter.load();
    expect(loaded).toEqual(data);
  });

  it('removes data', () => {
    const adapter = localStorageAdapter('test_key');
    adapter.save({ value: 1 });
    adapter.remove();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('returns null on corrupted JSON', () => {
    mockLocalStorage.setItem('test_key', 'not-json');
    const adapter = localStorageAdapter('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('does not throw on QuotaExceededError during save', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
    });
    const adapter = localStorageAdapter('test_key');
    expect(() => adapter.save({ big: 'data' })).not.toThrow();
  });

  it('does not throw on SecurityError during save', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = localStorageAdapter('test_key');
    expect(() => adapter.save({ secret: 'data' })).not.toThrow();
  });

  it('does not throw on SecurityError during remove', () => {
    mockLocalStorage.removeItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = localStorageAdapter('test_key');
    expect(() => adapter.remove()).not.toThrow();
  });

  it('writes data correctly when no error occurs', () => {
    const adapter = localStorageAdapter<{ count: number; label: string }>('write_key');
    const payload = { count: 42, label: 'hello' };
    adapter.save(payload);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('write_key', JSON.stringify(payload));
    const loaded = adapter.load();
    expect(loaded).toEqual(payload);
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
