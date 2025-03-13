import { Command } from 'commander';
import { createLogger } from './services';
import { CLIContext } from './types';
import { buildBalerionCloudCommands } from './index';

function loadBalerionCloudCommand(argv = process.argv, command = new Command()) {
  // Initial program setup
  command.storeOptionsAsProperties(false).allowUnknownOption(true);

  // Help command
  command.helpOption('-h, --help', 'Display help for command');
  command.addHelpCommand('help [command]', 'Display help for command');

  const cwd = process.cwd();

  const hasDebug = argv.includes('--debug');
  const hasSilent = argv.includes('--silent');

  const logger = createLogger({ debug: hasDebug, silent: hasSilent, timestamp: false });

  const ctx = {
    cwd,
    logger,
  } satisfies CLIContext;

  buildBalerionCloudCommands({ command, ctx, argv });
}

function runBalerionCloudCommand(argv = process.argv, command = new Command()) {
  loadBalerionCloudCommand(argv, command);
  command.parse(argv);
}

export { runBalerionCloudCommand };
