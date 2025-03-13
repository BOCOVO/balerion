import type { Core } from '@balerion/types';

export interface Config {
  poweredBy: string;
}

const defaults: Config = {
  poweredBy: 'Balerion <balerion.io>',
};

export const poweredBy: Core.MiddlewareFactory<Partial<Config>> = (config) => {
  const { poweredBy } = { ...defaults, ...config };

  return async (ctx, next) => {
    await next();

    ctx.set('X-Powered-By', poweredBy);
  };
};
