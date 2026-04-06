import { RavenLogger } from '../core/logger.js';
import { RavenConfig } from '../core/config.js';
import { RavenRunner } from '../core/runner.js';

export const RavenBuildCommand = async (config: RavenConfig, platform: string) => {
  RavenLogger.header();
  RavenLogger.info(`Building project for platform: ${RavenLogger.platform(platform)}...`);

  switch (platform) {
    case 'web':
      await RavenRunner.run('npm', ['run', 'build', '--prefix', 'apps/web'], { cwd: config.root });
      RavenLogger.success('Web build completed successfully.');
      break;

    case 'android':
      RavenLogger.step('Starting Android native build (Gradle)...');
      await RavenRunner.run('npx', ['expo', 'run:android', '--no-dev'], { cwd: 'apps/mobile' });
      RavenLogger.success('Android build completed successfully.');
      break;

    case 'ios':
      RavenLogger.step('Starting iOS native build (Xcode)...');
      await RavenRunner.run('npx', ['expo', 'run:ios', '--no-dev'], { cwd: 'apps/mobile' });
      RavenLogger.success('iOS build completed successfully.');
      break;

    default:
      RavenLogger.error(`Platform ${platform} not supported for build.`);
      RavenLogger.info('Supported platforms: web, android, ios');
  }
};
