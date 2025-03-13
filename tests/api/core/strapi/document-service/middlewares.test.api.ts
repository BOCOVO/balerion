import type { Core } from '@balerion/types';

import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import resources from './resources/index';
import { ARTICLE_UID } from './utils';

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

  describe('Middlewares', () => {
    it('Add filters', async () => {
      balerion.documents.use((ctx, next) => {
        if (ctx.action === 'findMany') {
          ctx.params.filters = { title: 'Article1-Draft-EN' };
        }

        return next();
      });

      const articles = await balerion.documents('api::article.article').findMany();

      expect(articles).toHaveLength(1);
    });
  });
});
