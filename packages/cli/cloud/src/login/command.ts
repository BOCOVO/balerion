import { createCommand } from 'commander';
import type { BalerionCloudCommand } from '../types';
import { runAction } from '../utils/helpers';
import action from './action';

/**
 * `$ cloud device flow login`
 */
const command: BalerionCloudCommand = ({ ctx }) => {
  return createCommand('cloud:login')
    .alias('login')
    .description('Balerion Cloud Login')
    .addHelpText(
      'after',
      '\nAfter running this command, you will be prompted to enter your authentication information.'
    )
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('login', action)(ctx));
};

export default command;
