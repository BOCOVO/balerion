'use strict';

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let balerion;
let rq;

const ct = {
  displayName: 'withdecimal',
  singularName: 'withdecimal',
  pluralName: 'withdecimals',
  attributes: {
    field: {
      type: 'decimal',
    },
  },
};

describe('Test type decimal', () => {
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
    const inputValue = 12.31;
    const res = await rq.post('/content-manager/collection-types/api::withdecimal.withdecimal', {
      body: {
        field: inputValue,
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      field: inputValue,
    });
  });

  test('Create entry with integer should convert to decimal', async () => {
    const inputValue = 1821;
    const res = await rq.post('/content-manager/collection-types/api::withdecimal.withdecimal', {
      body: {
        field: inputValue,
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      field: 1821.0,
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get('/content-manager/collection-types/api::withdecimal.withdecimal');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    res.body.results.forEach((entry) => {
      expect(entry.field).toEqual(expect.any(Number));
    });
  });

  test('Updating entry sets the right value and format', async () => {
    const res = await rq.post('/content-manager/collection-types/api::withdecimal.withdecimal', {
      body: {
        field: 11.2,
      },
    });

    const updateRes = await rq.put(
      `/content-manager/collection-types/api::withdecimal.withdecimal/${res.body.data.documentId}`,
      {
        body: {
          field: 14,
        },
      }
    );

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      documentId: res.body.data.documentId,
      field: 14.0,
    });
  });
});
