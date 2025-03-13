import { enable, disable } from '../i18n';

const createDBQueryMock = () => {
  const obj = {
    deleteMany: jest.fn(() => obj),
    updateMany: jest.fn(() => obj),
  } as any;

  return jest.fn(() => obj);
};

describe('i18n - Migration - enable/disable localization on a CT', () => {
  beforeAll(() => {
    global.balerion = {
      db: {},
      plugins: {
        i18n: {
          services: {
            locales: {
              getDefaultLocale: jest.fn(() => 'default-locale'),
            },
            'content-types': {
              isLocalizedContentType: jest.fn(
                (contentType) => contentType?.pluginOptions?.i18n?.localized === true
              ),
            },
          },
        },
      },
      plugin: jest.fn((name) => global.balerion.plugins[name]),
    } as any;
  });

  describe('enable localization on a CT', () => {
    describe('Should not migrate', () => {
      test('non i18n => non i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = {};
        const definition = {};

        await enable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });

        expect(balerion.db.query).not.toHaveBeenCalled();
      });

      test('i18n => non i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = { pluginOptions: { i18n: { localized: true } } };
        const definition = {};

        await enable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });

        expect(balerion.db.query).not.toHaveBeenCalled();
      });

      test('i18n => i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = { pluginOptions: { i18n: { localized: true } } };
        const definition = { pluginOptions: { i18n: { localized: true } } };

        await enable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });

        expect(balerion.db.query).not.toHaveBeenCalled();
      });
    });

    describe('Should migrate', () => {
      test('non i18n => i18n ', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = {};
        const definition = { pluginOptions: { i18n: { localized: true } } };

        await enable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });

        expect(balerion.plugins.i18n.services.locales.getDefaultLocale).toHaveBeenCalled();
        expect(balerion.db.query).toHaveBeenCalled();
      });
    });
  });

  describe('disable localization on a CT', () => {
    describe('Should not migrate', () => {
      test('non i18n => non i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = {};
        const definition = {};

        await disable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });
        expect(balerion.db.query).not.toHaveBeenCalled();
      });

      test('non i18n => i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = {};
        const definition = { pluginOptions: { i18n: { localized: true } } };

        await disable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });
        expect(balerion.db.query).not.toHaveBeenCalled();
      });

      test('i18n => i18n', async () => {
        balerion.db.query = createDBQueryMock();

        const previousDefinition = { pluginOptions: { i18n: { localized: true } } };
        const definition = { pluginOptions: { i18n: { localized: true } } };

        await disable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });
        expect(balerion.db.query).not.toHaveBeenCalled();
      });
    });

    describe('Should migrate', () => {
      test('i18n => non i18n - pg', async () => {
        const previousDefinition = {
          pluginOptions: { i18n: { localized: true } },
        };
        const definition = {};

        await disable({
          oldContentTypes: { test: previousDefinition as any },
          contentTypes: { test: definition as any },
        });

        expect(balerion.plugins.i18n.services.locales.getDefaultLocale).toHaveBeenCalled();
        expect(balerion.db.query).toHaveBeenCalled();
      });
    });
  });
});
