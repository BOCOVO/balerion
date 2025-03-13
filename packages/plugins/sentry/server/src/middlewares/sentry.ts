import type { Core } from '@balerion/balerion';
import type Sentry from '@sentry/node';
import type createSentryService from '../services/sentry';

/**
 * Programmatic sentry middleware. We do not want to expose it in the plugin
 */
export default ({ balerion }: { balerion: Core.Balerion }) => {
  const sentryService: ReturnType<typeof createSentryService> = balerion
    .plugin('sentry')
    .service('sentry');
  sentryService.init();
  const sentry = sentryService.getInstance();

  if (!sentry) {
    // initialization failed
    return;
  }

  balerion.server.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (error instanceof Error) {
        sentryService.sendError(error, (scope: Sentry.Scope) => {
          scope.addEventProcessor((event) => {
            // Parse Koa context to add error metadata
            return sentry.Handlers.parseRequest(event, ctx.request as Sentry.Request, {
              // Don't parse the transaction name, we'll do it manually
              transaction: false,
            });
          });

          // Manually add transaction name
          scope.setTag('transaction', `${ctx.method} ${ctx._matchedRoute}`);
          // Manually add Balerion version
          scope.setTag('balerion_version', balerion.config.info.balerion);
          scope.setTag('method', ctx.method);
        });
      }

      throw error;
    }
  });
};
