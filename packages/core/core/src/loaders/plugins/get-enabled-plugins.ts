/* eslint-disable @typescript-eslint/no-var-requires */
import { dirname, join, resolve } from 'path';
import { statSync, existsSync } from 'fs';
import _ from 'lodash';
import { get, pickBy, defaultsDeep, map, prop, pipe } from 'lodash/fp';
import { strings } from '@balerion/utils';
import type { Core } from '@balerion/types';
import { getUserPluginsConfig } from './get-user-plugins-config';

interface PluginMeta {
  enabled: boolean;
  pathToPlugin?: string;
  info: Record<string, unknown>;
  packageInfo?: Record<string, unknown>;
}

type PluginMetas = Record<string, PluginMeta>;

interface PluginInfo {
  name: string;
  kind: string;
}

interface PluginDeclaration {
  enabled: boolean;
  resolve: string;
  isModule: boolean;
}

/**
 * otherwise known as "core features"
 *
 * NOTE: These are excluded from the content manager plugin list, as they are always enabled.
 *       See admin.ts server controller on the content-manager plugin for more details.
 */
const INTERNAL_PLUGINS = [
  '@balerion/content-manager',
  '@balerion/content-type-builder',
  '@balerion/email',
  '@balerion/upload',
  '@balerion/i18n',
];

const isBalerionPlugin = (info: PluginInfo) => get('balerion.kind', info) === 'plugin';

const validatePluginName = (pluginName: string) => {
  if (!strings.isKebabCase(pluginName)) {
    throw new Error(`Plugin name "${pluginName}" is not in kebab (an-example-of-kebab-case)`);
  }
};

const toDetailedDeclaration = (declaration: boolean | PluginDeclaration) => {
  if (typeof declaration === 'boolean') {
    return { enabled: declaration };
  }

  const detailedDeclaration: { enabled: boolean; pathToPlugin?: string } = {
    enabled: declaration.enabled,
  };

  if (declaration?.resolve) {
    let pathToPlugin = '';

    if (declaration.isModule) {
      /**
       * we only want the node_module here, not the package.json
       */
      pathToPlugin = join(declaration.resolve, '..');
    } else {
      try {
        pathToPlugin = dirname(require.resolve(declaration.resolve));
      } catch (e) {
        pathToPlugin = resolve(balerion.dirs.app.root, declaration.resolve);

        if (!existsSync(pathToPlugin) || !statSync(pathToPlugin).isDirectory()) {
          throw new Error(`${declaration.resolve} couldn't be resolved`);
        }
      }
    }

    detailedDeclaration.pathToPlugin = pathToPlugin;
  }

  return detailedDeclaration;
};

export const getEnabledPlugins = async (balerion: Core.Balerion, { client } = { client: false }) => {
  const internalPlugins: PluginMetas = {};

  for (const dep of INTERNAL_PLUGINS) {
    const packagePath = join(dep, 'package.json');

    // NOTE: internal plugins should be resolved from the balerion package
    const packageModulePath = require.resolve(packagePath, {
      paths: [require.resolve('@balerion/balerion/package.json'), process.cwd()],
    });

    const packageInfo = require(packageModulePath);

    validatePluginName(packageInfo.balerion.name);
    internalPlugins[packageInfo.balerion.name] = {
      ...toDetailedDeclaration({ enabled: true, resolve: packageModulePath, isModule: client }),
      info: packageInfo.balerion,
      packageInfo,
    };
  }

  const installedPlugins: PluginMetas = {};
  const dependencies = balerion.config.get('info.dependencies', {});

  for (const dep of Object.keys(dependencies)) {
    const packagePath = join(dep, 'package.json');
    let packageInfo;
    try {
      packageInfo = require(packagePath);
    } catch {
      continue;
    }

    if (isBalerionPlugin(packageInfo)) {
      validatePluginName(packageInfo.balerion.name);
      installedPlugins[packageInfo.balerion.name] = {
        ...toDetailedDeclaration({ enabled: true, resolve: packagePath, isModule: client }),
        info: {
          ...packageInfo.balerion,
          packageName: packageInfo.name,
        },
        packageInfo,
      };
    }
  }

  const declaredPlugins: PluginMetas = {};
  const userPluginsConfig = await getUserPluginsConfig();

  _.forEach(userPluginsConfig, (declaration, pluginName) => {
    validatePluginName(pluginName);

    declaredPlugins[pluginName] = {
      ...toDetailedDeclaration(declaration),
      info: {},
    };

    const { pathToPlugin } = declaredPlugins[pluginName];

    // for manually resolved plugins
    if (pathToPlugin) {
      const packagePath = join(pathToPlugin, 'package.json');
      const packageInfo = require(packagePath);

      if (isBalerionPlugin(packageInfo)) {
        declaredPlugins[pluginName].info = packageInfo.balerion || {};
        declaredPlugins[pluginName].packageInfo = packageInfo;
      }
    }
  });

  const declaredPluginsResolves = map(prop('pathToPlugin'), declaredPlugins);
  const installedPluginsNotAlreadyUsed = pickBy(
    (p) => !declaredPluginsResolves.includes(p.pathToPlugin),
    installedPlugins
  );

  const enabledPlugins = pipe(
    defaultsDeep(declaredPlugins),
    defaultsDeep(installedPluginsNotAlreadyUsed),
    pickBy((p: PluginMeta) => p.enabled)
  )(internalPlugins);

  return enabledPlugins;
};
