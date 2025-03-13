'use strict';

// Test an API with all the possible filed types and simple filterings (no deep filtering, no relations)
const { createBalerionInstance } = require('api-tests/balerion');
const { createTestBuilder } = require('api-tests/builder');

const builder = createTestBuilder();
let balerion;

const testCT = {
  displayName: 'test',
  singularName: 'test',
  pluralName: 'tests',
  kind: 'collectionType',
  attributes: {
    name: {
      type: 'string',
    },
  },
};

const fixtures = {
  test: [
    {
      name: 'Hugo LLORIS',
    },
    {
      name: 'Samuel UMTITI',
    },
    {
      name: 'Lucas HERNANDEZ',
    },
  ],
};

describe('Deep Filtering API', () => {
  beforeAll(async () => {
    await builder.addContentType(testCT).build();

    balerion = await createBalerionInstance();
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  test('Return an array of ids on createMany', async () => {
    const res = await balerion.db.query('api::test.test').createMany({ data: fixtures.test });

    expect(res).toMatchObject({ count: expect.any(Number) });
    expect(Array.isArray(res.ids)).toBe(true);
    expect(res.ids.length > 0).toBe(true);
  });
});
