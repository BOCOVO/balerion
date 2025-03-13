import { createCommand } from 'commander';
import fs from 'fs';
import tsUtils from '@balerion/typescript-utils';
import { createBalerion } from '@balerion/core';

import type { BalerionCommand } from '../types';
import { runAction } from '../utils/helpers';

const action = async () => {
  const appDir = process.cwd();

  const isTSProject = await tsUtils.isUsingTypeScript(appDir);

  const outDir = await tsUtils.resolveOutDir(appDir);
  const distDir = isTSProject ? outDir : appDir;

  const buildDirExists = fs.existsSync(outDir);
  if (isTSProject && !buildDirExists)
    throw new Error(
      `${outDir} directory not found. Please run the build command before starting your application`
    );

  createBalerion({ appDir, distDir }).start();
};

/**
 * `$ balerion start`
 */
const command: BalerionCommand = () => {
  return createCommand('start')
    .description('Start your Balerion application')
    .action(runAction('start', action));
};

export { command };
