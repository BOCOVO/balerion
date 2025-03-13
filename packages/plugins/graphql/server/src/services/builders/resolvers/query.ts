import { omit } from 'lodash/fp';
import type { Schema } from '@balerion/types';
import type { Context } from '../../types';

export default ({ balerion }: Context) => ({
  buildQueriesResolvers({ contentType }: { contentType: Schema.ContentType }) {
    const { uid } = contentType;

    return {
      async findMany(parent: any, args: any, ctx: any) {
        await balerion.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await balerion.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return balerion.documents!(uid).findMany({ status: 'published', ...sanitizedQuery });
      },

      async findFirst(parent: any, args: any, ctx: any) {
        await balerion.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await balerion.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return balerion.documents!(uid).findFirst({ status: 'published', ...sanitizedQuery });
      },

      async findOne(parent: any, args: any, ctx: any) {
        const { documentId } = args;

        await balerion.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await balerion.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return balerion.documents!(uid).findOne({
          status: 'published',
          ...omit(['id', 'documentId'], sanitizedQuery),
          documentId,
        });
      },
    };
  },
});
