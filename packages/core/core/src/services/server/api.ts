import Router from '@koa/router';
import type { Core } from '@balerion/types';

import { createRouteManager } from './routing';

interface Options {
  prefix?: string;
  type?: string;
}

const createAPI = (balerion: Core.Balerion, opts: Options = {}) => {
  const { prefix, type } = opts;

  const api = new Router({ prefix });

  const routeManager = createRouteManager(balerion, { type });

  return {
    listRoutes() {
      return [...api.stack];
    },

    use(fn: Router.Middleware) {
      api.use(fn);
      return this;
    },

    routes(routes: Core.Router | Core.Route[]) {
      routeManager.addRoutes(routes, api);
      return this;
    },

    mount(router: Router) {
      router.use(api.routes(), api.allowedMethods());
      return this;
    },
  };
};

export { createAPI };
