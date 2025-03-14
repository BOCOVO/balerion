import type { Plugin } from '@balerion/types';
import preview from './preview';

const register: Plugin.LoadedPlugin['register'] = async ({ balerion }) => {
  await preview.register?.({ balerion });
};

export default register;
