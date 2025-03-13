import type { Plugin } from '@balerion/types';
import history from './history';
import preview from './preview';

const register: Plugin.LoadedPlugin['register'] = async ({ balerion }) => {
  await history.register?.({ balerion });
  await preview.register?.({ balerion });
};

export default register;
