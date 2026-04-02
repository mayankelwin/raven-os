#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('raven-os')
  .description('Raven-Os Framework CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new Raven-Os project')
  .argument('[name]', 'project name')
  .action(async (name) => {
    console.log(chalk.magenta.bold('\n⬛⬛⬛ Raven-Os Framework ⬛⬛⬛\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: name || 'my-raven-project'
      },
      {
        type: 'confirm',
        name: 'includeWeb',
        message: 'Include Web (Next.js/Vite)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeMobile',
        message: 'Include Mobile (Expo/React Native)?',
        default: true
      }
    ]);

    const targetPath = path.resolve(process.cwd(), answers.projectName);

    console.log(chalk.blue(`\nInitializing project in: ${targetPath}...`));
    
    // In a real implementation, we would copy templates from a 'templates' folder.
    // For now, we'll simulate the creation of the structure.
    
    await fs.ensureDir(targetPath);
    await fs.ensureDir(path.join(targetPath, 'apps'));
    await fs.ensureDir(path.join(targetPath, 'packages'));
    
    console.log(chalk.green('\n✔ Framework core initialized successfully!'));
    console.log(chalk.yellow('\nRun:'));
    console.log(`  cd ${answers.projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
  });

program.parse();
