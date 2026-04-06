import path from 'path';

/**
 * Task Graph for resolving dependency order of plugins/tasks.
 */
export class TaskGraph {
  private tasks: Map<string, string[]> = new Map();

  addTask(name: string, dependencies: string[]) {
    this.tasks.set(name, dependencies);
  }

  resolve(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const deps = this.tasks.get(name) || [];
      for (const dep of deps) {
        visit(dep);
      }
      result.push(name);
    };

    for (const name of this.tasks.keys()) {
      visit(name);
    }

    return result;
  }
}

export interface ModuleNode {
  path: string;
  imports: string[];
  dependents: string[];
}

/**
 * Raven-Os Module Graph (V1)
 * Tracks the dependency relationships between files in the project.
 * Uses esbuild's metafile to build a bidirectional graph.
 */
export class ModuleGraph {
  private nodes: Map<string, ModuleNode> = new Map();

  constructor(private projectRoot: string) {}

  update(metafile: { inputs: Record<string, { imports: { path: string }[] }> }) {
    this.nodes.clear();

    for (const [inputPath, data] of Object.entries(metafile.inputs)) {
      const normalizedPath = path.resolve(this.projectRoot, inputPath);
      const imports = data.imports.map(i => path.resolve(this.projectRoot, i.path));

      const node = this.getOrCreateNode(normalizedPath);
      node.imports = imports;

      for (const imp of imports) {
        const impNode = this.getOrCreateNode(imp);
        if (!impNode.dependents.includes(normalizedPath)) {
          impNode.dependents.push(normalizedPath);
        }
      }
    }
  }

  getAffectedFiles(changedFile: string): string[] {
    const absoluteChangedFile = path.resolve(this.projectRoot, changedFile);
    const affected = new Set<string>();
    const stack = [absoluteChangedFile];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (affected.has(current)) continue;
      affected.add(current);

      const node = this.nodes.get(current);
      if (node) {
        stack.push(...node.dependents);
      }
    }

    return Array.from(affected);
  }

  private getOrCreateNode(filePath: string): ModuleNode {
    if (!this.nodes.has(filePath)) {
      this.nodes.set(filePath, { path: filePath, imports: [], dependents: [] });
    }
    return this.nodes.get(filePath)!;
  }
}
