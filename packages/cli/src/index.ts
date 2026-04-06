#!/usr/bin/env node
import { Command } from 'commander';
import { RavenLogger } from './core/logger.js';
import { RavenConfigLoader } from './core/config.js';
import { RavenDevCommand } from './commands/dev.js';
import { RavenBuildCommand } from './commands/build.js';
import { RavenDoctorCommand } from './commands/doctor.js';
import { RavenCleanCommand } from './commands/clean.js';
import { RavenNexusCommand } from './commands/nexus.js';

const program = new Command();
import { RavenEngine } from './core/engine.js';
import { WebPlugin } from './plugins/web.js';
import { MobilePlugin, MobilePlatform } from './plugins/mobile.js';
import { RavenRunner } from './core/runner.js';

program
  .name('raven')
  .description('Raven-Os Framework CLI - Intelligent Build Engine')
  .version('2.0.0');

// Initial configuration check
const init = async () => {
  try {
    const config = await RavenConfigLoader.detect();
    return config;
  } catch (e: any) {
    RavenLogger.error('Project Detection Failed', e.message);
    process.exit(1);
  }
};

program
  .command('dev')
  .description('Start the development server with intelligent caching')
  .option('-w, --web', 'Start web development server (Raven Server)')
  .option('-m, --mobile', 'Start mobile development server (Expo)')
  .option('-n, --network', 'Expose dev server to local network (QR Code)')
  .action(async (options) => {
    // 0. Auto-healing: Clear ports before starting
    await RavenRunner.cleanupPorts([3000, 8081]);

    const config = await init();
    const engine = new RavenEngine(config);

    // 1. Auto-detect platforms if none specified
    const runWeb = options.web || (!options.web && !options.mobile);
    const runMobile = options.mobile || (!options.web && !options.mobile);

    if (runWeb) engine.use(new WebPlugin());
    if (runMobile) engine.use(new MobilePlugin());

    RavenLogger.info(`Starting dev environment for: ${[runWeb && 'WEB', runMobile && 'MOBILE'].filter(Boolean).join(', ')}`);

    // 2. Initial dev run (starts servers in parallel via Engine)
    await engine.run({
      platform: 'all', // The engine will handle the specific plugin names
      mode: 'dev',
      cache: true,
      incremental: true
    });

    // 2. Potency Dashboard Summary (V22)
    const ip = 'localhost'; // In a real scenario, this would be the local network IP
    RavenLogger.box('RAVEN-OS POTENCY DASHBOARD (NEXUS V3)', [
      `🌐 WEB / NEXUS:   http://localhost:3000`,
      `📱 MOBILE / METRO: exp://${ip}:8081`,
      ``,
      `➜ [ENGINE] Intelligence: Active | Latency: 4ms`,
      `➜ [NEXUS] P2P Relay: Connected (Room: DEFAULT)`,
      ``,
      `Hotkeys: 'r' to reload, 'q' to quit, 'd' for dashboard`
    ]);

    // 3. Start Watcher for all active platforms (V24 with Rebuild Guard)
    const { RavenWatcher } = await import('./core/watcher.js');
    const watcher = new RavenWatcher(config, engine);
    
    let isRebuilding = false;
    watcher.start(async (changedPath) => {
      if (isRebuilding) return;
      isRebuilding = true;

      try {
        await engine.run({
          platform: 'all',
          mode: 'dev',
          cache: true,
          incremental: true,
          changedFile: changedPath
        });
      } finally {
        isRebuilding = false;
      }
    });
  });

program
  .command('build')
  .description('Build the project using the intelligent pipeline')
  .argument('<platform>', 'web, android, ios')
  .option('--no-cache', 'Disable build cache')
  .action(async (platform, options) => {
    const config = await init();
    const engine = new RavenEngine(config);

    if (platform === 'web') {
      engine.use(new WebPlugin());
    } else {
      engine.use(new MobilePlugin(platform as MobilePlatform));
    }

    await engine.run({
      platform,
      mode: 'build',
      cache: options.cache !== false,
      incremental: true
    });
  });

program
  .command('doctor')
  .description('Check the development environment (Pro Version)')
  .action(async () => {
    const config = await init();
    await RavenDoctorCommand(config);
  });

program
  .command('clean')
  .description('Perform a deep clean of the workspace and build cache')
  .action(async () => {
    const config = await init();
    await RavenCleanCommand(config);
    // Also clean the .cache if needed
    const engine = new RavenEngine(config); 
  });

// --- Nexus DB Commands (V33) ---
const nexus = program.command('nexus').description('NexusDB Management Explorer');

nexus.command('ls')
  .description('List all active Nexus collections')
  .action(async () => {
    const config = await init();
    await RavenNexusCommand.ls(config);
  });

nexus.command('view <name>')
  .description('View collection content in a table')
  .option('-r, --room <room>', 'Nexus room name', 'DEFAULT')
  .action(async (name, options) => {
    const config = await init();
    await RavenNexusCommand.view(config, name, options.room);
  });

nexus.command('drop <name>')
  .description('Delete a collection from NexusDB')
  .option('-r, --room <room>', 'Nexus room name', 'DEFAULT')
  .action(async (name, options) => {
    const config = await init();
    await RavenNexusCommand.drop(config, name, options.room);
  });

nexus.command('clear')
  .description('Wipe the entire local NexusDB')
  .action(async () => {
    const config = await init();
    await RavenNexusCommand.clear(config);
  });

program.parse(process.argv);
