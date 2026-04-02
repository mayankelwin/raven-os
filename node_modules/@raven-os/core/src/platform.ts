import { Platform } from 'react-native';

/**
 * Raven-Os Platform Utility
 * 
 * Provides clean, readable platform detection.
 * Use sparingly — prefer the file-based override system
 * (.web.tsx / .native.tsx) over runtime checks for anything structural.
 * 
 * Runtime checks are fine for minor conditional logic:
 * e.g., padding adjustments, color tweaks.
 */

export const RavenPlatform = {
  /** True when running in a web browser (Vite build) */
  isWeb: Platform.OS === 'web',

  /** True when running on iOS or Android (Expo build) */
  isNative: Platform.OS !== 'web',

  /** True when running on iOS */
  isIOS: Platform.OS === 'ios',

  /** True when running on Android */
  isAndroid: Platform.OS === 'android',

  /** Current platform string */
  current: Platform.OS as 'web' | 'ios' | 'android',

  /**
   * Run platform-specific code inline.
   * Prefer .web.tsx / .native.tsx files for structural differences.
   * Use this for minor value-level switches.
   * 
   * @example
   * const spacing = RavenPlatform.select({ web: 24, native: 16 })
   */
  select: <T>(options: { web?: T; native?: T; ios?: T; android?: T; default?: T }): T | undefined => {
    if (Platform.OS === 'web' && options.web !== undefined) return options.web;
    if (Platform.OS === 'ios' && options.ios !== undefined) return options.ios;
    if (Platform.OS === 'android' && options.android !== undefined) return options.android;
    if (Platform.OS !== 'web' && options.native !== undefined) return options.native;
    return options.default;
  },
} as const;

export type RavenPlatformOS = typeof RavenPlatform.current;
