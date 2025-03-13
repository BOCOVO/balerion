import { createCommand } from 'commander';

import type { BalerionCommand } from '../../types';

/**
 *`$ balerion templates:generate <directory>`
 */
const command: BalerionCommand = () => {
  return createCommand('templates:generate <directory>')
    .description('(deprecated) Generate template from Balerion project')
    .action(() => {
      console.warn('This command is deprecated and will be removed in the next major release.');
      console.warn('You can now copy an existing app and use it as a template.');
    });
};

export { command };
