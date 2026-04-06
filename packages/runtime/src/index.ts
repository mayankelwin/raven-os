/**
 * @raven-os/runtime — Component Barrel
 * 
 * The platform resolution works automatically at the bundler level:
 * 
 *   Web  (Raven)   → resolves .web.tsx   before .tsx
 *   Mobile (Expo)  → resolves .native.tsx before .tsx
 * 
 * Export both so the bundler can pick the correct one.
 */

export * from './web/bootstrap';
// Note: In a real environment, the bundler would resolve .native.ts 
// or I can export them conditionally. For V10, we'll let the user 
// import from @raven-os/runtime and esbuild will do the MAGIC.
