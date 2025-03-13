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
    children: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::test.test',
      inversedBy: 'parents',
    },
    parents: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::test.test',
      inversedBy: 'children', // intentionally wrong to validate retro compatibility
    },
  },
};

describe('v4-self-ref-compat', () => {
  beforeAll(async () => {
    await builder.addContentType(testCT).build();

    balerion = await createBalerionInstance();
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  test('2 tables are created', async () => {
    const hasFirstTable = await balerion.db.getConnection().schema.hasTable('tests_children_lnk');
    const hasSecondTable = await balerion.db.getConnection().schema.hasTable('tests_parents_lnk');

    expect(hasFirstTable).toBe(true);
    expect(hasSecondTable).toBe(true);
  });
});
