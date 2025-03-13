import chalk from 'chalk';
import { has } from 'lodash/fp';

// TODO: Remove duplicated code by extracting to a shared package

const assertCwdContainsBalerionProject = (name: string) => {
  const logErrorAndExit = () => {
    console.log(
      `You need to run ${chalk.yellow(
        `balerion ${name}`
      )} in a Balerion project. Make sure you are in the right directory.`
    );
    process.exit(1);
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkgJSON = require(`${process.cwd()}/package.json`);
    if (
      !has('dependencies.@balerion/balerion', pkgJSON) &&
      !has('devDependencies.@balerion/balerion', pkgJSON)
    ) {
      logErrorAndExit();
    }
  } catch (err) {
    logErrorAndExit();
  }
};

const runAction =
  (name: string, action: (...args: any[]) => Promise<unknown>) =>
  (...args: unknown[]) => {
    assertCwdContainsBalerionProject(name);

    Promise.resolve()
      .then(() => {
        return action(...args);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  };

export { runAction };
