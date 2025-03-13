'use strict';

const { createBalerionInstance } = require('api-tests/balerion');
const { isKnexQuery } = require('@balerion/database');

let balerion;

describe('knex', () => {
  beforeAll(async () => {
    balerion = await createBalerionInstance();
  });

  afterAll(async () => {
    await balerion.destroy();
  });

  describe('isKnexQuery', () => {
    test('knex query: true', () => {
      const res = isKnexQuery(balerion.db.connection('balerion_core_store_settings'));
      expect(res).toBe(true);
    });

    test('knex raw: true', () => {
      const res = isKnexQuery(balerion.db.connection.raw('SELECT * FROM balerion_core_store_settings'));
      expect(res).toBe(true);
    });

    test.each([[''], [{}], [[]], [2], [new Date()]])('%s: false', (value) => {
      const res = isKnexQuery(value);
      expect(res).toBe(false);
    });
  });
});
