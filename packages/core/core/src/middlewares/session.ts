import { isEmpty, isArray } from 'lodash/fp';
import koaSession from 'koa-session';
import type { Core } from '@balerion/types';

const defaultConfig = {
  key: 'koa.sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: undefined,
};

export const session: Core.MiddlewareFactory<Partial<koaSession.opts>> = (
  userConfig,
  { balerion }
) => {
  const { keys } = balerion.server.app;
  if (!isArray(keys) || isEmpty(keys) || keys.some(isEmpty)) {
    throw new Error(
      `App keys are required. Please set app.keys in config/server.js (ex: keys: ['myKeyA', 'myKeyB'])`
    );
  }

  const config: Partial<koaSession.opts> = { ...defaultConfig, ...userConfig };

  balerion.server.use(koaSession(config, balerion.server.app));
};
