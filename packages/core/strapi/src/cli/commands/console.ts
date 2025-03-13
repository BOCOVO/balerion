import REPL from 'repl';
import { createCommand } from 'commander';
import { createBalerion, compileBalerion } from '@balerion/core';

import type { BalerionCommand } from '../types';
import { runAction } from '../utils/helpers';

const action = async () => {
  const appContext = await compileBalerion();
  const app = await createBalerion(appContext).load();

  app.start().then(() => {
    const repl = REPL.start(app.config.info.name + ' > ' || 'balerion > '); // eslint-disable-line prefer-template

    repl.on('exit', (err: Error) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }

      app.server.destroy();
      process.exit(0);
    });
  });
};

/**
 * `$ balerion console`
 */
const command: BalerionCommand = () => {
  return createCommand('console')
    .description('Open the Balerion framework console')
    .action(runAction('console', action));
};

export { action, command };
