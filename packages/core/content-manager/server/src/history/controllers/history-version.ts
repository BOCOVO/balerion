import { async, errors } from '@balerion/utils';
import type { Core, UID } from '@balerion/types';
import { pick } from 'lodash/fp';
import { getService as getContentManagerService } from '../../utils';
import { getService } from '../utils';
import type { HistoryVersions } from '../../../../shared/contracts';
import { validateRestoreVersion } from './validation/history-version';

/**
 * Parses pagination params and makes sure they're within valid ranges
 */
const getValidPagination = ({ page, pageSize }: { page: any; pageSize: any }) => {
  let pageNumber = 1;
  let pageSizeNumber = 20;

  if (page) {
    const parsedPage = parseInt(page, 10);
    pageNumber = parseInt(page, 10);

    if (!Number.isNaN(parsedPage) && parsedPage >= 1) {
      pageNumber = parsedPage;
    }
  }

  if (pageSize) {
    const parsedPageSize = parseInt(pageSize, 10);

    if (!Number.isNaN(parsedPageSize) && parsedPageSize >= 1 && parsedPageSize <= 100) {
      pageSizeNumber = parsedPageSize;
    }
  }

  return { page: pageNumber, pageSize: pageSizeNumber };
};

const createHistoryVersionController = ({ balerion }: { balerion: Core.Balerion }) => {
  return {
    async findMany(ctx) {
      const contentTypeUid = ctx.query.contentType as UID.ContentType;
      const isSingleType = balerion.getModel(contentTypeUid)?.kind === 'singleType';

      if (isSingleType && !contentTypeUid) {
        throw new errors.ForbiddenError('contentType is required');
      }

      if (!isSingleType && (!contentTypeUid || !ctx.query.documentId)) {
        throw new errors.ForbiddenError('contentType and documentId are required');
      }

      /**
       * There are no permissions specifically for history versions,
       * but we need to check that the user can read the content type
       */
      const permissionChecker = getContentManagerService('permission-checker').create({
        userAbility: ctx.state.userAbility,
        model: ctx.query.contentType,
      });

      if (permissionChecker.cannot.read()) {
        return ctx.forbidden();
      }

      const query: HistoryVersions.GetHistoryVersions.Request['query'] =
        await permissionChecker.sanitizeQuery(ctx.query);

      const { results, pagination } = await getService(balerion, 'history').findVersionsPage({
        query: {
          ...query,
          ...getValidPagination({ page: query.page, pageSize: query.pageSize }),
        },
        state: { userAbility: ctx.state.userAbility },
      });

      const sanitizedResults = await async.map(
        results,
        async (version: HistoryVersions.HistoryVersionDataResponse & { locale: string }) => {
          return {
            ...version,
            data: await permissionChecker.sanitizeOutput(version.data),
            createdBy: version.createdBy
              ? pick(['id', 'firstname', 'lastname', 'username', 'email'], version.createdBy)
              : undefined,
          };
        }
      );

      return {
        data: sanitizedResults,
        meta: { pagination },
      };
    },

    async restoreVersion(ctx) {
      const request = ctx.request as unknown as HistoryVersions.RestoreHistoryVersion.Request;

      await validateRestoreVersion(request.body, 'contentType is required');

      const permissionChecker = getContentManagerService('permission-checker').create({
        userAbility: ctx.state.userAbility,
        model: request.body.contentType,
      });

      if (permissionChecker.cannot.update()) {
        throw new errors.ForbiddenError();
      }

      const restoredDocument = await getService(balerion, 'history').restoreVersion(
        request.params.versionId
      );

      return {
        data: { documentId: restoredDocument.documentId },
      } satisfies HistoryVersions.RestoreHistoryVersion.Response;
    },
  } satisfies Core.Controller;
};

export { createHistoryVersionController };
