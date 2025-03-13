import { join, extname, basename } from 'path';
import fse from 'fs-extra';
import { importDefault } from '@balerion/utils';
import type { Core } from '@balerion/types';
import { middlewares as internalMiddlewares } from '../middlewares';

// TODO:: allow folders with index.js inside for bigger policies
export default async function loadMiddlewares(balerion: Core.Balerion) {
  const localMiddlewares = await loadLocalMiddlewares(balerion);

  balerion.get('middlewares').add(`global::`, localMiddlewares);
  balerion.get('middlewares').add(`balerion::`, internalMiddlewares);
}

const loadLocalMiddlewares = async (balerion: Core.Balerion) => {
  const dir = balerion.dirs.dist.middlewares;

  if (!(await fse.pathExists(dir))) {
    return {};
  }

  const middlewares: Record<string, Core.MiddlewareFactory> = {};
  const paths = await fse.readdir(dir, { withFileTypes: true });

  for (const fd of paths) {
    const { name } = fd;
    const fullPath = join(dir, name);

    if (fd.isFile() && extname(name) === '.js') {
      const key = basename(name, '.js');
      middlewares[key] = importDefault(fullPath);
    }
  }

  return middlewares;
};
