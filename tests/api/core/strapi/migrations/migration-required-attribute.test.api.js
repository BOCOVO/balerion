'use strict';

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');
const modelsUtils = require('api-tests/models');

const builder = createTestBuilder();
let balerion;
let rq;
const data = {
  dogs: [],
};

const dogModel = {
  attributes: {
    name: {
      type: 'string',
      required: false,
    },
  },
  draftAndPublish: true,
  connection: 'default',
  singularName: 'dog',
  pluralName: 'dogs',
  displayName: 'Dog',
  description: '',
  collectionName: '',
};

const dogs = [
  {
    name: null,
    publishedAt: null,
  },
  {
    name: 'Atos',
    publishedAt: null,
  },
];

const restart = async () => {
  await balerion.destroy();
  balerion = await createBalerionInstance();
  rq = await createAuthRequest({ balerion });
};

describe('Migration - required attribute', () => {
  beforeAll(async () => {
    await builder.addContentType(dogModel).addFixtures(dogModel.singularName, dogs).build();

    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });

    data.dogs = await builder.sanitizedFixturesFor(dogModel.singularName, balerion);
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  describe('Required: false -> true', () => {
    test('Can be null before migration', async () => {
      const { body } = await rq({
        method: 'GET',
        url: '/content-manager/collection-types/api::dog.dog',
      });
      expect(body.results.length).toBe(2);
      const dogWithNameNull = body.results.find((dog) => dog.name === null);
      expect(dogWithNameNull).toBeTruthy();
    });

    test('Cannot publish an entry with null after migration', async () => {
      // remove null values otherwise the migration would fail

      const { body } = await rq({
        method: 'PUT',
        url: `/content-manager/collection-types/api::dog.dog/${data.dogs[0].documentId}`,
        body: { name: 'Nelson' },
      });
      data.dogs[0] = body.data;

      // migration
      const schema = await modelsUtils.getContentTypeSchema(dogModel.singularName, { balerion });
      schema.attributes.name.required = true;

      await modelsUtils.modifyContentType(schema, { balerion });
      await restart();

      // Try to create an entry with null
      const creationRes = await rq({
        method: 'POST',
        url: '/content-manager/collection-types/api::dog.dog',
        body: { name: null },
      });

      const res = await rq({
        method: 'POST',
        url: `/content-manager/collection-types/api::dog.dog/${creationRes.body.data.documentId}/actions/publish`,
      });

      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {
            errors: [
              {
                message: 'name must be a `string` type, but the final value was: `null`.',
                name: 'ValidationError',
                path: ['name'],
              },
            ],
          },
          message: 'name must be a `string` type, but the final value was: `null`.',
          name: 'ValidationError',
          status: 400,
        },
      });
    });
  });

  describe('Required: true -> false', () => {
    test('Can create an entry with null after migration', async () => {
      // migration
      const schema = await modelsUtils.getContentTypeSchema(dogModel.singularName, { balerion });
      schema.attributes.name.required = false;

      await modelsUtils.modifyContentType(schema, { balerion });
      await restart();

      // Try to create an entry with null
      const res = await rq({
        url: `/content-manager/collection-types/api::dog.dog`,
        method: 'POST',
        body: { name: null },
      });

      expect(res.body.data).toMatchObject({ name: null });
      data.dogs.push(res.body.data);
    });
  });
});
