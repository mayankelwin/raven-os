import { RavenConfig } from './config.js';

export interface BuildContext {
  config: RavenConfig;
  platform: string;
  cache: boolean;
  incremental: boolean;
}

export interface DevContext {
  config: RavenConfig;
  platform: string;
  server?: any; // To avoid circular dependency with RavenDevServer, using any for now
  changedFile?: string; // The file that triggered this rebuild
}

export interface RavenPlugin {
  name: string;
  dependencies: string[];
  
  onBuild(context: BuildContext): Promise<void>;
  onDev(context: DevContext): Promise<void>;
  
  // Hash calculation for the plugin's source (usually its app directory)
  getSourceHash(config: RavenConfig): Promise<string>;
}
