import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../types';

export { action, command };

export default {
  name: 'deploy-project',
  description: 'Deploy a Balerion Cloud project',
  action,
  command,
} as BalerionCloudCommandInfo;
