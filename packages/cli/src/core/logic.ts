import fs from 'fs-extra';
import path from 'path';
import { RavenLogger } from './logger.js';
import chokidar from 'chokidar';

/**
 * Raven Nexus Logic Engine (V35)
 * Dynamic Function Runner for Server-side Business Logic.
 */

export interface NexusContext {
  state: Record<string, any>;
  room: string;
  clientId: string;
  broadcast: (message: any) => void;
  update: (key: string, value: any) => void;
}

export type NexusFunction = (data: any, ctx: NexusContext) => Promise<any> | any;

export class RavenLogicRunner {
  private functionsDir: string;
  private registry: Map<string, { trigger: string; handler: NexusFunction }> = new Map();
  private watcher: any;

  constructor(private root: string) {
    this.functionsDir = path.join(root, 'nexus', 'functions');
    this.ensureDir();
    this.startWatcher();
  }

  private ensureDir() {
    if (!fs.existsSync(this.functionsDir)) {
      fs.ensureDirSync(this.functionsDir);
      // Create a sample function
      fs.writeFileSync(
        path.join(this.functionsDir, 'hello.js'), 
        `// Nexus Logic (V35) - Sample Function\nexport const onCall_sum = (data) => data.a + data.b;`
      );
    }
  }

  private startWatcher() {
    this.watcher = chokidar.watch(this.functionsDir, { persistent: true });
    this.watcher.on('add', (p: string) => this.loadFunction(p));
    this.watcher.on('change', (p: string) => this.loadFunction(p));
    
    RavenLogger.info(`[NEXUS LOGIC] Watching for functions in: ${this.functionsDir}`);
  }

  private async loadFunction(filePath: string) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.ts')) return;

    try {
      // Use dynamic import with a timestamp to clear cache
      const module = await import(`file://${filePath}?t=${Date.now()}`);
      
      Object.keys(module).forEach(exportName => {
        const [trigger, name] = exportName.split('_');
        if (trigger && name) {
          this.registry.set(name, { trigger, handler: module[exportName] });
          RavenLogger.success(`[NEXUS LOGIC] Registered: ${trigger} -> ${name}`);
        }
      });
    } catch (e: any) {
      RavenLogger.error(`[NEXUS LOGIC] Failed to load ${path.basename(filePath)}`, e.message);
    }
  }

  public getRegistry() {
    return Array.from(this.registry.entries()).map(([name, info]) => ({
      name,
      trigger: info.trigger
    }));
  }

  public async trigger(name: string, triggerType: string, data: any, ctx: NexusContext): Promise<any> {
    const fn = this.registry.get(name);
    if (!fn || fn.trigger !== triggerType) return null;

    try {
      return await fn.handler(data, ctx);
    } catch (e: any) {
      RavenLogger.error(`[NEXUS LOGIC] Execution Error (${name})`, e.message);
      throw e;
    }
  }
}
