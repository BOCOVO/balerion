'use strict';

const coffee = require('coffee');

const utils = require('../../../utils');

describe('hooks:list', () => {
  let appPath;

  beforeAll(async () => {
    const testApps = utils.instances.getTestApps();

    appPath = testApps.at(0);
  });

  it('should output list of hooks', async () => {
    const { stdout } = await coffee
      .spawn('npm', ['run', '-s', 'balerion', 'hooks:list'], { cwd: appPath })
      .expect('code', 0)
      .end();

    const output = stdout.trim();

    const expected = `
    ┌──────────────────────────────────┐
    │ Name                             │
    ├──────────────────────────────────┤
    │ balerion::content-types.beforeSync │
    ├──────────────────────────────────┤
    │ balerion::content-types.afterSync  │
    └──────────────────────────────────┘
    `;

    utils.helpers.expectConsoleLinesToInclude(output, expected);
  });
});
