import {
  composeAdapters,
  ComposedAdapterError,
} from '../../adapters/compose';
import { memoryAdapter } from '../../adapters/memory';
import type { StorageAdapter } from '../../adapters/types';

describe('composeAdapters', () => {
  it('loads from the first adapter with data', () => {
    const empty = memoryAdapter<string>();
    const secondary = memoryAdapter<string>('from-secondary');
    expect(composeAdapters(empty, secondary).load()).toBe('from-secondary');
  });

  it('does not read later adapters when the primary has data', () => {
    const primary = memoryAdapter<string>('from-primary');
    const secondary: StorageAdapter<string> = {
      load: jest.fn(() => 'from-secondary'),
      save: () => {},
      remove: () => {},
    };
    expect(composeAdapters(primary, secondary).load()).toBe('from-primary');
    expect(secondary.load).not.toHaveBeenCalled();
  });

  it('supports async fallback reads', async () => {
    const primary: StorageAdapter<string> = {
      load: async () => null,
      save: async () => {},
      remove: async () => {},
    };
    await expect(
      composeAdapters(primary, memoryAdapter('fallback')).load(),
    ).resolves.toBe('fallback');
  });

  it('saves to and removes from every adapter', () => {
    const primary = memoryAdapter<string>();
    const secondary = memoryAdapter<string>();
    const composed = composeAdapters(primary, secondary);
    composed.save('shared-data');
    expect(primary.load()).toBe('shared-data');
    expect(secondary.load()).toBe('shared-data');
    composed.remove();
    expect(primary.load()).toBeNull();
    expect(secondary.load()).toBeNull();
  });

  it('propagates synchronous secondary failures', () => {
    const primary = memoryAdapter<string>();
    const failing: StorageAdapter<string> = {
      load: () => null,
      save: () => {
        throw new Error('network down');
      },
      remove: () => {},
    };
    expect(() => composeAdapters(primary, failing).save('data')).toThrow(
      ComposedAdapterError,
    );
    // The primary was acknowledged before the secondary failed; callers now
    // receive the failure instead of a false all-adapters success.
    expect(primary.load()).toBe('data');
  });

  it('awaits and propagates asynchronous secondary failures', async () => {
    const primary = memoryAdapter<string>();
    const failing: StorageAdapter<string> = {
      load: () => null,
      save: async () => {
        throw new Error('network down');
      },
      remove: async () => {},
    };
    const result = composeAdapters(primary, failing).save('data');
    expect(result).toBeInstanceOf(Promise);
    await expect(result).rejects.toBeInstanceOf(ComposedAdapterError);
  });

  it('does not start the secondary before an async primary resolves', async () => {
    let resolvePrimary!: () => void;
    const calls: string[] = [];
    const primary: StorageAdapter<string> = {
      load: () => null,
      save: () =>
        new Promise<void>((resolve) => {
          calls.push('primary-start');
          resolvePrimary = () => {
            calls.push('primary-end');
            resolve();
          };
        }),
      remove: async () => {},
    };
    const secondary: StorageAdapter<string> = {
      load: () => null,
      save: () => {
        calls.push('secondary');
      },
      remove: () => {},
    };

    const result = composeAdapters(primary, secondary).save('data');
    expect(calls).toEqual(['primary-start']);
    resolvePrimary();
    await result;
    expect(calls).toEqual(['primary-start', 'primary-end', 'secondary']);
  });

  it('keeps fully synchronous mutations synchronous', () => {
    const composed = composeAdapters(
      memoryAdapter<string>(),
      memoryAdapter<string>(),
    );
    expect(composed.save('test')).toBeUndefined();
    expect(composed.remove()).toBeUndefined();
  });

  it('propagates read failures rather than masking them as fallback data', () => {
    const failing: StorageAdapter<string> = {
      load: () => {
        throw new Error('corrupt source');
      },
      save: () => {},
      remove: () => {},
    };
    expect(() => composeAdapters(failing, memoryAdapter('fallback')).load()).toThrow(
      ComposedAdapterError,
    );
  });
});
