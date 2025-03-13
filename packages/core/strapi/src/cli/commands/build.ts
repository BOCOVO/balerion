import { createCommand } from 'commander';
import type { BalerionCommand } from '../types';

import { build as nodeBuild, BuildOptions } from '../../node/build';
import { handleUnexpectedError } from '../../node/core/errors';

type BuildCLIOptions = BuildOptions;

const action = async (options: BuildCLIOptions) => {
  try {
    if (options.bundler === 'webpack') {
      options.logger.warn(
        '[@balerion/balerion]: Using webpack as a bundler is deprecated. You should migrate to vite.'
      );
    }

    await nodeBuild(options);
  } catch (err) {
    handleUnexpectedError(err);
  }
};

/**
 * `$ balerion build`
 */
const command: BalerionCommand = ({ ctx }) => {
  return createCommand('build')
    .option('--bundler [bundler]', 'Bundler to use (webpack or vite)', 'vite')
    .option('-d, --debug', 'Enable debugging mode with verbose logs', false)
    .option('--minify', 'Minify the output', true)
    .option('--silent', "Don't log anything", false)
    .option('--sourcemap', 'Produce sourcemaps', false)
    .option('--stats', 'Print build statistics to the console', false)
    .description('Build the balerion admin app')
    .action(async (options: BuildCLIOptions) => {
      return action({ ...options, ...ctx });
    });
};

export { command };
