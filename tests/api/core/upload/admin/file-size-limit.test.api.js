'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash/fp');

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let balerion;
let rq;

const dogModel = {
  displayName: 'Dog',
  singularName: 'dog',
  pluralName: 'dogs',
  kind: 'collectionType',
  attributes: {
    profilePicture: {
      type: 'media',
    },
  },
};

describe('Upload', () => {
  beforeAll(async () => {
    await builder.addContentType(dogModel).build();
    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });

    balerion.config.set('plugin::upload.sizeLimit', 1000);
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  describe('Create', () => {
    test('Rejects when file is bigger than the size limit', async () => {
      // Upload file bigger than 1kb
      const res = await rq({
        method: 'POST',
        url: '/upload',
        formData: { files: fs.createReadStream(path.join(__dirname, '../utils/balerion.png')) },
      });
      expect(res.statusCode).toBe(413);
    });

    test('Can upload a file smaller than the size Limit', async () => {
      // Upload file smaller than 1kb
      const res = await rq({
        method: 'POST',
        url: '/upload',
        formData: { files: fs.createReadStream(path.join(__dirname, '../utils/rec.jpg')) },
      });

      expect(res.statusCode).toBe(201);
    });
  });
});
