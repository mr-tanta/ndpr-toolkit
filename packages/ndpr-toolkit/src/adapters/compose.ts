import type { StorageAdapter } from './types';

export function composeAdapters<T = unknown>(
  primary: StorageAdapter<T>,
  ...secondaries: StorageAdapter<T>[]
): StorageAdapter<T> {
  return {
    load(): T | null | Promise<T | null> {
      return primary.load();
    },
    save(data: T): void | Promise<void> {
      const primaryResult = primary.save(data);
      const runSecondaries = async () => {
        for (const adapter of secondaries) {
          try { await adapter.save(data); }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter save failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      return runSecondaries();
    },
    remove(): void | Promise<void> {
      const primaryResult = primary.remove();
      const runSecondaries = async () => {
        for (const adapter of secondaries) {
          try { await adapter.remove(); }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter remove failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      return runSecondaries();
    },
  };
}
