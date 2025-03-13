import type { Plugin } from '@balerion/types';
import history from './history';

const destroy: Plugin.LoadedPlugin['destroy'] = async ({ balerion }) => {
  await history.destroy?.({ balerion });
};

export default destroy;
