import { type BalerionCloudCommand } from '../types';
import { runAction } from '../utils/helpers';
import action from './action';

/**
 * `$ link local directory to project of the cloud`
 */
const command: BalerionCloudCommand = ({ command, ctx }) => {
  command
    .command('cloud:link')
    .alias('link')
    .description('Link a local directory to a Balerion Cloud project')
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('link', action)(ctx));
};

export default command;
