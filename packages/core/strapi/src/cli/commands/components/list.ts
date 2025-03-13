import { createCommand } from 'commander';
import CLITable from 'cli-table3';
import chalk from 'chalk';
import { createBalerion, compileBalerion } from '@balerion/core';

import type { BalerionCommand } from '../../types';
import { runAction } from '../../utils/helpers';

const action = async () => {
  const appContext = await compileBalerion();
  const app = await createBalerion(appContext).register();

  const list = Object.keys(app.components);

  const infoTable = new CLITable({
    head: [chalk.blue('Name')],
  });

  list.forEach((name) => infoTable.push([name]));

  console.log(infoTable.toString());

  await app.destroy();
};

/**
 * `$ balerion components:list`
 */
const command: BalerionCommand = () => {
  return createCommand('components:list')
    .description('List all the application components')
    .action(runAction('components:list', action));
};

export { action, command };
