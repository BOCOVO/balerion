import { createCommand } from 'commander';
import { type BalerionCloudCommand } from '../types';
import { runAction } from '../utils/helpers';
import action from './action';

/**
 * `$ create project in Balerion cloud`
 */
const command: BalerionCloudCommand = ({ ctx }) => {
  return createCommand('cloud:create-project')
    .description('Create a Balerion Cloud project')
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('cloud:create-project', action)(ctx));
};

export default command;
