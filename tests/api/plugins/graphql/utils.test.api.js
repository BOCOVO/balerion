'use strict';

// Helpers.
const { createBalerionInstance } = require('api-tests/balerion');
const request = require('supertest');

let balerion;

describe('Test Graphql Utils', () => {
  beforeAll(async () => {
    balerion = await createBalerionInstance();
  });

  afterAll(async () => {
    await balerion.destroy();
  });

  test('Load Graphql playground', async () => {
    const supertestAgent = request.agent(balerion.server.httpServer);
    const res = await supertestAgent.get('/graphql').set('accept', 'text/html');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>Apollo Server</title>');
  });
});
