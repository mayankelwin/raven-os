import { create } from 'zustand';
import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { RavenThemes, type RavenThemeColors } from './theme';
import { RavenStorage, type RavenStorageEngine } from './storage';

/**
 * Raven-Os Framework Core
 * Shared state and provider for cross-platform apps.
 */

// --- Error Types ---

export interface RavenErrorInfo {
  id: string;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  type: 'runtime' | 'promise' | 'render';
  timestamp: number;
}

// --- State Management ---

interface RavenState {
  theme: 'dark' | 'light';
  isReady: boolean;
  isInitialized: boolean;
  error: string | null;
  user: any | null;
  demoCounter: number; // For reactivity demo
  performanceScore: number;
  isOptimizationActive: boolean;
  runtimeErrors: RavenErrorInfo[];
  // Dev Tools (only active in development)
  devSplitScreen: boolean;
  devDeviceType: 'android' | 'iphone';
  devMenuOpen: boolean;
  devDashboardOpen: boolean;
  devErrorModalOpen: boolean;
  themeMode: 'manual' | 'auto'; // V42: Theme Pro
  themeStrategy: 'system' | 'time'; // V42: Theme Pro
  setTheme: (theme: 'dark' | 'light') => void;
  setThemeMode: (mode: 'manual' | 'auto') => void;
  setThemeStrategy: (strategy: 'system' | 'time') => void;
  toggleTheme: () => void;
  setInitialized: (val: boolean) => void;
  setReady: (val: boolean) => void;
  setError: (err: string | null) => void;
  incrementCounter: () => void;
  toggleOptimization: () => void;
  setPerformanceScore: (score: number) => void;
  addRuntimeError: (err: RavenErrorInfo) => void;
  clearErrors: () => void;
  toggleDevSplitScreen: () => void;
  toggleDevDevice: () => void;
  toggleDevMenu: () => void;
  toggleDevDashboard: () => void;
  toggleDevErrorModal: (open?: boolean) => void;
}

export const useRavenStore = create<RavenState>((set) => ({
  theme: 'dark',
  isReady: false,
  isInitialized: false,
  error: null,
  user: null,
  demoCounter: 0,
  performanceScore: 94.2,
  isOptimizationActive: true,
  devSplitScreen: true,
  devDeviceType: 'android',
  devMenuOpen: false,
  runtimeErrors: [],
  devDashboardOpen: false,
  devErrorModalOpen: false,
  themeMode: 'manual',
  themeStrategy: 'system',
  setTheme: (theme: 'dark' | 'light') => {
    set({ theme, themeMode: 'manual' });
    RavenStorage.set('raven_theme', theme);
    RavenStorage.set('raven_theme_mode', 'manual');
  },
  setThemeMode: (themeMode: 'manual' | 'auto') => {
    set({ themeMode });
    RavenStorage.set('raven_theme_mode', themeMode);
  },
  setThemeStrategy: (themeStrategy: 'system' | 'time') => {
    set({ themeStrategy });
    RavenStorage.set('raven_theme_strategy', themeStrategy);
  },
  toggleTheme: () => set((state: RavenState) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    RavenStorage.set('raven_theme', next);
    RavenStorage.set('raven_theme_mode', 'manual');
    return { theme: next, themeMode: 'manual' } as Partial<RavenState>;
  }),
  setInitialized: (val: boolean) => set({ isInitialized: val }),
  setReady: (val: boolean) => set({ isReady: val }),
  setError: (err: string | null) => set({ error: err }),
  incrementCounter: () => set((state: RavenState) => ({ demoCounter: state.demoCounter + 1 })),
  toggleOptimization: () => set((state: RavenState) => ({ isOptimizationActive: !state.isOptimizationActive })),
  setPerformanceScore: (score: number) => set({ performanceScore: score }),
  addRuntimeError: (err: RavenErrorInfo) => set((state: RavenState) => ({ 
    runtimeErrors: [err, ...state.runtimeErrors].slice(0, 5),
    devErrorModalOpen: state.runtimeErrors.length === 0 // Auto-open on first error
  })),
  clearErrors: () => set({ runtimeErrors: [], devErrorModalOpen: false }),
  toggleDevSplitScreen: () => set((state: RavenState) => ({ devSplitScreen: !state.devSplitScreen, devMenuOpen: false })),
  toggleDevDevice: () => set((state: RavenState) => {
    const next = state.devDeviceType === 'android' ? 'iphone' : 'android';
    return { devDeviceType: next };
  }),
  toggleDevMenu: () => set((state: RavenState) => ({ devMenuOpen: !state.devMenuOpen })),
  toggleDevDashboard: () => set((state: RavenState) => ({ devDashboardOpen: !state.devDashboardOpen, devMenuOpen: false })),
  toggleDevErrorModal: (open?: boolean) => set((state: RavenState) => ({ 
    devErrorModalOpen: open !== undefined ? open : !state.devErrorModalOpen,
    devMenuOpen: false 
  })),
}));

// --- Context Provider ---

interface RavenProviderProps {
  children: ReactNode;
  /** Custom storage engine (e.g. AsyncStorage for React Native) */
  storage?: RavenStorageEngine;
  /** Component to show during async initialization */
  loader?: ReactNode;
  /** Custom async initialization logic */
  onInit?: () => Promise<void>;
}

export const RavenContext = createContext<RavenState | null>(null);

export const RavenProvider = ({ children, storage, loader, onInit }: RavenProviderProps) => {
  const store = useRavenStore();
  
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[Raven-Os] Starting Async Initialization...');
        
        // 1. Setup Storage
        if (storage) {
          RavenStorage.engine = storage;
        }

        // 2. Load Persisted Theme & Theme Pro Settings
        const savedTheme = await RavenStorage.get<'dark' | 'light'>('raven_theme');
        const savedMode = await RavenStorage.get<'manual' | 'auto'>('raven_theme_mode');
        const savedStrategy = await RavenStorage.get<'system' | 'time'>('raven_theme_strategy');

        if (savedTheme) store.setTheme(savedTheme);
        if (savedMode) store.setThemeMode(savedMode);
        if (savedStrategy) store.setThemeStrategy(savedStrategy);

        // 4. Post-initialization stability delay
        await new Promise(resolve => setTimeout(resolve, 800));

        store.setReady(true);
        store.setInitialized(true);
        console.log('[Raven-Os] Boot Sequence Complete.');
      } catch (err: any) {
        console.error('[Raven-Os] Core Init Deadlock Detected:', err);
        store.setError(err.message || 'Unknown error during initialization');
        // Critical Fix: Even if init fails, we MUST set ready = true
        // so the Diagnostic Overlay can actually render and show the error.
        store.setReady(true); 
      }
    };

    // 4. Global Error Interceptors (Nexus V3 Diagnostic Engine)
    if (typeof window !== 'undefined') {
      const handleError = (msg: string | Event, url?: string, line?: number, col?: number, error?: Error) => {
        store.addRuntimeError({
          id: Math.random().toString(36).substr(2, 9),
          message: typeof msg === 'string' ? msg : 'Runtime Crash',
          stack: error?.stack,
          file: url,
          line: line,
          type: 'runtime',
          timestamp: Date.now()
        });
        return false; // Let native logs happen too
      };

      const handleRejection = (event: PromiseRejectionEvent) => {
        store.addRuntimeError({
          id: Math.random().toString(36).substr(2, 9),
          message: `Unhandled Rejection: ${event.reason?.message || event.reason}`,
          stack: event.reason?.stack,
          type: 'promise',
          timestamp: Date.now()
        });
      };

      window.addEventListener('error', (e) => handleError(e.message, e.filename, e.lineno, e.colno, e.error));
      window.addEventListener('unhandledrejection', handleRejection);
    }

    init();

    // 4. ThemeGuardian (V42): Periodic theme check
    const guardianInterval = setInterval(() => {
      if (store.themeMode === 'auto') {
        if (store.themeStrategy === 'time') {
          const hour = new Date().getHours();
          const nextTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
          if (store.theme !== nextTheme) {
            store.setTheme(nextTheme);
          }
        } else if (store.themeStrategy === 'system' && typeof window !== 'undefined') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const nextTheme = isDark ? 'dark' : 'light';
          if (store.theme !== nextTheme) {
            store.setTheme(nextTheme);
          }
        }
      }
    }, 1000 * 60 * 5); // 5 minute guard

    return () => clearInterval(guardianInterval);
  }, [store.themeMode, store.themeStrategy, store.theme]);

  // 5. Restoration Guard (V23): If we have errors, we bypass the loader
  // so the Diagnostic Overlay can actually show what's wrong.
  const showLoader = !store.isReady && store.runtimeErrors.length === 0;

  if (showLoader && loader) {
    return <>{loader}</>;
  }
  
  return (
    <RavenContext.Provider value={store}>
      {children}
    </RavenContext.Provider>
  );
};

export const useRaven = () => {
  const context = useContext(RavenContext);
  if (!context) {
    return useRavenStore();
  }
  return context;
};

export const ravenFetch = async (url: string, options: any = {}) => {
  console.log(`[Raven-Os] Fetching ${url}...`);
  return fetch(url, options);
};

// --- Platform System ---
export { RavenPlatform } from './platform';
export type { RavenPlatformOS } from './platform';
export { ravenConfig } from './raven.config';
export type { RavenConfig, RavenLayerConfig } from './raven.config';
export { RavenStorage } from './storage';
export type { RavenStorageEngine } from './storage';

// --- Theme System ---
export { RavenThemes } from './theme';
export type { RavenThemeColors, RavenThemeMode } from './theme';

// --- Nexus System (V32 Unified Sync) ---
export { RavenNexusManager, useNexus, useNexusCollection, useNexusFunction } from './nexus';
export { RavenCrypt } from './nexus/crypto';
export { NexusDB } from './nexus/db';

// --- Auth Symmetry (V34 Unified Identity) ---
export { useRavenAuth, RavenAuthProvider } from './auth';

/**
 * useRavenTheme — The main hook for theme-aware components.
 * Returns the active color palette + toggle function.
 */
export const useRavenTheme = () => {
  const store = useRavenStore();
  const colors = RavenThemes[store.theme];
  return {
    colors: colors as RavenThemeColors,
    theme: store.theme,
    isDark: store.theme === 'dark',
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme,
  };
};

