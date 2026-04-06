import fs from 'fs-extra';
import path from 'path';

export interface CacheData {
  [taskName: string]: string; // name -> hash
}

export class RavenCache {
  private cachePath: string;
  private data: CacheData = {};

  constructor(root: string) {
    this.cachePath = path.join(root, '.raven', 'cache.json');
  }

  async load() {
    if (await fs.pathExists(this.cachePath)) {
      this.data = await fs.readJson(this.cachePath);
    }
  }

  async save() {
    await fs.ensureDir(path.dirname(this.cachePath));
    await fs.writeJson(this.cachePath, this.data, { spaces: 2 });
  }

  get(taskName: string): string | undefined {
    return this.data[taskName];
  }

  set(taskName: string, hash: string) {
    this.data[taskName] = hash;
  }

  async hasHit(taskName: string, currentHash: string): Promise<boolean> {
    return this.get(taskName) === currentHash;
  }

  async clear() {
    await fs.remove(this.cachePath);
    this.data = {};
  }
}
