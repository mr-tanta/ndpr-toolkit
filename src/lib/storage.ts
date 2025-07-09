"use client";

/**
 * Safe localStorage wrapper with error handling
 */
export class SafeStorage {
  private static isStorageAvailable(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static getItem<T = unknown>(key: string, defaultValue?: T): T | null {
    if (!this.isStorageAvailable()) {
      console.warn("localStorage is not available");
      return defaultValue ?? null;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;

      // Try to parse as JSON, otherwise return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue ?? null;
    }
  }

  static setItem(key: string, value: unknown): boolean {
    if (!this.isStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "QuotaExceededError") {
          console.error("localStorage quota exceeded");
          // Try to clear old data
          this.clearOldData();
          // Retry once
          try {
            const serialized =
              typeof value === "string" ? value : JSON.stringify(value);
            window.localStorage.setItem(key, serialized);
            return true;
          } catch {
            console.error("Failed to save after clearing old data");
            return false;
          }
        }
      }
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  }

  static removeItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage", error);
      return false;
    }
  }

  /**
   * Get storage size in bytes
   */
  static getStorageSize(): number {
    if (!this.isStorageAvailable()) return 0;

    let size = 0;
    try {
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          size += window.localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error("Error calculating storage size", error);
    }
    return size;
  }

  /**
   * Clear old data based on timestamp
   * Removes items older than specified days
   */
  static clearOldData(daysOld: number = 30): void {
    if (!this.isStorageAvailable()) return;

    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    try {
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          try {
            const item = window.localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed.timestamp && parsed.timestamp < cutoffTime) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // If parsing fails, skip this item
          }
        }
      }

      // Remove old items
      keysToRemove.forEach((key) => this.removeItem(key));
    } catch (error) {
      console.error("Error clearing old data", error);
    }
  }

  /**
   * Wrapper for data with timestamp
   */
  static setItemWithTimestamp(key: string, value: unknown): boolean {
    const wrappedData = {
      data: value,
      timestamp: Date.now(),
    };
    return this.setItem(key, wrappedData);
  }

  /**
   * Get item with timestamp check
   */
  static getItemWithTimestamp<T = unknown>(
    key: string,
    maxAge?: number,
  ): T | null {
    const wrapped = this.getItem<{ data: T; timestamp: number }>(key);
    if (!wrapped) return null;

    if (maxAge && wrapped.timestamp) {
      const age = Date.now() - wrapped.timestamp;
      if (age > maxAge) {
        this.removeItem(key);
        return null;
      }
    }

    return wrapped.data;
  }
}

// Retry decorator for storage operations
export function withRetry<T extends (...args: unknown[]) => unknown>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 100,
): T {
  return ((...args: Parameters<T>) => {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return fn(...args);
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          // Wait before retrying
          const waitTime = delay * Math.pow(2, i); // Exponential backoff
          const start = Date.now();
          while (Date.now() - start < waitTime) {
            // Busy wait
          }
        }
      }
    }

    throw lastError;
  }) as T;
}

// Export a default instance
export const storage = SafeStorage;
