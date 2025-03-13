import action from './action';
import command from './command';
import type { BalerionCloudCommandInfo } from '../types';

export { action, command };

export default {
  name: 'login',
  description: 'Balerion Cloud Login',
  action,
  command,
} as BalerionCloudCommandInfo;
