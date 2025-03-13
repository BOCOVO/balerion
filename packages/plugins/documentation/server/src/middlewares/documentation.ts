import path from 'path';
import koaStatic from 'koa-static';
import swaggerUi from 'swagger-ui-dist';

import type { Core } from '@balerion/types';

export const addDocumentMiddlewares = async ({ balerion }: { balerion: Core.Balerion }) => {
  balerion.server.routes([
    {
      method: 'GET',
      path: '/plugins/documentation/(.*)',
      async handler(ctx, next) {
        ctx.url = path.basename(ctx.url);

        return koaStatic(swaggerUi.getAbsoluteFSPath(), {
          maxage: 86400000,
          defer: true,
        })(ctx, next);
      },
      config: {
        auth: false,
      },
    },
  ]);
};
