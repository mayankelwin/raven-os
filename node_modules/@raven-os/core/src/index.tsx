import { create } from 'zustand';
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { RavenThemes } from './theme';

/**
 * Raven-Os Framework Core
 * Shared state and provider for cross-platform apps.
 */

// --- State Management ---

interface RavenState {
  theme: 'dark' | 'light';
  isInitialized: boolean;
  user: any | null;
  demoCounter: number; // For reactivity demo
  performanceScore: number;
  isOptimizationActive: boolean;
  // Dev Tools (only active in development)
  devSplitScreen: boolean;
  devDeviceType: 'android' | 'iphone';
  devMenuOpen: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setInitialized: (val: boolean) => void;
  incrementCounter: () => void;
  toggleOptimization: () => void;
  setPerformanceScore: (score: number) => void;
  toggleDevSplitScreen: () => void;
  toggleDevDevice: () => void;
  toggleDevMenu: () => void;
}

export const useRavenStore = create<RavenState>((set) => ({
  theme: 'dark',
  isInitialized: false,
  user: null,
  demoCounter: 0,
  performanceScore: 94.2,
  isOptimizationActive: true,
  devSplitScreen: false,
  devDeviceType: 'android',
  devMenuOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setInitialized: (val) => set({ isInitialized: val }),
  incrementCounter: () => set((state) => ({ demoCounter: state.demoCounter + 1 })),
  toggleOptimization: () => set((state) => ({ isOptimizationActive: !state.isOptimizationActive })),
  setPerformanceScore: (score) => set({ performanceScore: score }),
  toggleDevSplitScreen: () => set((state) => ({ devSplitScreen: !state.devSplitScreen, devMenuOpen: false })),
  toggleDevDevice: () => set((state) => ({ devDeviceType: state.devDeviceType === 'android' ? 'iphone' : 'android' })),
  toggleDevMenu: () => set((state) => ({ devMenuOpen: !state.devMenuOpen })),
}));

// --- Context Provider ---

interface RavenProviderProps {
  children: ReactNode;
}

const RavenContext = createContext<RavenState | null>(null);

export const RavenProvider = ({ children }: RavenProviderProps) => {
  const store = useRavenStore();
  
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

// --- Theme System ---
export { RavenThemes } from './theme';
export type { RavenThemeColors, RavenThemeMode } from './theme';

/**
 * useRavenTheme — The main hook for theme-aware components.
 * Returns the active color palette + toggle function.
 * 
 * @example
 * const { colors, isDark, toggleTheme } = useRavenTheme();
 * <View style={{ backgroundColor: colors.background }} />
 */
export const useRavenTheme = () => {
  const store = useRavenStore();
  const colors = RavenThemes[store.theme];
  return {
    colors,
    theme: store.theme,
    isDark: store.theme === 'dark',
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme,
  };
};
