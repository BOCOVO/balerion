import type { Utils } from '@balerion/types';
import createEntityService from '../index';

jest.mock('bcryptjs', () => ({ hashSync: () => 'secret-password' }));

describe('Entity service', () => {
  global.balerion = {
    getModel: jest.fn(() => ({})),
    config: {
      get() {
        return [];
      },
    },
    query: jest.fn(() => ({})),
    webhookStore: {
      allowedEvents: new Map([['ENTRY_CREATE', 'entry.create']]),
      addAllowedEvent: jest.fn(),
    },
  } as any;

  describe('Decorator', () => {
    test.each(['create', 'update', 'findMany', 'findOne', 'delete', 'count'] as const)(
      'Can decorate',
      async (method) => {
        const instance = createEntityService({
          balerion: global.balerion,
          db: {} as any,
        });

        const methodFn = jest.fn();

        instance.decorate((old) => ({
          ...old,
          [method]: methodFn,
        }));

        const args = [{}, {}];
        await (instance[method] as Utils.Function.Any)(...args);
        expect(methodFn).toHaveBeenCalled();
      }
    );
  });

  describe('Find', () => {
    test('Returns first element for single types', async () => {
      const data = {
        id: 1,
        title: 'Test',
      };

      const fakeDocumentService = {
        findFirst: jest.fn(() => Promise.resolve(data)),
      };

      const fakeBalerion = {
        ...global.balerion,
        documents: jest.fn(() => fakeDocumentService),
        getModel: jest.fn(() => {
          return { kind: 'singleType' };
        }),
      };

      const instance = createEntityService({
        balerion: fakeBalerion as any,
        db: {} as any,
      });

      const result = await instance.findMany('api::test.test-model');

      expect(fakeBalerion.getModel).toHaveBeenCalledTimes(1);
      expect(fakeBalerion.getModel).toHaveBeenCalledWith('api::test.test-model');

      expect(fakeBalerion.documents).toHaveBeenCalledWith('api::test.test-model');
      expect(fakeDocumentService.findFirst).toHaveBeenCalledWith({});
      expect(result).toEqual(data);
    });
  });
});
