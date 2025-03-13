import path from 'node:path';
import dotenv from 'dotenv';
import { pathExists } from './files';

/**
 * This is the base of _any_ env set for a balerion project,
 * to build a balerion admin panel we require these env variables.
 */
interface DefaultEnv {
  ADMIN_PATH: string;
  BALERION_ADMIN_BACKEND_URL: string;
  BALERION_TELEMETRY_DISABLED: string;
}

/**
 * @internal
 *
 * @description Load the .env file if it exists
 */
const loadEnv = async (cwd: string) => {
  const pathToEnv = path.resolve(cwd, '.env');

  if (await pathExists(pathToEnv)) {
    dotenv.config({ path: pathToEnv });
  }
};

/**
 * @internal
 *
 * @description Get all the environment variables that start with `BALERION_ADMIN_`
 */
const getBalerionAdminEnvVars = (defaultEnv: DefaultEnv): Record<string, string> => {
  return Object.keys(process.env)
    .filter((key) => key.toUpperCase().startsWith('BALERION_ADMIN_'))
    .reduce(
      (acc, key) => {
        acc[key] = process.env[key] as string;

        return acc;
      },
      defaultEnv as unknown as Record<string, string>
    );
};

export { getBalerionAdminEnvVars, loadEnv };
