import { RavenLogger } from '../core/logger.js';
import { RavenConfig } from '../core/config.js';
import { RavenRunner } from '../core/runner.js';
import path from 'path';

/**
 * Raven-Os Dev Command (Legacy Proxy)
 * Delegates to the new streaming runner for professional log multiplexing.
 */
export const RavenDevCommand = async (config: RavenConfig, options: { web?: boolean, mobile?: boolean }) => {
  RavenLogger.header();
  
  if (!options.web && !options.mobile) {
    RavenLogger.warning('No platform specified. Use --web or --mobile.');
    return;
  }

  const tasks: Promise<void>[] = [];

  if (options.web) {
    RavenLogger.info(`Starting DEVELOPMENT for ${RavenLogger.platform('web')}...`);
    tasks.push(
      RavenRunner.runStreaming('npm', ['run', 'dev', '--prefix', 'apps/web'], 'web', { cwd: config.root })
    );
  }

  if (options.mobile) {
    RavenLogger.info(`Starting DEVELOPMENT for ${RavenLogger.platform('mobile')}...`);
    tasks.push(
      RavenRunner.runStreaming('npx', ['expo', 'start'], 'mobile', { cwd: config.root })
    );
  }

  try {
    await Promise.all(tasks);
  } catch (e: any) {
    RavenLogger.error('Development environment failed.', e.message);
  }
};
