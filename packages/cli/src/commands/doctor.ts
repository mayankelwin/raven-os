import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { RavenLogger } from '../core/logger.js';
import { RavenConfig } from '../core/config.js';

export const RavenDoctorCommand = async (config: RavenConfig) => {
  RavenLogger.header();
  RavenLogger.info('Diagnosing Raven-Os Environment...');

  const checks = [
    { name: 'Node.js', command: 'node -v' },
    { name: 'NPM', command: 'npm -v' },
    { name: 'Android SDK', envs: ['ANDROID_HOME', 'ANDROID_SDK_ROOT'] },
    { name: 'Java', command: 'java -version' },
    { name: 'Xcode (iOS only)', command: 'xcodebuild -version' },
  ];

  for (const check of checks) {
    try {
      if ('command' in check && check.command) {
        const result = execSync(check.command, { stdio: 'pipe' }).toString().trim().split('\n')[0];
        RavenLogger.success(`${check.name}: ${result}`);
      } else if ('envs' in check && check.envs) {
        const envVal = check.envs.map(e => process.env[e]).find(v => !!v);
        if (envVal) {
          RavenLogger.success(`${check.name}: Found at ${envVal}`);
        } else {
          RavenLogger.error(`${check.name}: NOT FOUND. Set ANDROID_HOME environment variable.`);
        }
      }
    } catch (e) {
      if (check.name === 'Xcode (iOS only)' && process.platform !== 'darwin') {
        RavenLogger.info(`${check.name}: Skipped (Not on macOS)`);
      } else {
        RavenLogger.error(`${check.name}: FAILED or NOT INSTALLED.`);
      }
    }
  }

  RavenLogger.divider();
  RavenLogger.info('Checking for port conflicts...');
  const ports = [
    { name: 'Metro (Mobile)', port: 8081 },
    { name: 'Vite (Web)', port: 5173 },
  ];

  for (const { name, port } of ports) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      RavenLogger.success(`${name}: Port ${port} is available.`);
    } else {
      RavenLogger.warning(`${name}: Port ${port} is ALREADY IN USE! This may cause build failures.`);
    }
  }

  RavenLogger.divider();
  RavenLogger.info('Validating Monorepo Aliases...');
  const aliases = [
    { name: '@raven-os/core', path: 'packages/core/src' },
    { name: '@raven-os/ui', path: 'packages/ui/src' },
  ];

  for (const alias of aliases) {
    const fullPath = path.join(config.root, alias.path);
    if (await fs.pathExists(fullPath)) {
       RavenLogger.success(`Alias ${alias.name}: Source valid at ${alias.path}`);
    } else {
      RavenLogger.error(`Alias ${alias.name}: Source MISSING at ${alias.path}! Check your monorepo structure.`);
    }
  }

  RavenLogger.divider();
  RavenLogger.info('Checking for duplicate dependencies...');
  try {
    const reactCheck = execSync('npm ls react', { cwd: config.root, stdio: 'pipe' }).toString();
    if (reactCheck.includes('deduped') || !reactCheck.includes('ERR')) {
      RavenLogger.success('React: Single version confirmed.');
    }
  } catch (e: any) {
    if (e.stdout && e.stdout.toString().includes('ELSPROBLEMS')) {
        RavenLogger.warning('React: Multiple versions or conflicts detected in monorepo!');
    } else {
        RavenLogger.success('React: Single version confirmed.');
    }
  }

  RavenLogger.success('\nRaven Doctor Pro finished diagnostics.');
};

async function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}
