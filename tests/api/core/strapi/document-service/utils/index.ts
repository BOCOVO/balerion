import type { Schema, Data } from '@balerion/balerion';

export const AUTHOR_UID = 'api::author.author' as const;
export type Author = Data.ContentType<typeof AUTHOR_UID>;

export const ARTICLE_UID = 'api::article.article' as const;
export type Article = Data.ContentType<typeof ARTICLE_UID>;

export const CATEGORY_UID = 'api::category.category' as const;
export type Category = Data.ContentType<
  typeof CATEGORY_UID,
  Schema.NonPopulatableAttributeNames<typeof CATEGORY_UID>
>;

export const findArticleDb = async (where: any, populate: any) => {
  return balerion.db.query(ARTICLE_UID).findOne({ where, populate }) as Article | undefined;
};

export const findArticlesDb = async (where: any) => {
  return balerion.db.query(ARTICLE_UID).findMany({ where }) as Article[];
};

export const findPublishedArticlesDb = async (documentId) => {
  return findArticlesDb({ documentId, publishedAt: { $notNull: true } });
};

export const findAuthorDb = async (where: any) => {
  return balerion.db.query(AUTHOR_UID).findOne({ where }) as Author | undefined;
};

export const findAuthorsDb = async (where: any) => {
  return balerion.db.query(AUTHOR_UID).findMany({ where }) as Author[];
};

export const findPublishedAuthorsDb = async (documentId) => {
  return findAuthorsDb({ documentId, publishedAt: { $notNull: true } });
};
