import { composeAdapters } from '../../adapters/compose';
import { memoryAdapter } from '../../adapters/memory';
import type { StorageAdapter } from '../../adapters/types';

describe('composeAdapters', () => {
  it('loads from the primary (first) adapter', () => {
    const primary = memoryAdapter<string>('from-primary');
    const secondary = memoryAdapter<string>('from-secondary');
    const composed = composeAdapters(primary, secondary);
    expect(composed.load()).toBe('from-primary');
  });

  it('saves to all adapters', () => {
    const primary = memoryAdapter<string>();
    const secondary = memoryAdapter<string>();
    const composed = composeAdapters(primary, secondary);
    composed.save('shared-data');
    expect(primary.load()).toBe('shared-data');
    expect(secondary.load()).toBe('shared-data');
  });

  it('removes from all adapters', () => {
    const primary = memoryAdapter<string>('data');
    const secondary = memoryAdapter<string>('data');
    const composed = composeAdapters(primary, secondary);
    composed.remove();
    expect(primary.load()).toBeNull();
    expect(secondary.load()).toBeNull();
  });

  it('does not block on secondary adapter failure', async () => {
    const primary = memoryAdapter<string>();
    const failing: StorageAdapter<string> = {
      load: () => null,
      save: () => { throw new Error('network down'); },
      remove: () => { throw new Error('network down'); },
    };
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const composed = composeAdapters(primary, failing);
    await composed.save('data');
    expect(primary.load()).toBe('data');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('sync + sync save returns void (not a Promise)', () => {
    const primary = memoryAdapter<string>();
    const secondary = memoryAdapter<string>();
    const composed = composeAdapters(primary, secondary);
    const result = composed.save('test');
    expect(result instanceof Promise).toBe(false);
    expect(result).toBeUndefined();
  });

  it('sync + sync remove returns void (not a Promise)', () => {
    const primary = memoryAdapter<string>('data');
    const secondary = memoryAdapter<string>('data');
    const composed = composeAdapters(primary, secondary);
    const result = composed.remove();
    expect(result instanceof Promise).toBe(false);
    expect(result).toBeUndefined();
  });

  it('async + sync save returns a Promise', () => {
    const asyncAdapter: StorageAdapter<string> = {
      load: () => Promise.resolve(null),
      save: () => Promise.resolve(),
      remove: () => Promise.resolve(),
    };
    const secondary = memoryAdapter<string>();
    const composed = composeAdapters(asyncAdapter, secondary);
    const result = composed.save('test');
    expect(result instanceof Promise).toBe(true);
  });

  it('propagates data to both individual adapters', () => {
    const primary = memoryAdapter<string>();
    const secondary = memoryAdapter<string>();
    const composed = composeAdapters(primary, secondary);
    composed.save('propagated');
    expect(primary.load()).toBe('propagated');
    expect(secondary.load()).toBe('propagated');
  });

  it('secondary failure in save does not crash the composed adapter', () => {
    const primary = memoryAdapter<string>();
    const crashy: StorageAdapter<string> = {
      load: () => null,
      save: () => { throw new Error('boom'); },
      remove: () => {},
    };
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(() => {
      composeAdapters(primary, crashy).save('safe');
    }).not.toThrow();
    expect(primary.load()).toBe('safe');
    warnSpy.mockRestore();
  });
});
