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
});
