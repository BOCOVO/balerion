'use strict';

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let balerion;
let rq;

const ct = {
  displayName: 'withboolean',
  singularName: 'withboolean',
  pluralName: 'withbooleans',
  attributes: {
    field: {
      type: 'boolean',
    },
  },
};

describe('Test type boolean', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  test('Create entry with value input JSON', async () => {
    const res = await rq.post('/content-manager/collection-types/api::withboolean.withboolean', {
      body: {
        field: true,
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      field: true,
    });
  });

  test('Throws on invalid boolean value', async () => {
    const res = await rq.post('/content-manager/collection-types/api::withboolean.withboolean', {
      body: { field: 'random' },
    });

    expect(res.statusCode).toBe(400);
  });

  test('Convert integer to boolean value', async () => {
    let res = await rq.post('/content-manager/collection-types/api::withboolean.withboolean', {
      body: { field: 1 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      field: true,
    });

    res = await rq.post('/content-manager/collection-types/api::withboolean.withboolean', {
      body: { field: 0 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      field: false,
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get('/content-manager/collection-types/api::withboolean.withboolean');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    res.body.results.forEach((entry) => {
      expect(entry.field).toEqual(expect.any(Boolean));
    });
  });

  test('Updating entry sets the right value and format', async () => {
    const res = await rq.post('/content-manager/collection-types/api::withboolean.withboolean', {
      body: {
        field: true,
      },
    });

    const updateRes = await rq.put(
      `/content-manager/collection-types/api::withboolean.withboolean/${res.body.data.documentId}`,
      {
        body: {
          field: false,
        },
      }
    );

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      documentId: res.body.data.documentId,
      field: false,
    });
  });
});
