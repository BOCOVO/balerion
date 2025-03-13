import { createCommand } from 'commander';
import tsUtils from '@balerion/typescript-utils';
import { createBalerion, compileBalerion } from '@balerion/core';

import type { BalerionCommand } from '../../types';
import { runAction } from '../../utils/helpers';

interface CmdOptions {
  debug?: boolean;
  silent?: boolean;
  verbose?: boolean;
  outDir?: string;
}

const action = async ({ debug, silent, verbose, outDir }: CmdOptions) => {
  if ((debug || verbose) && silent) {
    console.error('Flags conflict: both silent and debug mode are enabled, exiting...');
    process.exit(1);
  }

  const appContext = await compileBalerion({ ignoreDiagnostics: true });
  const app = await createBalerion(appContext).register();

  await tsUtils.generators.generate({
    balerion: app,
    pwd: appContext.appDir,
    rootDir: outDir ?? undefined,
    logger: {
      silent,
      debug,
    },
    artifacts: { contentTypes: true, components: true },
  });

  await app.destroy();
};

/**
 * `$ balerion ts:generate-types`
 */
const command: BalerionCommand = () => {
  return createCommand('ts:generate-types')
    .description(`Generate TypeScript typings for your schemas`)
    .option('-d, --debug', `Run the generation with debug messages`, false)
    .option('-s, --silent', `Run the generation silently, without any output`, false)
    .option(
      '-o, --out-dir <outDir>',
      'Specify a relative root directory in which the definitions will be generated. Changing this value might break types exposed by Balerion that relies on generated types.'
    )
    .action(runAction('ts:generate-types', action));
};

export { action, command };
