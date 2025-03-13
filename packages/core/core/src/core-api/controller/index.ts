import { prop } from 'lodash/fp';
import type Koa from 'koa';
import { contentTypes as contentTypeUtils } from '@balerion/utils';
import type { Core, Struct } from '@balerion/types';

import { transformResponse } from './transform';
import { createSingleTypeController } from './single-type';
import { createCollectionTypeController } from './collection-type';
import requestCtx from '../../services/request-context';

const isSingleType = (
  contentType: Struct.ContentTypeSchema
): contentType is Struct.SingleTypeSchema => contentTypeUtils.isSingleType(contentType);

const getAuthFromKoaContext = (ctx: Koa.Context) => prop('state.auth', ctx) ?? {};

function createController<T extends Struct.SingleTypeSchema | Struct.CollectionTypeSchema>(opts: {
  contentType: T;
}): T extends Struct.SingleTypeSchema
  ? Core.CoreAPI.Controller.SingleType
  : Core.CoreAPI.Controller.CollectionType;
function createController({
  contentType,
}: {
  contentType: Struct.SingleTypeSchema | Struct.CollectionTypeSchema;
}) {
  // TODO: replace with Base class + SingleType and CollectionType classes

  const proto: Core.CoreAPI.Controller.Base = {
    transformResponse(data, meta) {
      const ctx = requestCtx.get();
      return transformResponse(data, meta, {
        contentType,
        useJsonAPIFormat: ctx?.headers?.['balerion-response-format'] === 'v4',
      });
    },

    async sanitizeOutput(data, ctx) {
      const auth = getAuthFromKoaContext(ctx);

      return balerion.contentAPI.sanitize.output(data, contentType, { auth });
    },

    async sanitizeInput(data, ctx) {
      const auth = getAuthFromKoaContext(ctx);

      return balerion.contentAPI.sanitize.input(data, contentType, { auth });
    },

    async sanitizeQuery(ctx) {
      const auth = getAuthFromKoaContext(ctx);

      return balerion.contentAPI.sanitize.query(ctx.query, contentType, { auth });
    },

    async validateQuery(ctx) {
      const auth = getAuthFromKoaContext(ctx);

      return balerion.contentAPI.validate.query(ctx.query, contentType, { auth });
    },

    async validateInput(data, ctx) {
      const auth = getAuthFromKoaContext(ctx);

      return balerion.contentAPI.validate.input(data, contentType, { auth });
    },
  };

  let ctrl;

  if (isSingleType(contentType)) {
    ctrl = createSingleTypeController({ contentType });
  } else {
    ctrl = createCollectionTypeController({ contentType });
  }

  return Object.assign(Object.create(proto), ctrl);
}

export { createController };
