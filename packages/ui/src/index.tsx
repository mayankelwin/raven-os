/**
 * @raven-os/ui — Component Barrel
 * 
 * The override system works automatically at the bundler level:
 * 
 *   Web  (Vite)  → resolves .web.tsx   before .tsx
 *   Mobile (Metro) → resolves .native.tsx before .tsx
 * 
 * Just import normally: import { RavenCard } from '@raven-os/ui'
 * The correct platform version is loaded transparently.
 */

// Design tokens and base primitives
export * from './base';

// Welcome screen
export * from './RavenWelcome';
export * from './RavenLoader';

// Platform-aware components
// These have .native.tsx and/or .web.tsx overrides alongside them.
// The bundler resolves the correct one per platform automatically.
export { default as RavenCard } from './components/RavenCard';

// Smart State Synchronization (V8 Engine)
export { RavenSync, useRavenSync } from './core/sync';

// Raven Nexus — Built-in Collaborative & Gamification Engine (V12)
export { useRavenNexus, CollaborativeInput } from './core/nexus';
export { useRavenGamification, NexusLeaderboard } from './core/gamification';

// Developer Tools (web-only via platform override — native stubs return null)
export { RavenDevOverlay } from './dev/RavenDevOverlay';
export { RavenDevLayout } from './dev/RavenDevLayout';
