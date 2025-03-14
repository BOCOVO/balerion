import { createCommand } from 'commander';
import type { BalerionCloudCommand } from '../types';
import { runAction } from '../utils/helpers';
import action from './action';

/**
 * `$ cloud device flow logout`
 */
const command: BalerionCloudCommand = ({ ctx }) => {
  return createCommand('cloud:logout')
    .alias('logout')
    .description('Balerion Cloud Logout')
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('logout', action)(ctx));
};

export default command;
