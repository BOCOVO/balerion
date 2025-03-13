import type { Context, Next } from 'koa';
import utils from '@balerion/utils';
import { isString, get } from 'lodash/fp';
import type { Core } from '@balerion/types';

const { RateLimitError } = utils.errors;

export default (config: any, { balerion }: { balerion: Core.Balerion }) =>
  async (ctx: Context, next: Next) => {
    const pluginConfig = balerion.config.get('plugin::email') as any;
    const rateLimitConfig = {
      enabled: true,
      ...(pluginConfig.ratelimit || {}),
    };

    if (rateLimitConfig.enabled === true) {
      // TODO: TS - Do the dynamic import
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const rateLimit = require('koa2-ratelimit').RateLimit;

      const requestEmail = get('request.body.email')(ctx);
      const userEmail = isString(requestEmail) ? requestEmail.toLowerCase() : 'unknownEmail';

      const loadConfig = {
        interval: { min: 5 },
        max: 5,
        prefixKey: `${userEmail}`,
        handler() {
          throw new RateLimitError();
        },
        ...rateLimitConfig,
        ...config,
      };

      return rateLimit.middleware(loadConfig)(ctx, next);
    }

    return next();
  };
