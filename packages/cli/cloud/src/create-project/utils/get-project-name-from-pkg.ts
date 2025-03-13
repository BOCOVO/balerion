import { CLIContext } from '../../types';
import { PackageJson, loadPkg } from '../../utils/pkg';

export async function getProjectNameFromPackageJson(ctx: CLIContext): Promise<string> {
  try {
    const packageJson = (await loadPkg(ctx)) as PackageJson;
    return packageJson.name || 'my-balerion-project';
  } catch (e) {
    return 'my-balerion-project';
  }
}
