import { has } from 'lodash/fp';

import type { Core } from '@balerion/types';

type PluginMap = Record<string, Core.Plugin>;

const pluginsRegistry = (balerion: Core.Balerion) => {
  const plugins: PluginMap = {};

  return {
    get(name: string) {
      return plugins[name];
    },
    getAll() {
      return plugins;
    },
    add(name: string, pluginConfig: Core.Plugin) {
      if (has(name, plugins)) {
        throw new Error(`Plugin ${name} has already been registered.`);
      }

      const pluginModule = balerion.get('modules').add(`plugin::${name}`, pluginConfig);
      plugins[name] = pluginModule;

      return plugins[name];
    },
  };
};

export default pluginsRegistry;
