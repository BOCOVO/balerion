import balerionUtils, { errors } from '@balerion/utils';
import type { Schema } from '@balerion/types';
import { Validators } from '../validators';
import { mockOptions } from './utils';

describe('Integer validator', () => {
  const fakeModel: Schema.ContentType = {
    modelType: 'contentType',
    kind: 'collectionType',
    modelName: 'test-model',
    globalId: 'test-model',
    uid: 'api::test.test-uid',
    info: {
      displayName: 'Test model',
      singularName: 'test-model',
      pluralName: 'test-models',
    },
    options: {},
    attributes: {
      attrIntegerUnique: { type: 'integer', unique: true },
    },
  };

  describe('unique', () => {
    const fakeFindOne = jest.fn();

    global.balerion = {
      db: {
        query: () => ({
          findOne: fakeFindOne,
        }),
      },
    } as any;

    afterEach(() => {
      jest.clearAllMocks();
      fakeFindOne.mockReset();
    });

    describe('draft', () => {
      const options = { ...mockOptions, isDraft: true };

      test('it does not validate unique constraints', async () => {
        fakeFindOne.mockResolvedValueOnce({ attrIntegerUnique: 2 });

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 2 },
              entity: null,
            },
            options
          )
        );

        expect(await validator(2)).toBe(2);
      });
    });

    describe('published', () => {
      const options = { ...mockOptions, isDraft: false };

      test('it does not validates the unique constraint if the attribute is not set as unique', async () => {
        fakeFindOne.mockResolvedValueOnce(null);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer' },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 1 },
              entity: null,
            },
            options
          )
        );

        await validator(1);

        expect(fakeFindOne).not.toHaveBeenCalled();
      });

      test('it does not validates the unique constraint if the attribute value is `null`', async () => {
        fakeFindOne.mockResolvedValueOnce(null);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: null },
              entity: null,
            },
            options
          ).nullable()
        );

        await validator(null);

        expect(fakeFindOne).not.toHaveBeenCalled();
      });

      test('it validates the unique constraint if there is no other record in the database', async () => {
        fakeFindOne.mockResolvedValueOnce(null);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 2 },
              entity: null,
            },
            options
          )
        );

        expect(await validator(1)).toBe(1);
      });

      test('it fails the validation of the unique constraint if the database contains a record with the same attribute value', async () => {
        expect.assertions(1);
        fakeFindOne.mockResolvedValueOnce({ attrIntegerUnique: 2 });

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 2 },
              entity: null,
            },
            options
          )
        );

        try {
          await validator(2);
        } catch (err) {
          expect(err).toBeInstanceOf(errors.YupValidationError);
        }
      });

      test('it checks the database for records with the same value for the checked attribute', async () => {
        fakeFindOne.mockResolvedValueOnce(null);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 4 },
              entity: null,
            },
            options
          )
        );

        await validator(4);

        expect(fakeFindOne).toHaveBeenCalledWith({
          where: {
            locale: 'en',
            publishedAt: { $notNull: true },
            attrIntegerUnique: 4,
          },
          select: ['id'],
        });
      });

      test('it checks the database for records with the same value but not the same id for the checked attribute if an entity is passed', async () => {
        fakeFindOne.mockResolvedValueOnce(null);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        await validator(5);

        expect(fakeFindOne).toHaveBeenCalledWith({
          where: {
            attrIntegerUnique: 5,
            id: {
              $ne: 1,
            },
            locale: 'en',
            publishedAt: { $notNull: true },
          },
          select: ['id'],
        });
      });
    });
  });

  describe('min', () => {
    describe('draft', () => {
      const options = { ...mockOptions, isDraft: true };

      test('it does not fail if the integer is lower than the defined min', async () => {
        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', min: 3 },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        await validator(1);
      });
    });

    describe('published', () => {
      const options = { ...mockOptions, isDraft: false };

      test('it fails the validation if the integer is lower than the define min', async () => {
        expect.assertions(1);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', min: 3 },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        try {
          await validator(1);
        } catch (err) {
          expect(err).toBeInstanceOf(errors.YupValidationError);
        }
      });

      test('it validates the min constraint if the integer is higher than the define min', async () => {
        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', min: 3 },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        expect(await validator(4)).toBe(4);
      });
    });
  });

  describe.each([{ isDraft: true }, { isDraft: false }])(
    `max - $isDraft`,
    ({ isDraft }: { isDraft: boolean }) => {
      const options = { ...mockOptions, isDraft };

      test('it fails the validation if the number is integer than the define max', async () => {
        expect.assertions(1);

        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', max: 3 },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        try {
          await validator(4);
        } catch (err) {
          expect(err).toBeInstanceOf(errors.YupValidationError);
        }
      });

      test('it validates the max constraint if the integer is lower than the define max', async () => {
        const validator = balerionUtils.validateYupSchema(
          Validators.integer(
            {
              attr: { type: 'integer', max: 3 },
              model: fakeModel,
              updatedAttribute: { name: 'attrIntegerUnique', value: 5 },
              entity: { id: 1, attrIntegerUnique: 42 },
            },
            options
          )
        );

        expect(await validator(2)).toBe(2);
      });
    }
  );
});
