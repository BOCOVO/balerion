import { defaultsDeep } from 'lodash/fp';
import koaStatic from 'koa-static';
import type { Core } from '@balerion/types';

type Config = koaStatic.Options;

const defaults = {
  maxAge: 60000,
};

export const publicStatic: Core.MiddlewareFactory = (
  config: Config,
  { balerion }: { balerion: Core.Balerion }
) => {
  const { maxAge } = defaultsDeep(defaults, config);

  balerion.server.routes([
    {
      method: 'GET',
      path: '/',
      handler(ctx) {
        ctx.redirect(balerion.config.get('admin.url', '/admin'));
      },
      config: { auth: false },
    },
    // All other public GET-routes except /uploads/(.*) which is handled in upload middleware
    {
      method: 'GET',
      path: '/((?!uploads/).+)',
      handler: koaStatic(balerion.dirs.static.public, {
        maxage: maxAge,
        defer: true,
      }),
      config: { auth: false },
    },
  ]);
};
