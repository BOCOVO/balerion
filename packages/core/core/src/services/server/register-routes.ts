import _ from 'lodash';
import type { Core } from '@balerion/types';

const createRouteScopeGenerator = (namespace: string) => (route: Core.RouteInput) => {
  const prefix = namespace.endsWith('::') ? namespace : `${namespace}.`;

  if (typeof route.handler === 'string') {
    _.defaultsDeep(route, {
      config: {
        auth: {
          scope: [`${route.handler.startsWith(prefix) ? '' : prefix}${route.handler}`],
        },
      },
    });
  }
};

/**
 * Register all routes
 */
export default (balerion: Core.Balerion) => {
  registerAdminRoutes(balerion);
  registerAPIRoutes(balerion);
  registerPluginRoutes(balerion);
};

/**
 * Register admin routes
 * @param {import('../../').Balerion} balerion
 */
const registerAdminRoutes = (balerion: Core.Balerion) => {
  const generateRouteScope = createRouteScopeGenerator(`admin::`);

  _.forEach(balerion.admin.routes, (router) => {
    router.type = router.type || 'admin';
    router.prefix = router.prefix || `/admin`;
    router.routes.forEach((route) => {
      generateRouteScope(route);
      route.info = { pluginName: 'admin' };
    });
    balerion.server.routes(router);
  });
};

/**
 * Register plugin routes
 * @param {import('../../').Balerion} balerion
 */
const registerPluginRoutes = (balerion: Core.Balerion) => {
  for (const pluginName of Object.keys(balerion.plugins)) {
    const plugin = balerion.plugins[pluginName];

    const generateRouteScope = createRouteScopeGenerator(`plugin::${pluginName}`);

    if (Array.isArray(plugin.routes)) {
      plugin.routes.forEach((route) => {
        generateRouteScope(route);
        route.info = { pluginName };
      });

      balerion.server.routes({
        type: 'admin',
        prefix: `/${pluginName}`,
        routes: plugin.routes,
      });
    } else {
      _.forEach(plugin.routes, (router) => {
        router.type = router.type || 'admin';
        router.prefix = router.prefix || `/${pluginName}`;
        router.routes.forEach((route) => {
          generateRouteScope(route);
          route.info = { pluginName };
        });

        balerion.server.routes(router);
      });
    }
  }
};

/**
 * Register api routes
 */
const registerAPIRoutes = (balerion: Core.Balerion) => {
  for (const apiName of Object.keys(balerion.apis)) {
    const api = balerion.api(apiName);

    const generateRouteScope = createRouteScopeGenerator(`api::${apiName}`);

    _.forEach(api.routes, (router) => {
      // TODO: remove once auth setup
      // pass meta down to compose endpoint
      router.type = 'content-api';
      router.routes?.forEach((route) => {
        generateRouteScope(route);
        route.info = { apiName };
      });

      return balerion.server.routes(router);
    });
  }
};
