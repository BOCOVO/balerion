import { resolve } from 'path';
import { randomUUID } from 'crypto';
import fse from 'fs-extra';
import chalk from 'chalk';
import { createCommand } from 'commander';

import type { BalerionCommand } from '../../types';
import { runAction } from '../../utils/helpers';
import { sendEvent } from '../../utils/telemetry';

type PackageJson = {
  balerion?: {
    uuid?: string;
    telemetryDisabled?: boolean;
  };
};

const readPackageJSON = async (path: string) => {
  try {
    const packageObj = await fse.readJson(path);
    return packageObj;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${chalk.red('Error')}: ${err.message}`);
    } else {
      throw err;
    }
  }
};

const writePackageJSON = async (path: string, file: object, spacing: number) => {
  try {
    await fse.writeJson(path, file, { spaces: spacing });
    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${chalk.red('Error')}: ${err.message}`);
      console.log(
        `${chalk.yellow(
          'Warning'
        )}: There has been an error, please set "telemetryDisabled": false in the "balerion" object of your package.json manually.`
      );

      return false;
    }

    throw err;
  }
};

const generateNewPackageJSON = (packageObj: PackageJson) => {
  if (!packageObj.balerion) {
    return {
      ...packageObj,
      balerion: {
        uuid: randomUUID(),
        telemetryDisabled: false,
      },
    };
  }
  return {
    ...packageObj,
    balerion: {
      ...packageObj.balerion,
      uuid: packageObj.balerion.uuid ? packageObj.balerion.uuid : randomUUID(),
      telemetryDisabled: false,
    },
  };
};

const action = async () => {
  const packageJSONPath = resolve(process.cwd(), 'package.json');
  const exists = await fse.pathExists(packageJSONPath);

  if (!exists) {
    console.log(`${chalk.yellow('Warning')}: could not find package.json`);
    process.exit(0);
  }

  const packageObj = await readPackageJSON(packageJSONPath);

  if (packageObj.balerion && packageObj.balerion.uuid) {
    if (packageObj.balerion.telemetryDisabled === false) {
      console.log(`${chalk.yellow('Warning:')} telemetry is already enabled`);
      process.exit(0);
    }
  }

  const updatedPackageJSON = generateNewPackageJSON(packageObj);

  const write = await writePackageJSON(packageJSONPath, updatedPackageJSON, 2);

  if (!write) {
    process.exit(0);
  }

  await sendEvent('didOptInTelemetry', updatedPackageJSON.balerion.uuid);
  console.log(`${chalk.green('Successfully opted into and enabled Balerion telemetry')}`);
  process.exit(0);
};

/**
 * `$ balerion telemetry:enable`
 */
const command: BalerionCommand = () => {
  return createCommand('telemetry:enable')
    .description('Enable anonymous telemetry and metadata sending to Balerion analytics')
    .action(runAction('telemetry:enable', action));
};

export { action, command };
