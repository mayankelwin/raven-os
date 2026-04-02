/**
 * Raven-Os Theme System
 * Intelligent Dark/Light mode with semantic color tokens.
 * 
 * The system works by providing two complete color palettes.
 * Dark mode → deep backgrounds, luminous text
 * Light mode → clean whites, high-contrast dark text
 * 
 * Both modes maintain the same visual hierarchy and contrast ratios.
 */

export interface RavenThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHighlight: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  glowPrimary: string;
}

const darkTheme: RavenThemeColors = {
  background: '#06060a',
  backgroundSecondary: '#0d0d14',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHighlight: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  primary: '#8b5cf6',
  primaryLight: '#c4b5fd',
  secondary: '#10b981',
  accent: '#f59e0b',
  success: '#22c55e',
  error: '#ef4444',
  glowPrimary: 'rgba(139,92,246,0.15)',
};

const lightTheme: RavenThemeColors = {
  background: '#f8fafc',
  backgroundSecondary: '#f1f5f9',
  surface: 'rgba(0,0,0,0.03)',
  surfaceHighlight: 'rgba(0,0,0,0.06)',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.16)',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  secondary: '#059669',
  accent: '#d97706',
  success: '#16a34a',
  error: '#dc2626',
  glowPrimary: 'rgba(124,58,237,0.08)',
};

export const RavenThemes = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export type RavenThemeMode = 'dark' | 'light';
