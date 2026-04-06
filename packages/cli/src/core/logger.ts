import chalk from 'chalk';

export const RavenLogger = {
  onLog: (message: string, type: 'info' | 'success' | 'warning' | 'error') => {},

  header: () => {
    console.log(chalk.magenta.bold('\n⬛⬛⬛ Raven-Os Framework ⬛⬛⬛\n'));
  },

  info: (message: string, platform?: string) => {
    const prefix = platform ? chalk.magenta(`[${platform.toUpperCase()}] `) : '';
    console.log(prefix + chalk.blue.bold('ℹ ') + chalk.white(message));
    RavenLogger.onLog(message, 'info');
  },

  success: (message: string, platform?: string) => {
    const prefix = platform ? chalk.magenta(`[${platform.toUpperCase()}] `) : '';
    console.log(prefix + chalk.green.bold('✔ ') + chalk.white(message));
    RavenLogger.onLog(message, 'success');
  },

  warning: (message: string, platform?: string) => {
    const prefix = platform ? chalk.magenta(`[${platform.toUpperCase()}] `) : '';
    console.log(prefix + chalk.yellow.bold('⚠ ') + chalk.white(message));
    RavenLogger.onLog(message, 'warning');
  },

  error: (message: string, detail?: string, platform?: string) => {
    const prefix = platform ? chalk.magenta(`[${platform.toUpperCase()}] `) : '';
    console.log(prefix + chalk.red.bold('✖ ') + chalk.red(message));
    if (detail) console.log(chalk.gray(`  ${detail}`));
    RavenLogger.onLog(message, 'error');
  },

  step: (message: string, platform?: string) => {
    const prefix = platform ? chalk.magenta(`[${platform.toUpperCase()}] `) : '';
    console.log(prefix + chalk.cyan('➜ ') + chalk.white(message));
    RavenLogger.onLog(message, 'info');
  },

  divider: () => {
    console.log(chalk.gray('----------------------------------------'));
  },

  platform: (name: string) => {
    return chalk.magenta(`[${name.toUpperCase()}]`);
  },

  /**
   * Print a beautiful summary box (V22)
   */
  box: (title: string, lines: string[]) => {
    const width = 60;
    const border = chalk.magenta('═'.repeat(width));
    const side = chalk.magenta('║');
    
    console.log(`\n${border}`);
    console.log(`${side} ${chalk.magenta.bold(title.padEnd(width - 2))} ${side}`);
    console.log(chalk.magenta('╠' + '═'.repeat(width) + '╣'));
    
    lines.forEach(line => {
      console.log(`${side} ${chalk.white(line.padEnd(width - 2))} ${side}`);
    });
    
    console.log(`${border}\n`);
  }
};
