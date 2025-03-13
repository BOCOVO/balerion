import { pipe, omit, pick } from 'lodash/fp';
import type { Core, UID, Utils } from '@balerion/types';

import { createController } from './core-api/controller';
import { createService } from './core-api/service';
import { createRoutes } from './core-api/routes';

const symbols = {
  CustomController: Symbol('BalerionCustomCoreController'),
} as const;

type WithBalerionCallback<T> = T | (<S extends { balerion: Core.Balerion }>(params: S) => T);

const createCoreController = <
  TUID extends UID.ContentType,
  TController extends Core.CoreAPI.Controller.Extendable<TUID>,
>(
  uid: TUID,
  cfg?: WithBalerionCallback<
    Utils.PartialWithThis<Core.CoreAPI.Controller.Extendable<TUID> & TController>
  >
) => {
  return ({
    balerion,
  }: {
    balerion: Core.Balerion;
  }): TController & Core.CoreAPI.Controller.ContentType<TUID> => {
    const baseController = createController({ contentType: balerion.contentType(uid) });

    const userCtrl = typeof cfg === 'function' ? cfg({ balerion }) : (cfg ?? ({} as any));

    for (const methodName of Object.keys(baseController) as Array<keyof typeof baseController>) {
      if (userCtrl[methodName] === undefined) {
        userCtrl[methodName] = baseController[methodName];
      }
    }

    Object.setPrototypeOf(userCtrl, baseController);

    const isCustom = typeof cfg !== 'undefined';
    if (isCustom) {
      Object.defineProperty(userCtrl, symbols.CustomController, {
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }

    return userCtrl;
  };
};

function createCoreService<
  TUID extends UID.ContentType,
  TService extends Core.CoreAPI.Service.Extendable<TUID>,
>(
  uid: TUID,
  cfg?: WithBalerionCallback<Utils.PartialWithThis<Core.CoreAPI.Service.Extendable<TUID> & TService>>
) {
  return ({
    balerion,
  }: {
    balerion: Core.Balerion;
  }): TService & Core.CoreAPI.Service.ContentType<TUID> => {
    const baseService = createService({ contentType: balerion.contentType(uid) });

    const userService = typeof cfg === 'function' ? cfg({ balerion }) : (cfg ?? ({} as any));

    for (const methodName of Object.keys(baseService) as Array<keyof typeof baseService>) {
      if (userService[methodName] === undefined) {
        userService[methodName] = baseService[methodName];
      }
    }

    Object.setPrototypeOf(userService, baseService);
    return userService;
  };
}

function createCoreRouter<T extends UID.ContentType>(
  uid: T,
  cfg?: Core.CoreAPI.Router.RouterConfig<T>
): Core.CoreAPI.Router.Router {
  const { prefix, config = {}, only, except, type = 'content-api' } = cfg ?? {};
  let routes: Core.CoreAPI.Router.Route[];

  return {
    type,
    prefix,
    get routes() {
      if (!routes) {
        const contentType = balerion.contentType(uid);

        const defaultRoutes = createRoutes({ contentType });
        const keys = Object.keys(defaultRoutes) as Array<keyof typeof defaultRoutes>;

        keys.forEach((routeName) => {
          const defaultRoute = defaultRoutes[routeName];

          Object.assign(defaultRoute.config, config[routeName] || {});
        });

        const selectedRoutes = pipe(
          (routes) => (except ? omit(except, routes) : routes),
          (routes) => (only ? pick(only, routes) : routes)
        )(defaultRoutes);

        routes = Object.values(selectedRoutes);
      }

      return routes;
    },
  };
}

const isCustomController = <T extends Core.Controller>(controller: T): boolean => {
  return symbols.CustomController in controller;
};

export { createCoreController, createCoreService, createCoreRouter, isCustomController };
