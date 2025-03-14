'use strict';

const coffee = require('coffee');
const semver = require('semver');
const assert = require('assert');

const utils = require('../../../utils');

describe('--version', () => {
  let appPath;

  beforeAll(async () => {
    const testApps = utils.instances.getTestApps();

    appPath = testApps.at(0);
  });

  // TODO: check that it matches the version listed in the test app package.json
  it('should output version with argument', async () => {
    const { stdout } = await coffee
      .spawn('npm', ['run', '-s', 'balerion', '--', 'version'], { cwd: appPath })
      .expect('code', 0)
      .end();

    const version = stdout.trim();
    assert.ok(semver.valid(version), `Version ${version} is not a valid semver`);
  });

  it('should output version with --version', async () => {
    const { stdout } = await coffee
      .spawn('npm', ['run', '-s', 'balerion', '--', '--version'], { cwd: appPath })
      .expect('code', 0)
      .end();

    const version = stdout.trim();
    assert.ok(semver.valid(version), `Version ${version} is not a valid semver`);
  });
});
