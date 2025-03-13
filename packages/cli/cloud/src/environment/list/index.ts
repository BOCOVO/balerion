import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../../types';

export { action, command };

export default {
  name: 'list-environments',
  description: 'List Balerion Cloud environments',
  action,
  command,
} as BalerionCloudCommandInfo;
