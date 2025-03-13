import { join, resolve } from 'path';
import { get } from 'lodash/fp';

import type { Core } from '@balerion/types';
import type { BalerionOptions } from '../Balerion';

export type Options = {
  app: string;
  dist: string;
};

export const getDirs = (
  { appDir, distDir }: BalerionOptions,
  config: { server: Partial<Core.Config.Server> }
): Core.BalerionDirectories => ({
  dist: {
    root: distDir,
    src: join(distDir, 'src'),
    api: join(distDir, 'src', 'api'),
    components: join(distDir, 'src', 'components'),
    extensions: join(distDir, 'src', 'extensions'),
    policies: join(distDir, 'src', 'policies'),
    middlewares: join(distDir, 'src', 'middlewares'),
    config: join(distDir, 'config'),
  },
  app: {
    root: appDir,
    src: join(appDir, 'src'),
    api: join(appDir, 'src', 'api'),
    components: join(appDir, 'src', 'components'),
    extensions: join(appDir, 'src', 'extensions'),
    policies: join(appDir, 'src', 'policies'),
    middlewares: join(appDir, 'src', 'middlewares'),
    config: join(appDir, 'config'),
  },
  static: {
    public: resolve(appDir, get('server.dirs.public', config)),
  },
});
