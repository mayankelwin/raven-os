import React from 'react';
import { RavenProvider } from '@raven-os/core';
import { RavenWelcome, RavenDevLayout, RavenDevOverlay } from '@raven-os/ui';

function App() {
  return (
    <RavenProvider>
      {/* RavenDevLayout handles split-screen mode (web only).
          On mobile (native.tsx) it's a transparent passthrough. */}
      <RavenDevLayout>
        <RavenWelcome />
      </RavenDevLayout>

      {/* RavenDevOverlay renders the floating DevTools FAB (web, dev mode only).
          Returns null on mobile and in production builds. */}
      <RavenDevOverlay />
    </RavenProvider>
  );
}

export default App;
