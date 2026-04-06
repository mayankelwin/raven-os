import fs from 'fs-extra';
import path from 'path';
import { RavenLogger } from '../core/logger.js';
import { RavenConfig } from '../core/config.js';

/**
 * Raven Clean Command (V26 - GitHub Sanitizer)
 * Performs a deep purge of build artifacts and caches.
 */
export const RavenCleanCommand = async (config: RavenConfig) => {
  RavenLogger.header();
  RavenLogger.info('Starting deep sanitization of the Raven-Os workspace...');

  const itemsToClean = [
    // Build Artifacts
    { name: 'Web Dist', path: path.join(config.appsDir, 'web', 'dist') },
    { name: 'Mobile Build (.expo)', path: path.join(config.appsDir, 'mobile', '.expo') },
    { name: 'CLI Dist', path: path.join(config.packagesDir, 'cli', 'dist') },
    { name: 'Core Dist', path: path.join(config.packagesDir, 'core', 'dist') },
    { name: 'UI Dist', path: path.join(config.packagesDir, 'ui', 'dist') },
    
    // Native Artifacts
    { name: 'Android Native build', path: path.join(config.appsDir, 'mobile', 'android') },
    { name: 'iOS Native build', path: path.join(config.appsDir, 'mobile', 'ios') },
    
    // Caches
    { name: 'Turbo Cache', path: path.join(config.root, '.turbo') },
    { name: 'Raven Dev Cache', path: path.join(config.root, '.raven') },
    { name: 'Metro Cache', path: path.join(process.env.TMPDIR || process.env.TEMP || '/tmp', 'metro-cache') },
    
    // Dependencies (Only if deep clean is requested, but here we fulfill the USER's "prepare for git" request)
    { name: 'Root node_modules', path: path.join(config.root, 'node_modules') },
    { name: 'Package-lock', path: path.join(config.root, 'package-lock.json') },
  ];

  for (const item of itemsToClean) {
    try {
      if (await fs.pathExists(item.path)) {
        RavenLogger.step(`Purging ${item.name}...`);
        await fs.remove(item.path);
      }
    } catch (e: any) {
      RavenLogger.warning(`Failed to purge ${item.name}: ${e.message}`);
    }
  }

  RavenLogger.success('Workspace is now SANITIZED and ready for Git! 🚀');
  RavenLogger.info('Run "npm install" to restore dependencies when ready.');
};
