import { createCommand } from 'commander';
import CLITable from 'cli-table3';
import chalk from 'chalk';
import { createBalerion, compileBalerion } from '@balerion/core';

import type { BalerionCommand } from '../../types';
import { runAction } from '../../utils/helpers';

const action = async () => {
  const appContext = await compileBalerion();
  const app = await createBalerion(appContext).register();

  const list = app.get('hooks').keys();

  const infoTable = new CLITable({
    head: [chalk.blue('Name')],
  });

  list.forEach((name: string) => infoTable.push([name]));

  console.log(infoTable.toString());

  await app.destroy();
};

/**
 * `$ balerion hooks:list`
 */
const command: BalerionCommand = () => {
  return createCommand('hooks:list')
    .description('List all the application hooks')
    .action(runAction('hooks:list', action));
};

export { action, command };
