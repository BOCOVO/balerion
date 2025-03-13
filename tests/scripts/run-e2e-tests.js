'use strict';

const path = require('path');
const execa = require('execa');
const fs = require('node:fs/promises');
const yargs = require('yargs');

const chalk = require('chalk');
const dotenv = require('dotenv');
const { cleanTestApp, generateTestApp } = require('../helpers/test-app');
const { createConfig } = require('../../playwright.base.config');

const cwd = path.resolve(__dirname, '../..');
const testAppDirectory = path.join(cwd, 'test-apps', 'e2e');
const testRoot = path.join(cwd, 'tests', 'e2e');
const testDomainRoot = path.join(testRoot, 'tests');
const templateDir = path.join(testRoot, 'app-template');

const pathExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Updates the env file for a generated test app
 * - Removes the PORT key/value from generated app .env
 * - Uses e2e/app-template/config/features.js to enable future features in the generated app
 */
const setupTestEnvironment = async (generatedAppPath) => {
  /**
   * Because we're running multiple test apps at the same time
   * and the env file is generated by the generator with no way
   * to override it, we manually remove the PORT key/value so when
   * we set it further down for each playwright instance it works.
   */
  const pathToEnv = path.join(generatedAppPath, '.env');
  const envFile = (await fs.readFile(pathToEnv)).toString();
  const envWithoutPort = envFile.replace('PORT=1337', '');
  await fs.writeFile(pathToEnv, envWithoutPort);

  /*
   * Enable future features in the generated app manually since a template
   * does not allow the config folder.
   */
  const testRootFeaturesConfigPath = path.join(templateDir, 'config', 'features.js');
  const hasFeaturesConfig = await pathExists(testRootFeaturesConfigPath);

  if (!hasFeaturesConfig) return;

  const configFeatures = await fs.readFile(testRootFeaturesConfigPath);
  const appFeaturesConfigPath = path.join(generatedAppPath, 'config', 'features.js');
  await fs.writeFile(appFeaturesConfigPath, configFeatures);
};

yargs
  .parserConfiguration({
    /**
     * When unknown options is false, using -- to separate playwright args from test:e2e args works
     * When it is true, the script gets confused about additional arguments, with or without using -- to separate commands
     */
    'unknown-options-as-args': false,
  })
  .command({
    command: '*',
    description: 'run the E2E test suite',
    async builder(yarg) {
      const domains = await fs.readdir(testDomainRoot);

      yarg.option('concurrency', {
        alias: 'c',
        type: 'number',
        default: domains.length,
        describe:
          'Number of concurrent test apps to run, a test app runs an entire test suite domain',
      });

      yarg.option('domains', {
        alias: 'd',
        describe: 'Run a specific test suite domain',
        type: 'array',
        choices: domains,
        default: domains,
      });

      yarg.option('setup', {
        alias: 'f',
        describe: 'Force the setup process of the test apps',
        type: 'boolean',
        default: false,
      });
    },
    async handler(argv) {
      try {
        if (await pathExists(path.join(testRoot, '.env'))) {
          // Run tests with the env variables specified in the e2e/.env file
          dotenv.config({ path: path.join(testRoot, '.env') });
        }

        const { concurrency, domains, setup } = argv;

        /**
         * Publishing all packages to the yalc store
         */
        await execa('node', [path.join(__dirname, '../..', 'scripts', 'yalc-publish.js')], {
          stdio: 'inherit',
        });

        /**
         * We don't need to spawn more apps than we have domains,
         * but equally if someone sets the concurrency to 1
         * then we should only spawn one and run every domain on there.
         */
        const testAppsToSpawn = Math.min(domains.length, concurrency);

        if (testAppsToSpawn === 0) {
          throw new Error('No test apps to spawn');
        }

        const testAppPaths = Array.from({ length: testAppsToSpawn }, (_, i) =>
          path.join(testAppDirectory, `test-app-${i}`)
        );

        let currentTestApps = [];

        try {
          currentTestApps = await fs.readdir(testAppDirectory);
        } catch (err) {
          // no test apps exist, okay to fail silently
        }

        /**
         * If we don't have enough test apps, we make enough.
         * You can also force this setup if desired, e.g. you
         * update the app-template.
         */
        if (setup || currentTestApps.length < testAppsToSpawn) {
          /**
           * this will effectively clean the entire directory before hand
           * as opposed to cleaning the ones we aim to spawn.
           */
          await Promise.all(
            currentTestApps.map(async (testAppName) => {
              const appPath = path.join(testAppDirectory, testAppName);
              console.log(`cleaning test app at path: ${chalk.bold(appPath)}`);
              await cleanTestApp(appPath);
            })
          );

          await Promise.all(
            testAppPaths.map(async (appPath) => {
              console.log(`generating test apps at path: ${chalk.bold(appPath)}`);
              await generateTestApp({
                appPath,
                database: {
                  client: 'sqlite',
                  connection: {
                    filename: './.tmp/data.db',
                  },
                  useNullAsDefault: true,
                },
                template: templateDir,
                link: true,
              });

              await setupTestEnvironment(appPath);
            })
          );

          console.log(
            `${chalk.green('Successfully')} setup test apps for the following domains: ${chalk.bold(
              domains.join(', ')
            )}`
          );
        } else {
          console.log(
            `Skipping setting up test apps, use ${chalk.bold('--setup')} to force the setup process`
          );
        }

        /**
         * You can't change the webserver configuration of playwright directly so they'd
         * all be looking at the same test app which we don't want, instead we'll generate
         * a playwright config based off the base one
         */
        const chunkedDomains = domains.reduce((acc, _, i) => {
          if (i % testAppsToSpawn === 0) acc.push(domains.slice(i, i + testAppsToSpawn));
          return acc;
        }, []);

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < chunkedDomains.length; i++) {
          const domains = chunkedDomains[i];

          await Promise.all(
            domains.map(async (domain, j) => {
              const testAppPath = testAppPaths[j];
              const port = 8000 + j;

              const pathToPlaywrightConfig = path.join(testAppPath, 'playwright.config.js');

              console.log(
                `Creating playwright config for domain: ${chalk.blue(
                  domain
                )}, at path: ${chalk.yellow(testAppPath)}`
              );

              const config = createConfig({
                testDir: path.join(testDomainRoot, domain),
                port,
                appDir: testAppPath,
              });

              const configFileTemplate = `
const config = ${JSON.stringify(config)}

module.exports = config
              `;

              await fs.writeFile(pathToPlaywrightConfig, configFileTemplate);

              // Store the filesystem state with git so it can be reset between tests
              // TODO: if we have a large test test suite, it might be worth it to run a `balerion start` and then shutdown here to generate documentation and types only once and save unneccessary server restarts from those files being cleared every time
              console.log('Initializing git');

              const gitUser = ['-c', 'user.name=Balerion CLI', '-c', 'user.email=test@balerion.io'];

              await execa('git', [...gitUser, 'init'], {
                stdio: 'inherit',
                cwd: testAppPath,
              });

              // we need to use -A to track even hidden files like .env; remember we're only using git as a file state manager
              await execa('git', [...gitUser, 'add', '-A', '.'], {
                stdio: 'inherit',
                cwd: testAppPath,
              });

              await execa('git', [...gitUser, 'commit', '-m', 'initial commit'], {
                stdio: 'inherit',
                cwd: testAppPath,
              });

              console.log(`Running ${chalk.blue(domain)} e2e tests`);

              await execa(
                'yarn',
                ['playwright', 'test', '--config', pathToPlaywrightConfig, ...argv._],
                {
                  stdio: 'inherit',
                  cwd,
                  env: {
                    PORT: port,
                    HOST: '127.0.0.1',
                    TEST_APP_PATH: testAppPath,
                    BALERION_DISABLE_EE: !process.env.BALERION_LICENSE,
                  },
                }
              );
            })
          );
        }
      } catch (err) {
        console.error(chalk.red('Error running e2e tests:'));
        /**
         * This is a ExecaError, if we were in TS we could do `instanceof`
         */
        if (err.shortMessage) {
          console.error(err.shortMessage);
          process.exit(1);
        }

        console.error(err);
        process.exit(1);
      }
    },
  })
  .command({
    command: 'clean',
    description: 'clean the test app directory of all test apps',
    async handler() {
      try {
        const currentTestApps = await fs.readdir(testAppDirectory);

        if (currentTestApps.length === 0) {
          console.log('No e2e test apps to clean');
          return;
        }

        await Promise.all(
          currentTestApps.map(async (testAppName) => {
            const appPath = path.join(testAppDirectory, testAppName);
            console.log(`cleaning test app at path: ${chalk.bold(appPath)}`);
            await cleanTestApp(appPath);
          })
        );
      } catch (err) {
        console.error(chalk.red('Error cleaning test apps:'));
        console.error(err);
        process.exit(1);
      }
    },
  })
  .help()
  .parse();
