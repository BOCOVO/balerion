import { createCommand } from 'commander';
import cluster from 'node:cluster';
import type { BalerionCommand } from '../types';
import { develop as nodeDevelop, DevelopOptions } from '../../node/develop';
import { handleUnexpectedError } from '../../node/core/errors';

type DevelopCLIOptions = DevelopOptions;

const action = async (options: DevelopCLIOptions) => {
  try {
    if (cluster.isPrimary) {
      if (options.bundler === 'webpack') {
        options.logger.warn(
          '[@balerion/balerion]: Using webpack as a bundler is deprecated. You should migrate to vite.'
        );
      }
    }

    await nodeDevelop(options);
  } catch (err) {
    handleUnexpectedError(err);
  }
};

/**
 * `$ balerion develop`
 */
const command: BalerionCommand = ({ ctx }) => {
  return createCommand('develop')
    .alias('dev')
    .option('--bundler [bundler]', 'Bundler to use (webpack or vite)', 'vite')
    .option('-d, --debug', 'Enable debugging mode with verbose logs', false)
    .option('--silent', "Don't log anything", false)
    .option('--polling', 'Watch for file changes in network directories', false)
    .option('--watch-admin', 'Watch the admin panel for hot changes', true)
    .option('--no-watch-admin', 'Do not watch the admin panel for hot changes')
    .option('--open', 'Open the admin in your browser', true)
    .description('Start your Balerion application in development mode')
    .action(async (options: DevelopCLIOptions) => {
      return action({ ...options, ...ctx });
    });
};

export { command };
