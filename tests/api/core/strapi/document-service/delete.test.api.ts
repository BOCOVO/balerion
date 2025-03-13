import type { Core } from '@balerion/types';

import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import { testInTransaction } from '../../../utils';
import resources from './resources/index';
import { ARTICLE_UID, findArticleDb, findArticlesDb } from './utils';

describe('Document Service', () => {
  let testUtils;
  let balerion: Core.Balerion;

  beforeAll(async () => {
    testUtils = await createTestSetup(resources);
    balerion = testUtils.balerion;
  });

  afterAll(async () => {
    await destroyTestSetup(testUtils);
  });

  describe('Delete', () => {
    testInTransaction('Can delete an entire document', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });
      await balerion.documents(ARTICLE_UID).delete({ documentId: articleDb.documentId, locale: '*' });

      const articles = await findArticlesDb({ documentId: articleDb.documentId });

      expect(articles).toHaveLength(0);
    });

    testInTransaction('Can delete a document with a component', async (trx: any) => {
      const componentData = {
        comp: {
          text: 'comp-1',
        },
        dz: [
          {
            __component: 'article.dz-comp',
            name: 'dz-comp-1',
          },
        ],
      } as const;

      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });
      // update article
      const updatedArticle = await balerion.documents(ARTICLE_UID).update({
        documentId: articleDb.documentId,
        locale: 'en',
        data: {
          comp: componentData.comp,
          dz: [...componentData.dz],
        },
        populate: ['comp', 'dz'],
      });

      // delete article
      await balerion.documents(ARTICLE_UID).delete({
        documentId: articleDb.documentId,
        locale: 'en',
      });

      // Components should not be in the database anymore
      const compTable = balerion.db.metadata.get('article.comp').tableName;
      const dzTable = balerion.db.metadata.get('article.dz-comp').tableName;

      const comp = await balerion.db
        .getConnection(compTable)
        .where({ id: updatedArticle.comp.id })
        .transacting(trx)
        .first();
      const dz = await balerion.db
        .getConnection(dzTable)
        .where({ id: updatedArticle.dz.at(0)!.id })
        .transacting(trx)
        .first();

      expect(comp).toBeUndefined();
      expect(dz).toBeUndefined();
    });

    testInTransaction('Can delete a single document locale', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-NL' });
      await balerion.documents(ARTICLE_UID).delete({
        documentId: articleDb.documentId,
        locale: 'nl',
      });

      const articles = await findArticlesDb({ documentId: articleDb.documentId });

      expect(articles.length).toBeGreaterThan(0);
      // Should not have dutch locale
      articles.forEach((article) => {
        expect(article.locale).not.toBe('nl');
      });
    });

    testInTransaction('Status is ignored when deleting a document', async () => {
      const articleDb = await findArticleDb({ title: 'Article2-Draft-EN' });
      await balerion.documents(ARTICLE_UID).delete({
        documentId: articleDb.documentId,
        status: 'published',
      });

      const articles = await findArticlesDb({ documentId: articleDb.documentId });

      expect(articles.length).toBe(0);
    });
  });
});
