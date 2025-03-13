import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../types';

export { action, command };

export default {
  name: 'create-project',
  description: 'Create a new project',
  action,
  command,
} as BalerionCloudCommandInfo;
