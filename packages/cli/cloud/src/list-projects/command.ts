import { type BalerionCloudCommand } from '../types';
import { runAction } from '../utils/helpers';
import action from './action';

/**
 * `$ list project from the cloud`
 */
const command: BalerionCloudCommand = ({ command, ctx }) => {
  command
    .command('cloud:projects')
    .alias('projects')
    .description('List Balerion Cloud projects')
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('projects', action)(ctx));
};

export default command;
