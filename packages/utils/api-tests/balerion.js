'use strict';

const path = require('path');
const _ = require('lodash');
const dotenv = require('dotenv');
const { createBalerion } = require('../../core/balerion');
const { createUtils } = require('./utils');

const superAdminCredentials = {
  email: 'admin@balerion.io',
  firstname: 'admin',
  lastname: 'admin',
  password: 'Password123',
};

const superAdminLoginInfo = _.pick(superAdminCredentials, ['email', 'password']);

const createBalerionInstance = async ({
  ensureSuperAdmin = true,
  logLevel = 'warn',
  bypassAuth = true,
  bootstrap,
} = {}) => {
  // read .env file as it could have been updated
  dotenv.config({ path: process.env.ENV_PATH });

  const baseDir = path.dirname(process.env.ENV_PATH);

  const options = {
    appDir: baseDir,
    distDir: baseDir,
  };
  const instance = createBalerion(options);

  if (bypassAuth) {
    instance.get('auth').register('content-api', {
      name: 'test-auth',
      authenticate() {
        return { authenticated: true };
      },
      verify() {},
    });
  }

  if (bootstrap) {
    const modules = instance.get('modules');
    const originalBootstrap = modules.bootstrap;
    // decorate modules bootstrap
    modules.bootstrap = async () => {
      await originalBootstrap();
      await bootstrap({ balerion: instance });
    };
  }

  await instance.load();

  instance.log.level = logLevel;

  await instance.server.listen();

  const utils = createUtils(instance);

  if (ensureSuperAdmin) {
    await utils.createUserIfNotExists(superAdminCredentials);
  }

  return instance;
};

module.exports = {
  createBalerionInstance,
  superAdmin: {
    loginInfo: superAdminLoginInfo,
    credentials: superAdminCredentials,
  },
};
