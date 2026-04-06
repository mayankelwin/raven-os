import path from 'path';
import { RavenPlugin, BuildContext, DevContext } from '../core/plugin.js';
import { RavenConfig } from '../core/config.js';
import { RavenRunner } from '../core/runner.js';
import { RavenHashing } from '../core/hashing.js';
import { RavenLogger } from '../core/logger.js';

export type MobilePlatform = 'android' | 'ios' | 'expo';

export class MobilePlugin implements RavenPlugin {
  name = 'mobile';
  dependencies = ['core', 'ui'];

  constructor(private target: MobilePlatform = 'expo') {}

  async onBuild(context: BuildContext) {
    switch (this.target) {
      case 'android':
        RavenLogger.step('Starting Android native build (Gradle)...');
        RavenLogger.info('Using: npx expo run:android (native build, not Expo Go)');
        await RavenRunner.run('npx', ['expo', 'run:android', '--no-dev'], {
          cwd: path.join(context.config.appsDir, 'mobile'),
          shell: true,
        });
        break;

      case 'ios':
        RavenLogger.step('Starting iOS native build (Xcode)...');
        await RavenRunner.run('npx', ['expo', 'run:ios', '--no-dev'], {
          cwd: path.join(context.config.appsDir, 'mobile'),
          shell: true,
        });
        break;

      case 'expo':
      default:
        RavenLogger.step('Building Expo bundle...');
        await RavenRunner.run('npx', ['expo', 'export'], {
          cwd: path.join(context.config.appsDir, 'mobile'),
          shell: true,
        });
        break;
    }
  }

  async onDev(context: DevContext) {
    RavenLogger.info('Starting Metro bundler for mobile development...', 'mobile');
    
    // Use runStreaming for professional multiplexed logs
    await RavenRunner.runStreaming('npx', ['expo', 'start', '-c', '--port', '8081'], 'mobile', {
      cwd: path.join(context.config.appsDir, 'mobile'),
    });
  }

  async getSourceHash(config: RavenConfig): Promise<string> {
    const mobileAppDir = path.join(config.appsDir, 'mobile');
    return RavenHashing.hashDirectoryStats(mobileAppDir);
  }
}
