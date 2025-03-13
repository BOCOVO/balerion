import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../../types';

export { action, command };

export default {
  name: 'link-environment',
  description: 'Link Balerion Cloud environment to a local project',
  action,
  command,
} as BalerionCloudCommandInfo;
