import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { RavenLogger } from './logger.js';

export interface RavenBundlerOptions {
  entry: string;
  outDir: string;
  platform: 'web' | 'mobile';
  dev: boolean;
  minify?: boolean;
  metafile?: boolean;
}

/**
 * Raven-Os Custom Bundler (V1)
 * Powered by esbuild with Intelligent Platform Translation.
 * Updated: Support for Context (HMR) and Metafile (Graph).
 */
export class RavenBundler {
  private options: RavenBundlerOptions;
  private ctx?: esbuild.BuildContext;

  constructor(options: RavenBundlerOptions) {
    this.options = {
      ...options,
      minify: options.minify ?? !options.dev,
      metafile: options.metafile ?? options.dev,
    };
  }

  /**
   * Main bundling orchestrator
   */
  async bundle() {
    RavenLogger.info(`[BUNDLER] Starting ${this.options.platform.toUpperCase()} bundle...`);
    const startTime = Date.now();
    const projectRoot = process.cwd();

    try {
      const config: esbuild.BuildOptions = {
        absWorkingDir: projectRoot,
        entryPoints: [this.options.entry],
        bundle: true,
        outfile: path.join(this.options.outDir, this.options.platform === 'web' ? 'index.js' : 'bundle.js'),
        platform: this.options.platform === 'web' ? 'browser' : 'node',
        format: 'esm',
        minify: this.options.minify,
        sourcemap: this.options.dev,
        metafile: this.options.metafile,
        loader: {
          '.js': 'jsx',
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.png': 'file',
          '.svg': 'text',
        },
        plugins: [this.createResolverPlugin(projectRoot)],
        jsx: 'automatic',
        define: {
          'process.env.NODE_ENV': JSON.stringify(this.options.dev ? 'development' : 'production'),
          'process.browser': 'true',
          'process.version': '""',
          'process.platform': '"browser"',
          'import.meta.env.DEV': JSON.stringify(this.options.dev),
          'import.meta.env.MODE': JSON.stringify(this.options.dev ? 'development' : 'production'),
          '__DEV__': JSON.stringify(this.options.dev),
          'global': 'window',
          'Buffer': 'undefined', // We'll add a real polyfill if needed later
        },
      };

      let result;

      // DEV MODE: Use context for incremental rebuilds
      if (this.options.dev) {
        if (!this.ctx) {
          this.ctx = await esbuild.context(config);
        }
        result = await this.ctx.rebuild();
      } else {
        result = await esbuild.build(config);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      RavenLogger.success(`[BUNDLER] Successful ${this.options.platform.toUpperCase()} bundle in ${duration}s`);
      
      return result;
    } catch (error: any) {
      RavenLogger.error(`[BUNDLER] FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dispose context if needed
   */
  async dispose() {
    if (this.ctx) {
      await this.ctx.dispose();
    }
  }

  private createResolverPlugin(projectRoot: string): esbuild.Plugin {
    const platform = this.options.platform;
    
    return {
      name: 'raven-resolver',
      setup(build) {
        // 1. Handle react-native mapping for WEB
        if (platform === 'web') {
          build.onResolve({ filter: /^react-native$/ }, args => {
            const searchPaths = [
              path.join(projectRoot, 'apps/web/node_modules/react-native-web/dist/index.js'),
              path.join(projectRoot, 'node_modules/react-native-web/dist/index.js'),
            ];

            for (const p of searchPaths) {
              if (fs.existsSync(p)) return { path: p };
            }

            try {
              return { path: require.resolve('react-native-web/dist/index.js', { paths: [projectRoot] }) };
            } catch (e) {
              return { errors: [{ text: `Could not find react-native-web entry point.` }] };
            }
          });
        }

        // 2. Handle Raven Runtime mapping
        build.onResolve({ filter: /^@raven-os\/runtime$/ }, args => {
          const runtimePath = path.join(projectRoot, 'packages/runtime/src/web/bootstrap.tsx');
          if (fs.existsSync(runtimePath)) return { path: runtimePath };
          return null;
        });

        // 3. Cross-Platform Extension Resolution (.web.tsx / .native.tsx)
        build.onResolve({ filter: /.*/ }, (args) => {
          // Skip if already resolved to a library or full path
          if (args.path.startsWith('.') || args.importer === '') {
            const resolveDir = args.resolveDir || path.dirname(args.importer);
            if (!resolveDir) return null;

            const fullPath = path.resolve(resolveDir, args.path);
            
            const platformExts = platform === 'web' 
              ? ['.web.tsx', '.web.ts', '.web.js', '.web.jsx'] 
              : ['.native.tsx', '.native.ts', '.native.js', '.native.jsx'];
              
            const standardExts = ['.tsx', '.ts', '.js', '.jsx'];
            const allExts = [...platformExts, ...standardExts];

            for (const ext of allExts) {
              const fileWithExt = fullPath.endsWith(ext) ? fullPath : `${fullPath}${ext}`;
              if (fs.existsSync(fileWithExt) && !fs.statSync(fileWithExt).isDirectory()) {
                return { path: fileWithExt };
              }
              
              const indexFile = path.join(fullPath, `index${ext}`);
              if (fs.existsSync(indexFile)) {
                return { path: indexFile };
              }
            }
          }
          return null; 
        });
      },
    };
  }
}
