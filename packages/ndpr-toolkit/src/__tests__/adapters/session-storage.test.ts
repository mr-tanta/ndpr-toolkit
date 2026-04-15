import { sessionStorageAdapter } from '../../adapters/session-storage';

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('sessionStorageAdapter', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });

  it('returns null when no data is stored', () => {
    const adapter = sessionStorageAdapter('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('saves and loads data', () => {
    const adapter = sessionStorageAdapter<{ name: string }>('test_key');
    const data = { name: 'test' };
    adapter.save(data);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
    const loaded = adapter.load();
    expect(loaded).toEqual(data);
  });

  it('removes data', () => {
    const adapter = sessionStorageAdapter('test_key');
    adapter.save({ value: 1 });
    adapter.remove();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('returns null on corrupted JSON', () => {
    mockSessionStorage.setItem('test_key', 'not-json');
    const adapter = sessionStorageAdapter('test_key');
    expect(adapter.load()).toBeNull();
  });

  it('does not throw on QuotaExceededError during save', () => {
    mockSessionStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
    });
    const adapter = sessionStorageAdapter('test_key');
    expect(() => adapter.save({ big: 'data' })).not.toThrow();
  });

  it('does not throw on SecurityError during save', () => {
    mockSessionStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = sessionStorageAdapter('test_key');
    expect(() => adapter.save({ secret: 'data' })).not.toThrow();
  });

  it('does not throw on SecurityError during remove', () => {
    mockSessionStorage.removeItem.mockImplementationOnce(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const adapter = sessionStorageAdapter('test_key');
    expect(() => adapter.remove()).not.toThrow();
  });

  it('writes data correctly when no error occurs', () => {
    const adapter = sessionStorageAdapter<{ count: number; label: string }>('write_key');
    const payload = { count: 42, label: 'hello' };
    adapter.save(payload);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('write_key', JSON.stringify(payload));
    const loaded = adapter.load();
    expect(loaded).toEqual(payload);
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
