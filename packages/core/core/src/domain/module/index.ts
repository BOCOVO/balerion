import _, { type PropertyPath, flatten } from 'lodash';
import { yup } from '@balerion/utils';
import type { Core, UID, Struct } from '@balerion/types';

import { removeNamespace } from '../../registries/namespace';
import { validateModule } from './validation';

interface LifecyclesState {
  bootstrap?: boolean;
  register?: boolean;
  destroy?: boolean;
}

export interface RawModule {
  config?: Record<string, unknown>;
  routes?: Core.Module['routes'];
  controllers?: Core.Module['controllers'];
  services?: Core.Module['services'];
  contentTypes?: Core.Module['contentTypes'];
  policies?: Core.Module['policies'];
  middlewares?: Core.Module['middlewares'];
  bootstrap?: (params: { balerion: Core.Balerion }) => Promise<void>;
  register?: (params: { balerion: Core.Balerion }) => Promise<void>;
  destroy?: (params: { balerion: Core.Balerion }) => Promise<void>;
}

export interface Module {
  bootstrap: () => Promise<void>;
  register: () => Promise<void>;
  destroy: () => Promise<void>;
  load: () => void;
  routes: Core.Module['routes'];
  config<T = unknown>(key: PropertyPath, defaultVal?: T): T; // TODO: this mirrors ConfigProvider.get, we should use it directly
  contentType: (ctName: UID.ContentType) => Struct.ContentTypeSchema;
  contentTypes: Record<string, Struct.ContentTypeSchema>;
  service: (serviceName: UID.Service) => Core.Service;
  services: Record<string, Core.Service>;
  policy: (policyName: UID.Policy) => Core.Policy;
  policies: Record<string, Core.Policy>;
  middleware: (middlewareName: UID.Middleware) => Core.Middleware;
  middlewares: Record<string, Core.Middleware>;
  controller: (controllerName: UID.Controller) => Core.Controller;
  controllers: Record<string, Core.Controller>;
}

// Removes the namespace from a map with keys prefixed with a namespace
const removeNamespacedKeys = <T extends Record<string, unknown>>(map: T, namespace: string) => {
  return _.mapKeys(map, (value, key) => removeNamespace(key, namespace));
};

const defaultModule = {
  config: {},
  routes: [],
  controllers: {},
  services: {},
  contentTypes: {},
  policies: {},
  middlewares: {},
};

export const createModule = (
  namespace: string,
  rawModule: RawModule,
  balerion: Core.Balerion
): Module => {
  _.defaults(rawModule, defaultModule);

  try {
    validateModule(rawModule);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      throw new Error(`balerion-server.js is invalid for '${namespace}'.\n${e.errors.join('\n')}`);
    }
  }

  const called: LifecyclesState = {};
  return {
    async bootstrap() {
      if (called.bootstrap) {
        throw new Error(`Bootstrap for ${namespace} has already been called`);
      }
      called.bootstrap = true;
      await (rawModule.bootstrap && rawModule.bootstrap({ balerion }));
    },
    async register() {
      if (called.register) {
        throw new Error(`Register for ${namespace} has already been called`);
      }
      called.register = true;
      await (rawModule.register && rawModule.register({ balerion }));
    },
    async destroy() {
      if (called.destroy) {
        throw new Error(`Destroy for ${namespace} has already been called`);
      }
      called.destroy = true;
      await (rawModule.destroy && rawModule.destroy({ balerion }));
    },
    load() {
      balerion.get('content-types').add(namespace, rawModule.contentTypes);
      balerion.get('services').add(namespace, rawModule.services);
      balerion.get('policies').add(namespace, rawModule.policies);
      balerion.get('middlewares').add(namespace, rawModule.middlewares);
      balerion.get('controllers').add(namespace, rawModule.controllers);
      balerion.get('config').set(namespace, rawModule.config);
    },
    get routes() {
      return rawModule.routes ?? {};
    },
    config(path: PropertyPath, defaultValue: unknown) {
      const pathArray = flatten([namespace, path]);
      return balerion.get('config').get(pathArray, defaultValue);
    },
    contentType(ctName: UID.ContentType) {
      return balerion.get('content-types').get(`${namespace}.${ctName}`);
    },
    get contentTypes() {
      const contentTypes = balerion.get('content-types').getAll(namespace);
      return removeNamespacedKeys(contentTypes, namespace);
    },
    service(serviceName: UID.Service) {
      return balerion.get('services').get(`${namespace}.${serviceName}`);
    },
    get services() {
      const services = balerion.get('services').getAll(namespace);
      return removeNamespacedKeys(services, namespace);
    },
    policy(policyName: UID.Policy) {
      return balerion.get('policies').get(`${namespace}.${policyName}`);
    },
    get policies() {
      const policies = balerion.get('policies').getAll(namespace);
      return removeNamespacedKeys(policies, namespace);
    },
    middleware(middlewareName: UID.Middleware) {
      return balerion.get('middlewares').get(`${namespace}.${middlewareName}`);
    },
    get middlewares() {
      const middlewares = balerion.get('middlewares').getAll(namespace);
      return removeNamespacedKeys(middlewares, namespace);
    },
    controller(controllerName: UID.Controller) {
      return balerion.get('controllers').get(`${namespace}.${controllerName}`);
    },
    get controllers() {
      const controllers = balerion.get('controllers').getAll(namespace);
      return removeNamespacedKeys(controllers, namespace);
    },
  };
};
