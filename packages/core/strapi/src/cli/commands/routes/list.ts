import { createCommand } from 'commander';
import CLITable from 'cli-table3';
import chalk from 'chalk';
import { toUpper } from 'lodash/fp';

import { createBalerion, compileBalerion } from '@balerion/core';

import type { BalerionCommand } from '../../types';
import { runAction } from '../../utils/helpers';

const action = async () => {
  const appContext = await compileBalerion();
  const app = await createBalerion(appContext).load();

  const list = app.server.mount().listRoutes();

  const infoTable = new CLITable({
    head: [chalk.blue('Method'), chalk.blue('Path')],
    colWidths: [20],
  });

  list
    .filter((route) => route.methods.length)
    .forEach((route) => {
      infoTable.push([route.methods.map(toUpper).join('|'), route.path]);
    });

  console.log(infoTable.toString());

  await app.destroy();
};

/**
 * `$ balerion routes:list``
 */
const command: BalerionCommand = () => {
  return createCommand('routes:list')
    .description('List all the application routes')
    .action(runAction('routes:list', action));
};

export { action, command };
