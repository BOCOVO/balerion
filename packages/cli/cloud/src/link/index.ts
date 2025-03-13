import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../types';

export { action, command };

export default {
  name: 'link-project',
  description: 'Link a local directory to a Balerion Cloud project',
  action,
  command,
} as BalerionCloudCommandInfo;
