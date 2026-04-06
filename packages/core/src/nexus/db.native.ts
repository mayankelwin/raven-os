/**
 * NexusDB — Persistent Native Storage (V1)
 * Provides the Mobile/Native implementation for the local-first database.
 * Uses AsyncStorage as the underlying driver.
 */

import { Platform } from 'react-native';

// Note: To avoid bundling errors on Web, we only import AsyncStorage in Native context.
let AsyncStorage: any;
if (Platform.OS !== 'web') {
    try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (e) {
        console.warn('[NEXUS DB] @react-native-async-storage/async-storage not found. Falling back to non-persistent mode.');
    }
}

export const NexusDB = {
  /**
   * Save a Nexus object to local persistent storage (Native).
   */
  async put(namespace: string, key: string, value: any): Promise<void> {
    const storageKey = `@nexus_db:${namespace}:${key}`;
    if (AsyncStorage) {
        await AsyncStorage.setItem(storageKey, JSON.stringify({
            value,
            timestamp: Date.now()
        }));
    }
  },

  /**
   * Retrieve a Nexus object from local persistent storage (Native).
   */
  async get(namespace: string, key: string): Promise<any | null> {
    const storageKey = `@nexus_db:${namespace}:${key}`;
    if (AsyncStorage) {
        const data = await AsyncStorage.getItem(storageKey);
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
   * List all keys in a namespace (Native).
   */
  async list(namespace: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    if (AsyncStorage) {
        const keys = await AsyncStorage.getAllKeys();
        const prefix = `@nexus_db:${namespace}:`;
        const nexusKeys = keys.filter((k: string) => k.startsWith(prefix));
        
        for (const k of nexusKeys) {
            const rawValue = await AsyncStorage.getItem(k);
            if (rawValue) {
                const data = JSON.parse(rawValue);
                result[k.replace(prefix, '')] = data.value;
            }
        }
    }
    return result;
  }
};
