'use strict';

const merge = require('lodash/merge');

// Helpers.
const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const form = require('api-tests/generators');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let balerion;
let rq;

const restart = async () => {
  await balerion.destroy();
  balerion = await createBalerionInstance();
  rq = await createAuthRequest({ balerion });
};

const FIXTURE_DEFAULT_LAYOUT = [
  [
    {
      name: 'title',
      size: 6,
    },
    {
      name: 'date',
      size: 4,
    },
  ],
  [
    {
      name: 'jsonField',
      size: 12,
    },
  ],
  [
    {
      name: 'content',
      size: 12,
    },
  ],
  [
    {
      name: 'author',
      size: 6,
    },
  ],
];

describe('Content Manager - Update Layout', () => {
  beforeAll(async () => {
    await builder.addContentTypes([form.article]).build();

    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  test('Fetch default layout', async () => {
    const { body } = await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'GET',
    });

    expect(body.data.contentType.layouts.edit).toStrictEqual(FIXTURE_DEFAULT_LAYOUT);
  });

  test('Update field size', async () => {
    const transformation = [
      [
        {
          name: 'title',
          size: 8,
        },

        {
          name: 'date',
          size: 4,
        },
      ],
    ];
    const payload = merge([], FIXTURE_DEFAULT_LAYOUT, transformation);

    await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'PUT',
      body: {
        layouts: {
          edit: payload,
          list: [],
        },
      },
    });

    const { body } = await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'GET',
    });

    const expectation = merge([], FIXTURE_DEFAULT_LAYOUT, transformation);

    expect(body.data.contentType.layouts.edit).toStrictEqual(expectation);
  });

  test('Update field size with server restart and invalid JSON size', async () => {
    const transformation = [
      [
        {
          name: 'title',
          size: 8,
        },

        {
          name: 'date',
          size: 4,
        },
      ],

      [
        {
          name: 'jsonField',
          size: 6,
        },
      ],
    ];
    const payload = merge([], FIXTURE_DEFAULT_LAYOUT, transformation);

    await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'PUT',
      body: {
        layouts: {
          edit: payload,
          list: [],
        },
      },
    });

    await restart();

    const { body } = await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'GET',
    });

    const expectation = [
      [
        {
          name: 'title',
          size: 8,
        },

        {
          name: 'date',
          size: 4,
        },
      ],

      [
        {
          name: 'content',
          size: 12,
        },
      ],
      [
        {
          name: 'author',
          size: 6,
        },
      ],

      [
        {
          name: 'jsonField',
          size: 12,
        },
      ],
    ];

    expect(body.data.contentType.layouts.edit).toStrictEqual(expectation);
  });

  test('Update field size with server restart and invalid date size', async () => {
    const transformation = [
      [
        {
          name: 'title',
          size: 12,
        },

        {
          name: 'date',
          size: 14,
        },
      ],
    ];
    const payload = merge([], FIXTURE_DEFAULT_LAYOUT, transformation);

    await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'PUT',
      body: {
        layouts: {
          edit: payload,
          list: [],
        },
      },
    });

    await restart();

    const { body } = await rq({
      url: '/content-manager/content-types/api::article.article/configuration',
      method: 'GET',
    });

    const expectation = [
      [
        {
          name: 'title',
          size: 12,
        },
      ],
      [
        {
          name: 'jsonField',
          size: 12,
        },
      ],
      [
        {
          name: 'content',
          size: 12,
        },
      ],

      [
        {
          name: 'author',
          size: 6,
        },
        {
          name: 'date',
          size: 4,
        },
      ],
    ];

    expect(body.data.contentType.layouts.edit).toStrictEqual(expectation);
  });
});
