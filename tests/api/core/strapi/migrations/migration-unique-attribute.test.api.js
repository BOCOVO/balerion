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
      unique: false,
    },
  },
  connection: 'default',
  singularName: 'dog',
  pluralName: 'dogs',
  displayName: 'Dog',
  description: '',
  collectionName: '',
};

const dogs = [
  {
    name: 'Atos',
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

describe('Migration - unique attribute', () => {
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

  describe('Unique: false -> true', () => {
    test('Can have duplicates before migration', async () => {
      const { body } = await rq({
        url: '/content-manager/collection-types/api::dog.dog',
        method: 'GET',
      });
      expect(body.results.length).toBe(2);
      expect(body.results[0].name).toEqual(body.results[1].name);
    });

    test('Cannot create a duplicated entry after migration', async () => {
      // remove duplicated values otherwise the migration would fail
      const { body } = await rq({
        url: `/content-manager/collection-types/api::dog.dog/${data.dogs[0].documentId}`,
        method: 'PUT',
        body: { name: 'Nelson' },
      });
      data.dogs[0] = body.data;

      // migration
      const schema = await modelsUtils.getContentTypeSchema(dogModel.singularName, { balerion });
      schema.attributes.name.unique = true;
      await modelsUtils.modifyContentType(schema, { balerion });

      await restart();

      // Try to create a duplicated entry
      const res = await rq({
        method: 'POST',
        url: '/content-manager/collection-types/api::dog.dog',
        body: { name: data.dogs[0].name },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Unique: true -> false', () => {
    test('Can create a duplicated entry after migration', async () => {
      // migration
      const schema = await modelsUtils.getContentTypeSchema(dogModel.singularName, { balerion });
      schema.attributes.name.unique = false;
      await modelsUtils.modifyContentType(schema, { balerion });

      await restart();

      // Try to create a duplicated entry
      const res = await rq({
        url: `/content-manager/collection-types/api::dog.dog`,
        method: 'POST',
        body: { name: data.dogs[0].name },
      });

      expect(res.body.data).toMatchObject({ name: data.dogs[0].name });
    });
  });
});
