import path from 'path';
import fs from 'fs-extra';

export interface RavenConfig {
  root: string;
  appsDir: string;
  packagesDir: string;
  isMonorepo: boolean;
}

export const RavenConfigLoader = {
  detect: async (startDir: string = process.cwd()): Promise<RavenConfig> => {
    let currentDir = startDir;
    
    // Check for package.json with workspaces or turbo.json up to 5 levels
    for (let i = 0; i < 5; i++) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const turboJsonPath = path.join(currentDir, 'turbo.json');
      
      if (await fs.pathExists(packageJsonPath)) {
        const pkg = await fs.readJson(packageJsonPath);
        if (pkg.workspaces || await fs.pathExists(turboJsonPath)) {
          return {
            root: currentDir,
            appsDir: path.join(currentDir, 'apps'),
            packagesDir: path.join(currentDir, 'packages'),
            isMonorepo: !!pkg.workspaces
          };
        }
      }
      
      currentDir = path.dirname(currentDir);
      if (currentDir === path.parse(currentDir).root) break;
    }
    
    throw new Error('Not a Raven-Os project (root package.json or turbo.json not found).');
  }
};
