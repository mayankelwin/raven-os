import React from 'react';
import { RavenProvider } from '@raven-os/core';
import { 
  RavenWelcome, 
  RavenDevLayout, 
  RavenDevOverlay, 
  RavenLoader 
} from '@raven-os/ui';

/**
 * Raven-Os: The Flagship Experience (V21)
 * 
 * Integrated with the 'Nexus Diagnostic Engine'. 
 * - The Dev FAB turns red on errors.
 * - Clicking reveals a professional diagnostic modal.
 */
function App() {
  return (
    <RavenProvider loader={<RavenLoader />}>
      <RavenDevLayout>
        <RavenWelcome />
      </RavenDevLayout>

      {/* The Developer Cockpit: Now with Next.js style Error Overlay */}
      <RavenDevOverlay />
    </RavenProvider>
  );
}

export default App;
