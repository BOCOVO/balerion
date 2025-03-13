import { existsSync } from 'fs';
import { resolve } from 'path';
import koaFavicon from 'koa-favicon';
import type { Core } from '@balerion/types';

export type Config = NonNullable<Parameters<typeof koaFavicon>[1]>;

const defaults = {
  path: 'favicon.png',
  maxAge: 86400000,
};

export const favicon: Core.MiddlewareFactory<Config> = (config, { balerion }) => {
  const { maxAge, path: faviconDefaultPath } = { ...defaults, ...config };
  const { root: appRoot } = balerion.dirs.app;
  let faviconPath = faviconDefaultPath;

  /** TODO (v5): Updating the favicon to use a png caused
   *  https://github.com/balerion/balerion/issues/14693
   *
   *  This check ensures backwards compatibility until
   *  the next major version
   */
  if (!existsSync(resolve(appRoot, faviconPath))) {
    faviconPath = 'favicon.ico';
  }

  return koaFavicon(resolve(appRoot, faviconPath), { maxAge });
};
