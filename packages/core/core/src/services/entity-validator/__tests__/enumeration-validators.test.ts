import balerionUtils, { errors } from '@balerion/utils';
import type { Schema } from '@balerion/types';
import { Validators } from '../validators';

describe('Enumeration validator', () => {
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
      attrEnumUnique: { type: 'float', unique: true },
    },
  };

  describe('oneOf', () => {
    test('it fails the validation if the value is not part of the allowed values', async () => {
      expect.assertions(1);

      const validator = balerionUtils.validateYupSchema(
        Validators.enumeration({
          attr: { type: 'enumeration', enum: ['balerion', 'headless'] },
          model: fakeModel,
          updatedAttribute: { name: 'attrFloatUnique', value: 1 },
          entity: null,
        })
      );

      try {
        await validator('invalid-vlue');
      } catch (err) {
        expect(err).toBeInstanceOf(errors.YupValidationError);
      }
    });

    test('it validates the value if it is part of the allowed values', async () => {
      const validator = balerionUtils.validateYupSchema(
        Validators.enumeration({
          attr: { type: 'enumeration', enum: ['balerion', 'headless'] },
          model: fakeModel,
          updatedAttribute: { name: 'attrEnumUnique', value: 1 },
          entity: null,
        })
      );

      expect(await validator('balerion')).toBe('balerion');
    });
  });
});
