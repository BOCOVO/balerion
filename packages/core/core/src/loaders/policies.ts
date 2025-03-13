import { join, extname, basename } from 'path';
import fse from 'fs-extra';
import { importDefault } from '@balerion/utils';

import type { Core } from '@balerion/types';

// TODO:: allow folders with index.js inside for bigger policies
export default async function loadPolicies(balerion: Core.Balerion) {
  const dir = balerion.dirs.dist.policies;

  if (!(await fse.pathExists(dir))) {
    return;
  }

  const policies: Record<string, Core.Policy> = {};
  const paths = await fse.readdir(dir, { withFileTypes: true });

  for (const fd of paths) {
    const { name } = fd;
    const fullPath = join(dir, name);

    if (fd.isFile() && extname(name) === '.js') {
      const key = basename(name, '.js');
      policies[key] = importDefault(fullPath);
    }
  }

  balerion.get('policies').add(`global::`, policies);
}
