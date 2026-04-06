import { RavenLogger } from '../core/logger.js';

export interface BridgeConfig {
  id: string;
  enabled: boolean;
  options: Record<string, any>;
}

/**
 * Nexus Symmetry Bridge (V41)
 * 
 * Abstract base class for external database connectors.
 * Allows NexusDB to sync deltas to Supabase, Firebase, MariaDB, etc.
 */
export abstract class NexusBridge {
  constructor(protected config: BridgeConfig) {}

  abstract getName(): string;
  
  /** Initialize the external connection */
  abstract connect(): Promise<void>;

  /** Handle a Nexus Delta (sync to external) */
  abstract onDelta(room: string, key: string, value: any): Promise<void>;

  /** Handle a Collection Add */
  abstract onCollectionAdd(room: string, collection: string, item: any): Promise<void>;

  /** Pull initial state from external (if supported) */
  async pull(room: string): Promise<any | null> {
    return null;
  }

  protected log(msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const prefix = `[BRIDGE:${this.getName()}]`;
    if (type === 'success') RavenLogger.success(`${prefix} ${msg}`);
    else if (type === 'error') RavenLogger.error(`${prefix} ${msg}`);
    else if (type === 'warning') RavenLogger.warning(`${prefix} ${msg}`);
    else RavenLogger.info(`${prefix} ${msg}`);
  }
}
