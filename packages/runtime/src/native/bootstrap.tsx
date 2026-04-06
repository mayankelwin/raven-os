import React from 'react';
import { registerRootComponent } from 'expo';

/**
 * Raven-Os Mobile Runtime (V1)
 * The execution engine for the framework's native/mobile platform.
 * Responsible for mounting the application and initializing the sync bridge.
 */
export const RavenRuntime = {
  /**
   * Bootstrap the application with the Raven Framework context.
   */
  bootstrap: (App: React.ComponentType) => {
    console.log('%c⬛⬛⬛ Raven-Os Mobile Runtime Initialized ⬛⬛⬛', 'color: #6366f1; font-weight: bold;');

    // 1. Initialize Sync Hub connection (The client runtime handles the WS)
    // In V10 the sync bridge is established via the same Sync Hub logic as Web.
    
    // 2. Register for Expo/React Native
    registerRootComponent(App);
  }
};
