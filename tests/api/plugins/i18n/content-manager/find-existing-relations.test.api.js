'use strict';

const { pick } = require('lodash/fp');

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

let balerion;
let rq;
const data = {
  products: [],
  shops: [],
};

const productModel = {
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
    },
  },
  draftAndPublish: false,
  displayName: 'Product',
  singularName: 'product',
  pluralName: 'products',
  description: '',
  collectionName: '',
};

const shopModel = {
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
    },
    products: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::product.product',
      targetAttribute: 'shops',
    },
  },
  draftAndPublish: false,
  displayName: 'Shop',
  singularName: 'shop',
  pluralName: 'shops',
};

const shops = [
  {
    name: 'mercato',
    locale: 'it',
  },
  {
    name: 'market',
    locale: 'en',
  },
];

const products = ({ shop: shops }) => {
  const entries = [
    {
      name: 'pomodoro',
      shops: [shops[0].id],
      locale: 'it',
    },
    {
      name: 'apple',
      shops: [shops[1].id],
      locale: 'en',
    },
  ];

  return entries;
};

describe('i18n - Find existing relations', () => {
  const builder = createTestBuilder();

  beforeAll(async () => {
    await builder
      .addContentTypes([productModel, shopModel])
      .addFixtures('plugin::i18n.locale', [
        {
          name: 'It',
          code: 'it',
        },
      ])
      .addFixtures(shopModel.singularName, shops)
      .addFixtures(productModel.singularName, products)
      .build();

    balerion = await createBalerionInstance();
    rq = await createAuthRequest({ balerion });

    data.shops = await builder.sanitizedFixturesFor(shopModel.singularName, balerion);
    data.products = await builder.sanitizedFixturesFor(productModel.singularName, balerion);
  });

  afterAll(async () => {
    // Delete all locales that have been created
    await balerion.db.query('plugin::i18n.locale').deleteMany({ code: { $ne: 'en' } });

    await balerion.destroy();
    await builder.cleanup();
  });

  test('Get Italian product for italian shop filter on any locale', async () => {
    const res = await rq({
      method: 'GET',
      url: `/content-manager/relations/api::shop.shop/${data.shops[0].documentId}/products`,
      qs: {
        locale: 'it',
        status: 'published',
      },
    });

    const { id, documentId, name, publishedAt, updatedAt, locale } = data.products[0];
    const expectedObj = {
      documentId,
      id,
      name,
      locale,
      publishedAt,
      updatedAt,
    };

    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toStrictEqual(expectedObj);
  });

  test('Get english product for english shop', async () => {
    const res = await rq({
      method: 'GET',
      url: `/content-manager/relations/api::shop.shop/${data.shops[1].documentId}/products`,
      qs: {
        locale: 'en',
        status: 'published',
      },
    });

    const { id, documentId, name, publishedAt, updatedAt, locale } = data.products[1];
    const expectedObj = {
      documentId,
      id,
      name,
      locale,
      publishedAt,
      updatedAt,
    };

    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toStrictEqual(expectedObj);
  });
});
