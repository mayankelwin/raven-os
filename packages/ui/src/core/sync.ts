import { useState, useEffect, useCallback } from 'react';

/**
 * Raven-Os Persistence Driver (V1)
 * Handles cross-platform state persistence.
 */
const RavenStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    // Mobile context check will happen via async-storage in V10.1
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  }
};

/**
 * Raven-Os State Bridge (V2)
 * Provides real-time and persistent state synchronization.
 */
export const RavenSync = {
  /**
   * Broadcast a state change to all other connected platforms.
   */
  broadcast: (key: string, value: any, options: { persist?: boolean } = {}) => {
    const payload = JSON.stringify({ 
      type: 'sync', 
      key, 
      value, 
      persist: options.persist,
      timestamp: Date.now(),
      platform: typeof window !== 'undefined' ? 'web' : 'mobile'
    });

    if (typeof window !== 'undefined' && (window as any).__RAVEN_WS__) {
      (window as any).__RAVEN_WS__.send(payload);
    }
    
    // Persist if requested
    if (options.persist) {
      RavenStorage.setItem(`raven_sync:${key}`, JSON.stringify(value));
    }
  }
};

/**
 * Hook to synchronize and optionally persist state across Raven platforms.
 */
export function useRavenSync<T>(
  key: string, 
  initialValue: T, 
  options: { persist?: boolean } = {}
): [T, (val: T) => void] {
  const [state, setState] = useState<T>(initialValue);

  // 1. Initial re-hydration (Persistence)
  useEffect(() => {
    if (options.persist) {
      RavenStorage.getItem(`raven_sync:${key}`).then((val) => {
        if (val) {
          try {
            setState(JSON.parse(val));
          } catch (e) {
            // Invalid data
          }
        }
      });
    }
  }, [key, options.persist]);

  // 2. Listen for sync events from the Raven Hub
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = (event: any) => {
      const { detail } = event;
      if (detail.key === key) {
        setState(detail.value);
        // Also persist if this key is marked as persistent locally
        if (options.persist) {
          RavenStorage.setItem(`raven_sync:${key}`, JSON.stringify(detail.value));
        }
      }
    };

    window.addEventListener('raven-sync', handleSync);
    return () => window.removeEventListener('raven-sync', handleSync);
  }, [key, options.persist]);

  // 3. Wrapper for setter that also broadcasts
  const setSyncState = useCallback((value: T) => {
    setState(value);
    RavenSync.broadcast(key, value, options);
  }, [key, options]);

  return [state, setSyncState];
}
