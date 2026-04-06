import { RavenRuntime } from '@raven-os/runtime';
import App from './App';

// The framework now owns the execution layer for Mobile.
// RavenRuntime.bootstrap() handles the root registration and sync initialization.
RavenRuntime.bootstrap(App);
