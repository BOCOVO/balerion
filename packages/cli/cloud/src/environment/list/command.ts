import { type BalerionCloudCommand } from '../../types';
import { runAction } from '../../utils/helpers';
import action from './action';
import { initializeEnvironmentCommand } from '../command';

const command: BalerionCloudCommand = ({ command, ctx }) => {
  const environmentCmd = initializeEnvironmentCommand(command, ctx);

  environmentCmd
    .command('list')
    .description('List Balerion Cloud project environments')
    .option('-d, --debug', 'Enable debugging mode with verbose logs')
    .option('-s, --silent', "Don't log anything")
    .action(() => runAction('list', action)(ctx));
};

export default command;
