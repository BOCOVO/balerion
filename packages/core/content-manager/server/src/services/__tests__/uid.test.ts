import uidServiceLoader from '../uid';

describe('Test uid service', () => {
  describe('generateUIDField', () => {
    const baseBalerion = {
      getModel() {
        return this.contentTypes['my-model'];
      },
      documents() {
        return {
          find: async () => [],
          findMany: async () => [],
        };
      },
    } as any;

    test('Uses modelName if no targetField specified or set', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            kind: 'collectionType',
            attributes: {
              slug: {
                type: 'uid',
              },
            },
          },
        },
      } as any;
      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {},
      } as any);

      expect(uid).toBe('my-test-model');
    });

    test('Calls findUniqueUID', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              title: {
                type: 'string',
              },
              slug: {
                type: 'uid',
                targetField: 'title',
              },
            },
          },
        },
      } as any;
      const uidService = uidServiceLoader({ balerion });
      uidService.findUniqueUID = jest.fn(
        (v) =>
          new Promise((resolve) => {
            resolve(v as any);
          })
      );

      await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: 'Test title',
        },
      } as any);

      await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {},
      } as any);

      expect(uidService.findUniqueUID).toHaveBeenCalledTimes(2);
    });

    test('Uses targetField value for generation', async () => {
      const findMany = jest.fn(async () => {
        return [{ slug: 'test-title' }];
      });

      let balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              title: {
                type: 'string',
              },
              slug: {
                type: 'uid',
                targetField: 'title',
              },
            },
          },
        },
        documents() {
          return {
            findMany,
          };
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: 'Test title',
        },
      } as any);

      expect(uid).toBe('test-title-1');

      balerion = {
        ...balerion,
        documents: baseBalerion.documents,
      };

      const uidWithEmptyTarget = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: '',
        },
      } as any);

      expect(uidWithEmptyTarget).toBe('my-test-model');
    });

    test('Uses options for generation', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              title: {
                type: 'string',
              },
              slug: {
                type: 'uid',
                targetField: 'title',
                options: { lowercase: false },
              },
            },
          },
        },
      } as any;
      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: 'Test title',
        },
      } as any);

      expect(uid).toBe('Test-title');
    });

    test('Ignores minLength attribute (should be handle by the user)', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              title: {
                type: 'string',
              },
              slug: {
                type: 'uid',
                targetField: 'title',
                minLength: 100,
              },
            },
          },
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: 'Test UID',
        },
      } as any);

      expect(uid).toBe('test-uid');
    });

    test('Ignores maxLength attribute (should be handled user side)', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              title: {
                type: 'string',
              },
              slug: {
                type: 'uid',
                targetField: 'title',
                maxLength: 10,
              },
            },
          },
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {
          title: 'Test with a 999 very long title',
        },
      } as any);

      expect(uid).toBe('test-with-a-999-very-long-title');
    });

    test('Generates a UID using the default value if necessary', async () => {
      const balerion = {
        ...baseBalerion,
        contentTypes: {
          'my-model': {
            modelName: 'myTestModel',
            attributes: {
              slug: {
                type: 'uid',
                default: 'slug-default',
              },
            },
          },
        },
      } as any;
      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.generateUIDField({
        contentTypeUID: 'my-model',
        field: 'slug',
        data: {},
      } as any);

      expect(uid).toBe('slug-default');
    });
  });

  describe('findUniqueUID', () => {
    const baseBalerion = {
      getModel() {
        return this.contentTypes['my-model'];
      },
      contentTypes: {
        'my-model': {
          modelName: 'myTestModel',
          attributes: {
            slug: {
              type: 'uid',
            },
          },
        },
      },
    } as any;

    test('Finds closest match', async () => {
      const findMany = jest.fn(async () => {
        return [
          { slug: 'my-test-model' },
          { slug: 'my-test-model-1' },
          // it finds the quickest match possible
          { slug: 'my-test-model-4' },
        ];
      });

      const balerion = {
        ...baseBalerion,
        documents() {
          return {
            findMany,
          };
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      const uid = await uidService.findUniqueUID({
        contentTypeUID: 'my-model',
        field: 'slug',
        value: 'my-test-model',
      } as any);

      expect(uid).toBe('my-test-model-2');
    });

    test('Calls db find', async () => {
      const findMany = jest.fn(async () => {
        return [];
      });

      const balerion = {
        ...baseBalerion,
        documents() {
          return {
            findMany,
          };
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      await uidService.findUniqueUID({
        contentTypeUID: 'my-model',
        field: 'slug',
        value: 'my-test-model',
        locale: 'en',
      } as any);

      expect(findMany).toHaveBeenCalledWith({
        filters: {
          slug: { $startsWith: 'my-test-model' },
        },
        locale: 'en',
        status: 'draft',
      });
    });
  });

  describe('CheckUIDAvailability', () => {
    test('Counts the data in db', async () => {
      const count = jest.fn(async () => 0);

      const balerion = {
        getModel() {
          return {
            modelName: 'myTestModel',
            kind: 'collectionType',
            attributes: {
              slug: {
                type: 'uid',
              },
            },
          };
        },
        documents() {
          return {
            count,
          };
        },
      } as any;

      const uidService = uidServiceLoader({ balerion });

      const isAvailable = await uidService.checkUIDAvailability({
        contentTypeUID: 'my-model',
        field: 'slug',
        value: 'my-test-model',
        locale: 'en',
      } as any);

      expect(count).toHaveBeenCalledWith({
        filters: {
          slug: 'my-test-model',
        },
        locale: 'en',
        status: 'draft',
      });
      expect(isAvailable).toBe(true);
    });
  });
});
