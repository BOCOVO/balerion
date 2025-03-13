import type Koa from 'koa';

import type * as UID from '../uid';

import type { Balerion } from './balerion';

export type MiddlewareFactory<T = any> = (
  config: T,
  ctx: { balerion: Balerion }
) => MiddlewareHandler | void;

export type MiddlewareName = UID.Middleware | string;

export type MiddlewareConfig = {
  name?: MiddlewareName;
  resolve?: string;
  config?: unknown;
};

export type MiddlewareHandler = Koa.Middleware;

export type Middleware = MiddlewareHandler | MiddlewareFactory;
