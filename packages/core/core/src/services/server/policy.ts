import { policy as policyUtils, errors } from '@balerion/utils';
import type { Core } from '@balerion/types';

const createPolicicesMiddleware = (route: Core.Route, balerion: Core.Balerion) => {
  const policiesConfig = route?.config?.policies ?? [];
  const resolvedPolicies = balerion.get('policies').resolve(policiesConfig, route.info);

  const policiesMiddleware: Core.MiddlewareHandler = async (ctx, next) => {
    const context = policyUtils.createPolicyContext('koa', ctx);

    for (const { handler, config } of resolvedPolicies) {
      const result = await handler(context, config, { balerion });

      if (![true, undefined].includes(result)) {
        throw new errors.PolicyError();
      }
    }

    await next();
  };

  return policiesMiddleware;
};

export { createPolicicesMiddleware };
