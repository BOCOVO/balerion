import type { Core } from '@balerion/types';
import { errors } from '@balerion/utils';

import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import resources from './resources/index';
import { ARTICLE_UID, findArticleDb, AUTHOR_UID, findAuthorDb } from './utils';

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

  describe('FindOne', () => {
    it('find one document returns defaults', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });

      const article = await balerion
        .documents(ARTICLE_UID)
        .findOne({ documentId: articleDb.documentId });

      expect(article).toMatchObject(articleDb);
    });

    it('find one document in english', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });

      const article = await balerion
        .documents(ARTICLE_UID)
        .findOne({ documentId: articleDb.documentId, locale: 'en' });

      expect(article).toMatchObject(articleDb);
    });

    it('unable to findOne on multiple locales', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });

      await expect(
        balerion.documents(ARTICLE_UID).findOne({
          documentId: articleDb.documentId,
          // @ts-expect-error locale should be a string
          locale: ['en', 'fr'],
        })
      ).rejects.toThrowError(
        new errors.ValidationError(
          `Invalid locale param en,fr provided. Document locales must be strings.`
        )
      );
    });

    it('find one published document', async () => {
      const articleDb = await findArticleDb({ title: 'Article2-Published-EN' });

      const article = await balerion
        .documents(ARTICLE_UID)
        .findOne({ documentId: articleDb.documentId, status: 'published' });

      expect(article).toMatchObject(articleDb);
    });

    it('find one draft document', async () => {
      const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });

      const article = await balerion
        .documents(ARTICLE_UID)
        .findOne({ documentId: articleDb.documentId, status: 'draft' });

      expect(article).toMatchObject(articleDb);
    });

    it('ignores locale parameter on non-localized content type', async () => {
      const authorDb = await findAuthorDb({ name: 'Author1-Draft' });

      // Locale should be ignored on non-localized content types
      const author = await balerion
        .documents(AUTHOR_UID)
        .findOne({ documentId: authorDb.documentId, locale: 'en' });

      expect(author).toMatchObject(authorDb);
    });
  });
});
