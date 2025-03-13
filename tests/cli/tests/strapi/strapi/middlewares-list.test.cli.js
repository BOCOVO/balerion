'use strict';

const coffee = require('coffee');

const utils = require('../../../utils');

describe('middlewares:list', () => {
  let appPath;

  beforeAll(async () => {
    const testApps = utils.instances.getTestApps();

    appPath = testApps.at(0);
  });

  it('should output list of policies', async () => {
    const { stdout } = await coffee
      .spawn('npm', ['run', '-s', 'balerion', 'middlewares:list'], { cwd: appPath })
      .expect('code', 0)
      .end();

    const output = stdout.trim();

    const expected = `
    ┌─────────────────────────────────────┐
    │ Name                                │
    ├─────────────────────────────────────┤
    │ admin::rateLimit                    │
    ├─────────────────────────────────────┤
    │ admin::data-transfer                │
    ├─────────────────────────────────────┤
    │ balerion::compression                 │
    ├─────────────────────────────────────┤
    │ balerion::cors                        │
    ├─────────────────────────────────────┤
    │ balerion::errors                      │
    ├─────────────────────────────────────┤
    │ balerion::favicon                     │
    ├─────────────────────────────────────┤
    │ balerion::ip                          │
    ├─────────────────────────────────────┤
    │ balerion::logger                      │
    ├─────────────────────────────────────┤
    │ balerion::poweredBy                   │
    ├─────────────────────────────────────┤
    │ balerion::body                        │
    ├─────────────────────────────────────┤
    │ balerion::query                       │
    ├─────────────────────────────────────┤
    │ balerion::responseTime                │
    ├─────────────────────────────────────┤
    │ balerion::responses                   │
    ├─────────────────────────────────────┤
    │ balerion::security                    │
    ├─────────────────────────────────────┤
    │ balerion::session                     │
    ├─────────────────────────────────────┤
    │ balerion::public                      │
    ├─────────────────────────────────────┤
    │ plugin::users-permissions.rateLimit │
    └─────────────────────────────────────┘
    `;

    utils.helpers.expectConsoleLinesToInclude(output, expected);
  });
});
