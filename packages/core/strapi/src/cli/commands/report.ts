import { createCommand } from 'commander';
import { EOL } from 'os';
import { createBalerion, compileBalerion } from '@balerion/core';
import type { BalerionCommand } from '../types';
import { runAction } from '../utils/helpers';

interface CmdOptions {
  uuid: boolean;
  dependencies: boolean;
  all: boolean;
}

const action = async ({ uuid, dependencies, all }: CmdOptions) => {
  const config = {
    reportUUID: Boolean(all || uuid),
    reportDependencies: Boolean(all || dependencies),
  };

  const appContext = await compileBalerion();
  const app = await createBalerion(appContext).register();

  let debugInfo = `Launched In: ${Date.now() - app.config.launchedAt} ms
Environment: ${app.config.environment}
OS: ${process.platform}-${process.arch}
Balerion Version: ${app.config.info.balerion}
Node/Yarn Version: ${process.env.npm_config_user_agent}
Edition: ${'Community'}
Database: ${app?.config?.database?.connection?.client ?? 'unknown'}`;

  if (config.reportUUID) {
    debugInfo += `${EOL}UUID: ${app.config.uuid}`;
  }

  if (config.reportDependencies) {
    debugInfo += `${EOL}Dependencies: ${JSON.stringify(app.config.info.dependencies, null, 2)}
Dev Dependencies: ${JSON.stringify(app.config.info.devDependencies, null, 2)}`;
  }

  console.log(debugInfo);

  await app.destroy();
};

/**
 * `$ balerion report`
 */
const command: BalerionCommand = () => {
  return createCommand('report')
    .description('Get system stats for debugging and submitting issues')
    .option('-u, --uuid', 'Include Project UUID')
    .option('-d, --dependencies', 'Include Project Dependencies')
    .option('--all', 'Include All Information')
    .action(runAction('report', action));
};

export { command };
