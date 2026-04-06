import { spawn, SpawnOptions, execSync } from 'child_process';
import { RavenLogger } from './logger.js';
import readline from 'readline';

export const RavenRunner = {
  /**
   * Run a simple command with inherited stdio.
   */
  run: async (command: string, args: string[], options: SpawnOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Command ${command} ${args.join(' ')} failed with exit code ${code}`));
      });

      child.on('error', (err) => reject(err));
    });
  },

  /**
   * Run a command and stream its output with a platform prefix.
   * This is critical for professional multi-platform dev logs.
   */
  runStreaming: (command: string, args: string[], platform: string, options: SpawnOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        shell: true,
        ...options,
        stdio: ['inherit', 'pipe', 'pipe'] // Pipe stdout/stderr for prefixing
      });

      const rlOut = readline.createInterface({ input: child.stdout! });
      const rlErr = readline.createInterface({ input: child.stderr! });

      rlOut.on('line', (line) => {
        // Prevent empty lines and excessive noise
        if (line.trim()) RavenLogger.info(line, platform);
      });

      rlErr.on('line', (line) => {
        if (line.trim()) RavenLogger.error(line, undefined, platform);
      });

      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`[${platform.toUpperCase()}] Command failed with exit code ${code}`));
      });

      child.on('error', (err) => reject(err));
    });
  },

  /**
   * Automatically clears ports to prevent EADDRINUSE errors.
   * Self-healing logic for the Raven-Os Dev environment.
   */
  cleanupPorts: async (ports: number[]): Promise<void> => {
    RavenLogger.info(`Self-Healing: Cleaning up ports [${ports.join(', ')}]...`);
    
    for (const port of ports) {
      try {
        if (process.platform === 'win32') {
          // Robust PowerShell command to find and kill processes on a port
          const cmd = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`;
          execSync(`powershell -Command "${cmd}"`, { stdio: 'ignore' });
        } else {
          // Standard Unix command
          execSync(`lsof -t -i:${port} | xargs kill -9`, { stdio: 'ignore' });
        }
      } catch (e) {
        // Silently fail if no process found
      }
    }

    // Small delay to allow the OS to fully release the socket
    return new Promise(resolve => setTimeout(resolve, 600));
  }
};
