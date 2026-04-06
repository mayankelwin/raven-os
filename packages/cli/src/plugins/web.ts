import path from 'path';
import { RavenPlugin, BuildContext, DevContext } from '../core/plugin.js';
import { RavenConfig } from '../core/config.js';
import { RavenHashing } from '../core/hashing.js';
import { RavenBundler } from '../core/bundler.js';

export class WebPlugin implements RavenPlugin {
  name = 'web';
  dependencies = ['core', 'ui'];

  async onBuild(context: BuildContext) {
    const bundler = new RavenBundler({
      entry: path.join(context.config.root, 'apps/web/src/main.tsx'),
      outDir: path.join(context.config.root, 'apps/web/dist'),
      platform: 'web',
      dev: false,
    });

    await bundler.bundle();
  }

  private devServer?: any;
  private bundler?: RavenBundler;
  private moduleGraph?: any;

  async onDev(context: DevContext) {
    const { RavenDevServer } = await import('../core/server.js');
    const { ModuleGraph } = await import('../core/graph.js');
    
    // 1. Initial/Incremental Bundling with persistent context
    if (!this.bundler) {
      this.bundler = new RavenBundler({
        entry: path.join(context.config.root, 'apps/web/src/main.tsx'),
        outDir: path.join(context.config.root, 'apps/web/dist'),
        platform: 'web',
        dev: true,
      });
      this.moduleGraph = new ModuleGraph(context.config.root);
    }
    
    const result = await this.bundler.bundle();

    // 2. Update Module Graph from esbuild metafile
    if (result && result.metafile) {
      this.moduleGraph.update(result.metafile);
    }

    // 3. Start Dev Server (Singleton)
    if (!this.devServer) {
      this.devServer = new RavenDevServer({
        port: 3000,
        root: context.config.root,
        distDir: path.join(context.config.root, 'apps/web/dist'),
        network: (context as any).options?.network
      });
      await this.devServer.start();
    } else {
      // 4. Smart Update Notification
      const changedFile = (context as any).changedFile;
      if (changedFile) {
        const affected = this.moduleGraph.getAffectedFiles(changedFile);
        this.devServer.sendUpdate({ type: 'update', file: changedFile, affected });
      } else {
        this.devServer.sendUpdate({ type: 'reload' });
      }
    }

    context.server = this.devServer;
  }

  async getSourceHash(config: RavenConfig) {
    const webAppDir = path.join(config.appsDir, 'web');
    return RavenHashing.hashDirectoryStats(webAppDir);
  }
}
