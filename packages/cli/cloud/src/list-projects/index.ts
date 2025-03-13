import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../types';

export { action, command };

export default {
  name: 'list-projects',
  description: 'List Balerion Cloud projects',
  action,
  command,
} as BalerionCloudCommandInfo;
