import type { Logger } from '@balerion/logger';
import type { Database } from '@balerion/database';

import type { PropertyPath } from 'lodash';
import type * as Core from '.';
import type * as Modules from '../modules';
import type * as Schema from '../schema';

import type * as UID from '../uid';

import type { Container } from './container';

export interface Balerion extends Container {
  server: Modules.Server.Server;
  log: Logger;
  fs: BalerionFS;
  eventHub: Modules.EventHub.EventHub;
  startupLogger: StartupLogger;
  cron: Modules.Cron.CronService;
  store: Modules.CoreStore.CoreStore;
  /**
   * @deprecated will be removed in the next major
   */
  entityValidator: Modules.EntityValidator.EntityValidator;
  entityService: Modules.EntityService.EntityService;
  /**
   * @description interact with documents within Balerion, this API is currently in beta and is subject to change in the future
   * @beta
   */
  documents: Modules.Documents.Service;
  telemetry: Modules.Metrics.TelemetryService;
  requestContext: Modules.RequestContext.RequestContext;
  customFields: Modules.CustomFields.CustomFields;
  fetch: Modules.Fetch.Fetch;
  dirs: BalerionDirectories;
  admin: Core.Module;
  isLoaded: boolean;
  db: Database;
  app: any;
  features: Modules.Features.FeaturesService;
  components: Schema.Components;
  reload: Reloader;
  config: ConfigProvider;
  services: Record<string, Core.Service>;
  service(uid: UID.Service): Core.Service;
  controllers: Record<string, Core.Controller>;
  controller(uid: UID.Controller): Core.Controller;
  contentTypes: Schema.ContentTypes;
  contentType<TContentTypeUID extends UID.ContentType>(
    name: TContentTypeUID
  ): Schema.ContentType<TContentTypeUID>;
  policies: Record<string, Core.Policy>;
  policy(name: string): Core.Policy;
  middlewares: Record<string, Core.MiddlewareFactory>;
  middleware(name: string): Core.MiddlewareFactory;
  plugins: Record<string, Core.Plugin>;
  plugin(name: string): Core.Plugin;
  hooks: Record<string, any>;
  hook(name: string): any;
  apis: Record<string, Core.Module>;
  api(name: string): Core.Module;
  auth: Modules.Auth.AuthenticationService;
  contentAPI: Modules.ContentAPI.ContentApi;
  sanitizers: Modules.Sanitizers.SanitizersRegistry;
  validators: Modules.Validators.ValidatorsRegistry;
  load(): Promise<Balerion>;
  start(): Promise<Balerion>;
  destroy(): Promise<void>;
  sendStartupTelemetry(): void;
  openAdmin({ isInitialized }: { isInitialized: boolean }): void;
  postListen(): Promise<void>;
  listen(): Promise<void>;
  stopWithError(err: unknown, customMessage?: string): never;
  stop(exitCode?: number): never;
  register(): Promise<Balerion>;
  bootstrap(): Promise<Balerion>;
  runPluginsLifecycles(lifecycleName: 'register' | 'bootstrap' | 'destroy'): Promise<void>;
  runUserLifecycles(lifecycleName: 'register' | 'bootstrap' | 'destroy'): Promise<void>;
  getModel<TSchemaUID extends UID.Schema>(
    uid: TSchemaUID
  ): TSchemaUID extends UID.ContentType
    ? Schema.ContentType<TSchemaUID>
    : TSchemaUID extends UID.Component
      ? Schema.Component<TSchemaUID>
      : never;
  query(uid: UID.Schema): ReturnType<Database['query']>;
}

export interface Reloader {
  isReloading: boolean;
  isWatching: boolean;
  (): void;
}

export interface StartupLogger {
  logStats(): void;
  logFirstStartupMessage(): void;
  logDefaultStartupMessage(): void;
  logStartupMessage({ isInitialized }: { isInitialized: boolean }): void;
}

export interface BalerionFS {
  writeAppFile(optPath: string | string[], data: string): Promise<void>;
  writePluginFile(plugin: string, optPath: string | string[], data: string): Promise<void>;
  removeAppFile(optPath: string | string[]): Promise<void>;
  appendFile(optPath: string | string[], data: string): void;
}

export interface ConfigProvider {
  get<T = unknown>(key: PropertyPath, defaultVal?: T): T;
  set(path: string, val: unknown): this;
  has(path: string): boolean;
  [key: string]: any;
}

export interface BalerionDirectories {
  static: {
    public: string;
  };
  app: {
    root: string;
    src: string;
    api: string;
    components: string;
    extensions: string;
    policies: string;
    middlewares: string;
    config: string;
  };
  dist: {
    root: string;
    src: string;
    api: string;
    components: string;
    extensions: string;
    policies: string;
    middlewares: string;
    config: string;
  };
}
