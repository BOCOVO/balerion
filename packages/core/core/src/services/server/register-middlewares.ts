import { yup } from '@balerion/utils';
import type { Core } from '@balerion/types';
import { resolveMiddlewares } from './middleware';

type MiddlewareConfig = (string | { name?: string; resolve?: string; config?: unknown })[];

const defaultConfig = [
  'balerion::logger',
  'balerion::errors',
  'balerion::security',
  'balerion::cors',
  'balerion::poweredBy',
  'balerion::session',
  'balerion::query',
  'balerion::body',
  'balerion::favicon',
  'balerion::public',
];

const requiredMiddlewares = [
  'balerion::errors',
  'balerion::security',
  'balerion::cors',
  'balerion::query',
  'balerion::body',
  'balerion::public',
  'balerion::favicon',
];

const middlewareConfigSchema = yup.array().of(
  yup.lazy((value) => {
    if (typeof value === 'string') {
      return yup.string().required();
    }

    if (typeof value === 'object') {
      return yup
        .object({
          name: yup.string(),
          resolve: yup.string(),
          config: yup.mixed(),
        })
        .required()
        .noUnknown();
    }

    return yup.mixed().test(() => false);
  }) as any // FIXME: yup v1
);

/**
 * Register middlewares in router
 */
const registerApplicationMiddlewares = async (balerion: Core.Balerion) => {
  const middlewareConfig: MiddlewareConfig = balerion.config.get('middlewares', defaultConfig);

  await validateMiddlewareConfig(middlewareConfig);

  const middlewares = await resolveMiddlewares(middlewareConfig, balerion);

  checkRequiredMiddlewares(middlewares);

  // NOTE: exclude middlewares that return nothing.
  // this is used for middlewares that only extend the app only need to be added in certain conditions
  for (const middleware of middlewares) {
    balerion.server.use(middleware.handler);
  }
};

/**
 *
 * @param {MiddlewaresConfig} config
 */
const validateMiddlewareConfig = async (config: MiddlewareConfig) => {
  try {
    await middlewareConfigSchema.validate(config, { strict: true, abortEarly: false });
  } catch (error) {
    throw new Error(
      'Invalid middleware configuration. Expected Array<string|{name?: string, resolve?: string, config: any}.'
    );
  }
};

/**
 * Check if some required middlewares are missing in configure middlewares
 * @param {Middlewares} middlewares
 */
const checkRequiredMiddlewares = (middlewares: { name: string | null }[]) => {
  const missingMiddlewares = requiredMiddlewares.filter((name) => {
    return middlewares.findIndex((mdl) => mdl.name === name) === -1;
  });

  if (missingMiddlewares.length > 0) {
    throw new Error(
      `Missing required middlewares in configuration. Add the following middlewares: "${missingMiddlewares.join(
        ', '
      )}".`
    );
  }
};

export default registerApplicationMiddlewares;
