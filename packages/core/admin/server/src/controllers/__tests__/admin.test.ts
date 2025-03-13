import adminController from '../admin';

describe('Admin Controller', () => {
  describe('init', () => {
    beforeAll(() => {
      global.balerion = {
        ee: {
          features: {
            isEnabled() {
              return false;
            },
            list() {
              return [];
            },
          },
        },
        config: {
          get: jest.fn(() => 'foo'),
        },
        admin: {
          services: {
            user: {
              exists: jest.fn(() => true),
            },
            'project-settings': {
              getProjectSettings: jest.fn(() => ({ menuLogo: null, authLogo: null })),
            },
          },
        },
      } as any;
    });

    test('Returns the uuid and if the app has admins', async () => {
      const result = await adminController.init();

      expect(global.balerion.config.get).toHaveBeenCalledWith('uuid', false);
      expect(global.balerion.config.get).toHaveBeenCalledWith(
        'packageJsonBalerion.telemetryDisabled',
        null
      );
      expect(global.balerion.service('admin::user').exists).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data).toStrictEqual({
        uuid: 'foo',
        hasAdmin: true,
        menuLogo: null,
        authLogo: null,
      });
    });
  });

  describe('information', () => {
    beforeAll(() => {
      global.balerion = {
        config: {
          get: jest.fn(
            (key: string, value) =>
              ({
                autoReload: undefined,
                'info.balerion': '1.0.0',
                'info.dependencies': {
                  dependency: '1.0.0',
                },
                uuid: 'testuuid',
                environment: 'development',
              })[key] || value
          ),
        },
        EE: true,
      } as any;
    });

    test('Returns application information', async () => {
      const result = await adminController.information();

      expect((global.balerion.config.get as jest.Mock).mock.calls).toEqual([
        ['environment'],
        ['autoReload', false],
        ['info.balerion', null],
        ['info.dependencies', {}],
        ['uuid', null],
      ]);
      expect(result.data).toBeDefined();
      expect(result.data).toMatchObject({
        currentEnvironment: 'development',
        autoReload: false,
        balerionVersion: '1.0.0',
        projectId: 'testuuid',
        dependencies: {
          dependency: '1.0.0',
        },
        nodeVersion: process.version,
        communityEdition: false,
      });
    });
  });
});
