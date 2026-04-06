/**
 * Raven-Os Universal Storage API
 * Handles persistence across Web (localStorage) and Mobile (Native-specific).
 */

export interface RavenStorageEngine {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

// In-memory fallback for environments without storage (SSR, or before initialization)
class MemoryStorage implements RavenStorageEngine {
  private cache = new Map<string, string>();
  async getItem(key: string) { return this.cache.get(key) || null; }
  async setItem(key: string, value: string) { this.cache.set(key, value); }
  async removeItem(key: string) { this.cache.delete(key); }
  async clear() { this.cache.clear(); }
}

const isWeb = typeof window !== 'undefined' && !!window.localStorage;

// Standard Web implementation
const WebStorage: RavenStorageEngine = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
  clear: async () => localStorage.clear(),
};

/**
 * The main Storage instance.
 * By default, detects Web vs Memory. 
 * Can be overridden by the RavenProvider initialization.
 */
let currentEngine: RavenStorageEngine = isWeb ? WebStorage : new MemoryStorage();

export const RavenStorage = {
  get engine() { return currentEngine; },
  set engine(newEngine: RavenStorageEngine) { currentEngine = newEngine; },

  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await currentEngine.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error(`[Raven-Os] Storage Error (Get ${key}):`, e);
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      await currentEngine.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Raven-Os] Storage Error (Set ${key}):`, e);
    }
  },

  async remove(key: string): Promise<void> {
    await currentEngine.removeItem(key);
  },
};
