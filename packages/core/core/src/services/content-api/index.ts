import _ from 'lodash';
import { sanitize, validate } from '@balerion/utils';

import type { Core, UID } from '@balerion/types';

import instantiatePermissionsUtilities from './permissions';

const transformRoutePrefixFor = (pluginName: string) => (route: Core.Route) => {
  const prefix = route.config && route.config.prefix;
  const path = prefix !== undefined ? `${prefix}${route.path}` : `/${pluginName}${route.path}`;

  return {
    ...route,
    path,
  };
};

const filterContentAPI = (route: Core.Route) => route.info.type === 'content-api';

/**
 * Create a content API container that holds logic, tools and utils. (eg: permissions, ...)
 */
const createContentAPI = (balerion: Core.Balerion) => {
  const getRoutesMap = async () => {
    const routesMap: Record<string, Core.Route[]> = {};

    _.forEach(balerion.apis, (api, apiName) => {
      const routes = _.flatMap(api.routes, (route) => {
        if ('routes' in route) {
          return route.routes;
        }

        return route;
      }).filter(filterContentAPI);

      if (routes.length === 0) {
        return;
      }

      const apiPrefix = balerion.config.get('api.rest.prefix');
      routesMap[`api::${apiName}`] = routes.map((route) => ({
        ...route,
        path: `${apiPrefix}${route.path}`,
      }));
    });

    _.forEach(balerion.plugins, (plugin, pluginName) => {
      const transformPrefix = transformRoutePrefixFor(pluginName);

      if (Array.isArray(plugin.routes)) {
        return plugin.routes.map(transformPrefix).filter(filterContentAPI);
      }

      const routes = _.flatMap(plugin.routes, (route) => route.routes.map(transformPrefix)).filter(
        filterContentAPI
      );

      if (routes.length === 0) {
        return;
      }

      const apiPrefix = balerion.config.get('api.rest.prefix');
      routesMap[`plugin::${pluginName}`] = routes.map((route) => ({
        ...route,
        path: `${apiPrefix}${route.path}`,
      }));
    });

    return routesMap;
  };

  const sanitizer = sanitize.createAPISanitizers({
    getModel(uid: string) {
      return balerion.getModel(uid as UID.Schema);
    },
    // NOTE: use lazy access to allow registration of sanitizers after the creation of the container
    get sanitizers() {
      return {
        input: balerion.sanitizers.get('content-api.input'),
        output: balerion.sanitizers.get('content-api.output'),
      };
    },
  });

  const validator = validate.createAPIValidators({
    getModel(uid: string) {
      return balerion.getModel(uid as UID.Schema);
    },
    // NOTE: use lazy access to allow registration of validators after the creation of the container
    get validators() {
      return {
        input: balerion.validators.get('content-api.input'),
      };
    },
  });

  return {
    permissions: instantiatePermissionsUtilities(balerion),
    getRoutesMap,
    sanitize: sanitizer,
    validate: validator,
  };
};

export default createContentAPI;
