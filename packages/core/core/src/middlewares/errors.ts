import { errors } from '@balerion/utils';
import type { Core } from '@balerion/types';

import { formatApplicationError, formatHttpError, formatInternalError } from '../services/errors';

const errorMiddleware: Core.MiddlewareFactory = (/* _, { balerion } */) => {
  return async (ctx, next) => {
    try {
      await next();

      if (!ctx.response._explicitStatus) {
        return ctx.notFound();
      }
    } catch (error) {
      if (error instanceof errors.ApplicationError) {
        const { status, body } = formatApplicationError(error);
        ctx.status = status;
        ctx.body = body;
        return;
      }

      if (error instanceof errors.HttpError) {
        const { status, body } = formatHttpError(error);
        ctx.status = status;
        ctx.body = body;
        return;
      }

      balerion.log.error(error);

      const { status, body } = formatInternalError(error);
      ctx.status = status;
      ctx.body = body;
    }
  };
};

export { errorMiddleware as errors };
