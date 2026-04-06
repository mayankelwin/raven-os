import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export const RavenHashing = {
  /**
   * Generates a hash for a given string (e.g. config)
   */
  hashString: (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Generates a hash for a directory's metadata (mtime and size)
   * This is FASTER than deep scanning all file contents.
   */
  hashDirectoryStats: async (dirPath: string): Promise<string> => {
    if (!await fs.pathExists(dirPath)) return 'missing';
    
    const files = await fs.readdir(dirPath);
    let combinedStats = '';
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      combinedStats += `${file}:${stat.mtimeMs}:${stat.size}|`;
    }
    
    return RavenHashing.hashString(combinedStats);
  },

  /**
   * Generates a hash for a specific file's content
   */
  hashFile: async (filePath: string): Promise<string> => {
    if (!await fs.pathExists(filePath)) return 'missing';
    const content = await fs.readFile(filePath);
    return RavenHashing.hashString(content.toString());
  }
};
