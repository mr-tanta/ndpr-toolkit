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
      const runSecondaries = () => {
        for (const adapter of secondaries) {
          try { adapter.save(data); }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter save failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      runSecondaries();
    },
    remove(): void | Promise<void> {
      const primaryResult = primary.remove();
      const runSecondaries = () => {
        for (const adapter of secondaries) {
          try { adapter.remove(); }
          catch (err) { console.warn('[ndpr-toolkit] Secondary adapter remove failed:', err); }
        }
      };
      if (primaryResult instanceof Promise) {
        return primaryResult.then(() => runSecondaries());
      }
      runSecondaries();
    },
  };
}
