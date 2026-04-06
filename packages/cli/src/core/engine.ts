import { RavenLogger } from './logger.js';
import { RavenCache } from './cache.js';
import { TaskGraph } from './graph.js';
import { RavenConfig } from './config.js';
import { RavenPlugin, BuildContext, DevContext } from './plugin.js';

// Define this in engine.ts first
export interface PipelineOptions {
  platform: string;
  mode: 'dev' | 'build';
  cache: boolean;
  incremental: boolean;
  changedFile?: string; // NEW: Specific file that triggered the run
  target?: string;
}

export class RavenEngine {
  private cache: RavenCache;
  private graph: TaskGraph;
  private plugins: Map<string, RavenPlugin> = new Map();

  constructor(private config: RavenConfig) {
    this.cache = new RavenCache(config.root);
    this.graph = new TaskGraph();
  }

  use(plugin: RavenPlugin) {
    this.plugins.set(plugin.name, plugin);
    this.graph.addTask(plugin.name, plugin.dependencies.filter(d => this.plugins.has(d)));
    return this; // fluent API
  }

  async run(options: PipelineOptions) {
    RavenLogger.header();
    RavenLogger.info(`Pipeline Starting [Platform: ${options.platform.toUpperCase()}, Mode: ${options.mode.toUpperCase()}]`);

    if (options.cache) await this.cache.load();

    // 1. Resolve execution order from task graph
    const executionOrder = this.graph.resolve();
    const startTime = Date.now();

    const devTasks: Promise<void>[] = [];

    for (const taskName of executionOrder) {
      const plugin = this.plugins.get(taskName);
      if (!plugin) continue;

      RavenLogger.divider();
      const taskStart = Date.now();
      const label = `${RavenLogger.platform(taskName)}`;

      // 2. Hash check for cache
      const sourceHash = await plugin.getSourceHash(this.config);
      const executionContext = `${options.platform}-${options.mode}`;
      const cacheHit = options.cache && await this.cache.hasHit(`${taskName}:${executionContext}`, sourceHash);

      if (cacheHit && options.mode === 'build') {
        RavenLogger.success(`${label} CACHE HIT [${executionContext}] — skipping`);
        continue;
      }

      RavenLogger.step(`${label} Running ${options.mode}...`);

      const runTask = async () => {
        try {
          if (options.mode === 'build') {
            const ctx: BuildContext = {
              config: this.config,
              platform: options.platform,
              cache: options.cache,
              incremental: options.incremental,
            };
            await plugin.onBuild(ctx);
          } else {
            const ctx: DevContext = {
              config: this.config,
              platform: options.platform,
              changedFile: options.changedFile,
            };
            await plugin.onDev(ctx);
          }

          const elapsed = ((Date.now() - taskStart) / 1000).toFixed(2);
          RavenLogger.success(`${label} Completed in ${elapsed}s`);

          if (options.cache) {
            this.cache.set(`${taskName}:${executionContext}`, sourceHash);
          }
        } catch (err: any) {
          RavenLogger.error(`${label} FAILED`, err.message);
          throw err;
        }
      };

      // In dev mode, we run long-running leaf tasks in parallel
      if (options.mode === 'dev' && (taskName === 'web' || taskName === 'mobile')) {
        devTasks.push(runTask());
      } else {
        await runTask();
      }
    }

    // Wait for all concurrent dev tasks to start. 
    // In a multi-platform environment, we want to see the BOOT SUMMARY 
    // immediately after the initial build, while the servers are still active.
    if (devTasks.length > 0) {
      // NOTE: We don't await Promise.all(devTasks) if we want the dashboard to show.
      // Instead, we just let them carry on in their separate spawned processes.
      // But we wait a tiny bit to check for immediate start-up errors.
      await Promise.race([
        Promise.all(devTasks),
        new Promise(resolve => setTimeout(resolve, 100))
      ]);
    }

    if (options.cache) await this.cache.save();

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    RavenLogger.divider();
    RavenLogger.success(`Pipeline finished in ${totalElapsed}s`);
  }
}
