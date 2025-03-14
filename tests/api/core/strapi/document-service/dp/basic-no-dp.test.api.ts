import type { Core, UID } from '@balerion/types';
import { testInTransaction } from '../../../../utils';

const { createTestBuilder } = require('api-tests/builder');
const { createBalerionInstance } = require('api-tests/balerion');
const { createAuthRequest } = require('api-tests/request');

let balerion: Core.Balerion;
let shopDocuments;
let shopsDB;
let rq;
const builder = createTestBuilder();

const SHOP_UID = 'api::shop.shop' as UID.ContentType;

const shopModel = {
  attributes: {
    name: {
      type: 'string',
    },
  },
  draftAndPublish: false,
  displayName: 'Shop',
  singularName: 'shop',
  pluralName: 'shops',
};

describe('Document Service relations', () => {
  beforeAll(async () => {
    await builder.addContentTypes([shopModel]).build();

    balerion = await createBalerionInstance();
    shopDocuments = balerion.documents(SHOP_UID);
    shopsDB = balerion.db.query(SHOP_UID);
    rq = await createAuthRequest({ balerion });
  });

  afterAll(async () => {
    await balerion.destroy();
    await builder.cleanup();
  });

  describe('Create', () => {
    testInTransaction('Can create', async () => {
      // Create a new shop and check publishedAt value is a date
      const shop = await shopDocuments.create({ data: { name: 'Shop1' } });

      const databaseShops = await shopsDB.findMany({ where: { documentId: shop.documentId } });

      // With DP disabled, publishedAt value should be a date by default
      expect(shop.name).toBe('Shop1');
      expect(shop.publishedAt).toBeISODate();

      // There should only be one shop in DB
      expect(databaseShops.length).toBe(1);
    });

    testInTransaction('Can not set publishedAt to null', async () => {
      // Setting publishedAt to null should be ignored
      const shop = await shopDocuments.create({ data: { name: 'Shop1', publishedAt: null } });
      expect(shop.publishedAt).toBeISODate();
    });
  });

  testInTransaction('Can update', async () => {
    // Update a shop and check publishedAt value is a date
    const shop = await shopDocuments.create({ data: { name: 'Shop1' } });

    const updatedShop = await shopDocuments.update({
      documentId: shop.documentId,
      data: { name: 'Shop2' },
    });

    // Published version should be updated
    expect(updatedShop.name).toBe('Shop2');
    expect(updatedShop.publishedAt).toBeISODate();
  });

  testInTransaction('Can delete', async () => {
    // Delete a shop and check there are no other references in db
    const shop = await shopDocuments.create({ data: { name: 'Shop1' } });

    await shopDocuments.delete({ documentId: shop.documentId });

    // Shop should be deleted
    const databaseShops = await shopsDB.findMany({ where: { documentId: shop.documentId } });
    expect(databaseShops.length).toBe(0);
  });

  testInTransaction('Can find one', async () => {
    // Find a shop and check publishedAt value is a date
    const shop = await shopDocuments.create({ data: { name: 'Shop1' } });

    const foundShop = await shopDocuments.findOne({ documentId: shop.documentId });

    // Published version should be found
    expect(foundShop.name).toBe('Shop1');
  });

  testInTransaction('Can find many', async () => {
    // Find many shops and check publishedAt value is a date
    await shopDocuments.create({ data: { name: 'Shop1' } });
    await shopDocuments.create({ data: { name: 'Shop2' } });

    const foundShops = await shopDocuments.findMany();

    // Published versions should be found
    expect(foundShops.length).toBe(2);
    expect(foundShops[0].name).toBe('Shop1');
    expect(foundShops[1].name).toBe('Shop2');
  });

  testInTransaction('Can not call publication methods', async () => {
    // publish method should not even exist in balerion.documents(uid)
    expect(shopDocuments.publish).toBeUndefined();
    expect(shopDocuments.unpublish).toBeUndefined();
    expect(shopDocuments.discardDraft).toBeUndefined();
  });
});
