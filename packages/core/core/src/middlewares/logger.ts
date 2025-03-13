import type { Core } from '@balerion/types';

export const logger: Core.MiddlewareFactory = (_, { balerion }) => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);

    balerion.log.http(`${ctx.method} ${ctx.url} (${delta} ms) ${ctx.status}`);
  };
};
