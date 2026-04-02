/**
 * raven.config.ts - Raven-Os Layer Configuration
 * 
 * This file controls the versioning and override policy of the
 * Raven-Os platform layers: shared, web, and native.
 * 
 * Think of it as the single source of truth for your framework's state.
 * When a bug is fixed only on mobile (native), you bump the native version.
 * Web stays at its version, untouched.
 */

export interface RavenLayerConfig {
  /** Semver string for this layer */
  version: string;
  /** Whether this layer is enabled in this project */
  enabled: boolean;
}

export interface RavenConfig {
  /** Framework version */
  version: string;

  /**
   * Layer versioning. Each platform layer can evolve independently.
   * 
   * shared → base components used by all platforms
   * web    → .web.tsx overrides (loaded by Vite only)
   * native → .native.tsx overrides (loaded by Metro/Expo only)
   */
  layers: {
    shared: RavenLayerConfig;
    web: RavenLayerConfig;
    native: RavenLayerConfig;
  };

  /**
   * Override policy when a platform-specific file exists.
   * 
   * 'replace' → Platform file fully replaces the shared file (Flutter-style)
   * 'extend'  → Platform file wraps the shared file (future feature)
   * 
   * Default: 'replace'
   */
  overridePolicy: 'replace' | 'extend';
}

/**
 * Default Raven-Os configuration.
 * Copy and customize this in your app's root.
 */
export const ravenConfig: RavenConfig = {
  version: '1.0.0',

  layers: {
    shared: {
      version: '1.0.0',
      enabled: true,
    },
    web: {
      version: '1.0.0',
      enabled: true,
    },
    native: {
      version: '1.0.0',
      enabled: true,
    },
  },

  overridePolicy: 'replace',
};

export default ravenConfig;
