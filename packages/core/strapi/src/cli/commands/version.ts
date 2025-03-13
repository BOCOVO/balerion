import { createCommand } from 'commander';
import type { BalerionCommand } from '../types';
import { version } from '../../../package.json';

/**
 * `$ balerion version`
 */

const command: BalerionCommand = () => {
  // load the Balerion package.json to get version and other information
  return createCommand('version')
    .description('Output the version of Balerion')
    .action(() => {
      process.stdout.write(`${version}\n`);
      process.exit(0);
    });
};

export { command };
