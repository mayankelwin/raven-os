import React from 'react';
import { createRoot } from 'react-dom/client';

export interface BootstrapOptions {
  rootId?: string;
  hydrate?: boolean;
}

/**
 * Raven-Os Web Runtime (V1)
 * The execution engine for the framework's web platform.
 * Responsible for mounting the application and initializing the sync bridge.
 */
export const RavenRuntime = {
  /**
   * Bootstrap the application with the Raven Framework context.
   */
  bootstrap: (App: React.ComponentType, options: BootstrapOptions = {}) => {
    const rootId = options.rootId || 'root';
    const container = document.getElementById(rootId);

    if (!container) {
      console.error(`[RAVEN RUNTIME] Root container #${rootId} not found.`);
      return;
    }

    console.log('%c⬛⬛⬛ Raven-Os Runtime Initialized ⬛⬛⬛', 'color: #6366f1; font-weight: bold;');

    // 1. Initialize Sync Hub connection (The client runtime handles the WS)
    // In V1.2 the sync bridge is already established by the dev-shell script.
    // The Runtime will eventually take full ownership of the WS connection in V2.

    // 2. Mount the Application
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    return root;
  }
};
