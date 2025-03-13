import { createCommand } from 'commander';
import { assertCwdContainsBalerionProject } from '../utils/helpers';
import type { BalerionCommand } from '../types';

/**
 * `$ balerion generate`
 */
const command: BalerionCommand = ({ argv }) => {
  return createCommand('generate')
    .description('Launch the interactive API generator')
    .action(() => {
      assertCwdContainsBalerionProject('generate');
      argv.splice(2, 1);

      // NOTE: this needs to be lazy loaded in order for plop to work correctly
      import('@balerion/generators').then((gen) => gen.runCLI());
    });
};

export { command };
