'use strict';

// Helpers.
const { createBalerionInstance } = require('api-tests/balerion');
const { createContentAPIRequest } = require('api-tests/request');
const { createTestBuilder } = require('api-tests/builder');

const builder = createTestBuilder();
let balerion;
let rq;
const uid = 'single-type';
const data = {};

const model = {
  kind: 'singleType',
  displayName: 'single-type',
  singularName: 'single-type',
  pluralName: 'single-types',
  attributes: {
    title: {
      type: 'string',
    },
  },
};

describe('Content Manager single types', () => {
  beforeAll(async () => {
    await builder.addContentType(model).build();

    balerion = await createBalerionInstance();

    rq = await createContentAPIRequest({ balerion });
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  test('find single type content returns 404 when not created', async () => {
    const res = await rq({
      url: `/${uid}`,
      method: 'GET',
    });

    expect(res.statusCode).toBe(404);
  });

  test('Create content', async () => {
    const res = await rq({
      url: `/${uid}`,
      method: 'PUT',
      body: {
        data: {
          title: 'Title',
        },
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({
      documentId: expect.anything(),
      title: 'Title',
    });

    expect(res.body.data.publishedAt).toBeISODate();

    data.documentId = res.body.data.documentId;
  });

  test('Update keeps the same data id', async () => {
    const res = await rq({
      url: `/${uid}`,
      method: 'PUT',
      body: {
        data: {
          title: 'Title',
        },
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({
      documentId: data.documentId,
      title: 'Title',
    });
  });

  test('find single type content returns an object ', async () => {
    const res = await rq({
      url: `/${uid}`,
      method: 'GET',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({
      documentId: expect.anything(),
      title: 'Title',
    });
  });

  test('Delete single type content returns an object and makes data unavailable', async () => {
    const res = await rq({
      url: `/${uid}`,
      method: 'DELETE',
    });

    // TODO V5: Discuss if we should return the deleted entry
    // expect(res.statusCode).toBe(200);
    // expect(res.body.data).toMatchObject({
    //   documentId: expect.anything(),
    //   title: 'Title',
    // });

    const getRes = await rq({
      url: `/${uid}`,
      method: 'GET',
    });

    expect(getRes.statusCode).toBe(404);
  });
});
