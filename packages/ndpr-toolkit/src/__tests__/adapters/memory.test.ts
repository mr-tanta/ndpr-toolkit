import { memoryAdapter } from '../../adapters/memory';

describe('memoryAdapter', () => {
  it('returns null when empty', () => {
    const adapter = memoryAdapter();
    expect(adapter.load()).toBeNull();
  });
  it('saves and loads data', () => {
    const adapter = memoryAdapter<{ count: number }>();
    adapter.save({ count: 42 });
    expect(adapter.load()).toEqual({ count: 42 });
  });
  it('removes data', () => {
    const adapter = memoryAdapter();
    adapter.save({ value: 'hello' });
    adapter.remove();
    expect(adapter.load()).toBeNull();
  });
  it('accepts initial data', () => {
    const adapter = memoryAdapter<string>('initial');
    expect(adapter.load()).toBe('initial');
  });
});
