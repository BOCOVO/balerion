import type { Context } from '../../types';

export default ({ balerion }: Context) => ({
  async resolvePagination(parent: any, _: any, ctx: any) {
    const { args, resourceUID } = parent.info;
    const { start, limit } = args;
    const safeLimit = Math.max(limit, 1);
    const contentType = balerion.getModel(resourceUID);

    await balerion.contentAPI.validate.query(args, contentType, {
      auth: ctx?.state?.auth,
    });

    const sanitizedQuery = await balerion.contentAPI.sanitize.query(args, contentType, {
      auth: ctx?.state?.auth,
    });

    const total = await balerion.documents!(resourceUID).count(sanitizedQuery);

    const pageSize = limit === -1 ? total - start : safeLimit;
    const pageCount = limit === -1 ? safeLimit : Math.ceil(total / safeLimit);
    const page = limit === -1 ? safeLimit : Math.floor(start / safeLimit) + 1;

    return { total, page, pageSize, pageCount };
  },
});
