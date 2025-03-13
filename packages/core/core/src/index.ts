import * as qs from 'qs';
import type { Core } from '@balerion/types';

import Balerion, { type BalerionOptions } from './Balerion';
import { destroyOnSignal, resolveWorkingDirectories, createUpdateNotifier } from './utils';

export { default as compileBalerion } from './compile';
export * as factories from './factories';

export const createBalerion = (options: Partial<BalerionOptions> = {}): Core.Balerion => {
  const balerion = new Balerion({
    ...options,
    ...resolveWorkingDirectories(options),
  });

  destroyOnSignal(balerion);
  createUpdateNotifier(balerion);

  // TODO: deprecate and remove in next major
  global.balerion = balerion;

  return balerion;
};

// Augment Koa query type based on Balerion query middleware

declare module 'koa' {
  type ParsedQuery = ReturnType<typeof qs.parse>;

  export interface BaseRequest {
    _querycache?: ParsedQuery;

    get query(): ParsedQuery;
    set query(obj: any);
  }

  export interface BaseContext {
    _querycache?: ParsedQuery;

    get query(): ParsedQuery;
    set query(obj: any);
  }
}
