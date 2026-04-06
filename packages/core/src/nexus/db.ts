/**
 * NexusDB — Persistent Local-First Storage (V1)
 * Provides a unified API for data persistence across Web and Mobile.
 */

export const NexusDB = {
  /**
   * Save a Nexus object to local persistent storage.
   */
  async put(namespace: string, key: string, value: any): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      // For V12 we'll use LocalStorage as a fallback, but IndexedDB is planned for V12.1.
      const storageKey = `nexus_db:${namespace}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    }
  },

  /**
   * Retrieve a Nexus object from local persistent storage.
   */
  async get(namespace: string, key: string): Promise<any | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storageKey = `nexus_db:${namespace}:${key}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
          try {
              return JSON.parse(data).value;
          } catch (e) {
              return null;
          }
      }
    }
    return null;
  },

  /**
   * List all keys in a namespace (e.g., all high scores).
   */
  async list(namespace: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      const prefix = `nexus_db:${namespace}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const rawValue = localStorage.getItem(key);
          if (rawValue) {
              const data = JSON.parse(rawValue);
              result[key.replace(prefix, '')] = data.value;
          }
        }
      }
    }
    return result;
  }
};
