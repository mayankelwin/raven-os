import fs from 'fs-extra';
import path from 'path';
import { RavenLogger } from '../core/logger.js';
import { RavenConfig } from '../core/config.js';
import chalk from 'chalk';

/**
 * Raven Nexus Explorer (V33)
 * Dedicated CLI for managing the persistent NexusDB.
 */
export const RavenNexusCommand = {
  dbPath: (config: RavenConfig) => path.join(config.root, '.raven', 'nexus_db.json'),

  async ls(config: RavenConfig) {
    const dbPath = this.dbPath(config);
    if (!fs.existsSync(dbPath)) {
      RavenLogger.info('NexusDB is empty. Start your dev server to begin syncing.');
      return;
    }

    const db = await fs.readJson(dbPath);
    const rooms = Object.keys(db);

    RavenLogger.header();
    RavenLogger.info('--- ACTIVE NEXUS COLLECTIONS ---');
    rooms.forEach(room => {
      const collections = Object.keys(db[room]);
      RavenLogger.step(`Room: ${chalk.bold(room)} [${collections.length} tables]`);
      collections.forEach(coll => {
        const count = Array.isArray(db[room][coll]) ? db[room][coll].length : 'Document';
        console.log(`  - ${chalk.cyan(coll)}: ${count} entries`);
      });
    });
  },

  async view(config: RavenConfig, collectionName: string, room: string = 'DEFAULT') {
    const dbPath = this.dbPath(config);
    if (!fs.existsSync(dbPath)) return;

    const db = await fs.readJson(dbPath);
    const data = db[room]?.[collectionName];

    if (!data) {
      RavenLogger.error(`Collection '${collectionName}' not found in room '${room}'.`);
      return;
    }

    RavenLogger.header();
    RavenLogger.info(`Viewing Collection: ${chalk.bold(collectionName)}`);
    console.table(data);
  },

  async drop(config: RavenConfig, collectionName: string, room: string = 'DEFAULT') {
    const dbPath = this.dbPath(config);
    if (!fs.existsSync(dbPath)) return;

    const db = await fs.readJson(dbPath);
    if (db[room]?.[collectionName]) {
      delete db[room][collectionName];
      await fs.writeJson(dbPath, db, { spaces: 2 });
      RavenLogger.success(`Collection '${collectionName}' dropped successfully.`);
    } else {
      RavenLogger.error(`Collection '${collectionName}' not found.`);
    }
  },

  async clear(config: RavenConfig) {
    const dbPath = this.dbPath(config);
    if (fs.existsSync(dbPath)) {
        await fs.remove(dbPath);
        RavenLogger.success('NexusDB cleared successfully! 🧹');
    }
  }
};
