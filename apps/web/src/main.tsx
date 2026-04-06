import { RavenRuntime } from '@raven-os/runtime';
import './index.css';
import './global.css';
import App from './App.tsx';

// The framework now owns the execution layer.
// RavenRuntime.bootstrap() handles the root creation, sync hub, and mounting.
RavenRuntime.bootstrap(App, {
  rootId: 'root'
});
