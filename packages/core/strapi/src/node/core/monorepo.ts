import path from 'path';
import readPkgUp from 'read-pkg-up';

interface BalerionMonorepo {
  path: string;
}

/**
 * Load information about the balerion CMS monorepo (if applicable)
 *
 * @internal
 */
async function loadBalerionMonorepo(cwd: string): Promise<BalerionMonorepo | undefined> {
  let p = cwd;

  while (p !== '/') {
    const readResult = await readPkgUp({ cwd: p });

    if (!readResult) {
      return undefined;
    }

    if (readResult.packageJson.isBalerionMonorepo) {
      return { path: path.dirname(readResult.path) };
    }

    p = path.dirname(path.dirname(readResult.path));
  }

  return undefined;
}

export { loadBalerionMonorepo };
export type { BalerionMonorepo };
