import { extendType, nonNull } from 'nexus';
import { errors } from '@balerion/utils';
import type * as Nexus from 'nexus';
import type { Struct } from '@balerion/types';
import type { Context } from '../../types';

const { NotFoundError } = errors;

export default ({ balerion }: Context) => {
  const { service: getService } = balerion.plugin('graphql');

  const { naming } = getService('utils');
  const { args } = getService('internals');

  const {
    getUpdateMutationTypeName,
    getTypeName,
    getContentTypeInputName,
    getDeleteMutationTypeName,
  } = naming;

  const addUpdateMutation = (
    t: Nexus.blocks.ObjectDefinitionBlock<'Mutation'>,
    contentType: Struct.SingleTypeSchema
  ) => {
    const { uid } = contentType;

    const updateMutationName = getUpdateMutationTypeName(contentType);
    const typeName = getTypeName(contentType);

    t.field(updateMutationName, {
      type: typeName,

      extensions: {
        balerion: {
          contentType,
        },
      },

      args: {
        // Update payload
        status: args.PublicationStatusArg,
        data: nonNull(getContentTypeInputName(contentType)),
      },

      async resolve(parent, args, context) {
        const { auth } = context.state;

        // Sanitize input data
        const sanitizedInputData = await balerion.contentAPI.sanitize.input(args.data, contentType, {
          auth,
        });

        const document = await balerion.db?.query(uid).findOne();

        if (document) {
          return balerion.documents!(uid).update({
            ...args,
            documentId: document.documentId,
            data: sanitizedInputData,
          });
        }

        return balerion.documents!(uid).create({
          ...args,
          data: sanitizedInputData,
        });
      },
    });
  };

  const addDeleteMutation = (
    t: Nexus.blocks.ObjectDefinitionBlock<'Mutation'>,
    contentType: Struct.SingleTypeSchema
  ) => {
    const { uid } = contentType;

    const deleteMutationName = getDeleteMutationTypeName(contentType);
    const { DELETE_MUTATION_RESPONSE_TYPE_NAME } = balerion.plugin('graphql').service('constants');

    t.field(deleteMutationName, {
      type: DELETE_MUTATION_RESPONSE_TYPE_NAME,

      extensions: {
        balerion: {
          contentType,
        },
      },

      args: {},

      async resolve(parent, args) {
        const document = await balerion.db?.query(uid).findOne();

        if (!document) {
          throw new NotFoundError('Document not found');
        }

        await balerion.documents!(uid).delete({ ...args, documentId: document.documentId });

        return document;
      },
    });
  };

  return {
    buildSingleTypeMutations(contentType: Struct.SingleTypeSchema) {
      const updateMutationName = `Mutation.${getUpdateMutationTypeName(contentType)}`;
      const deleteMutationName = `Mutation.${getDeleteMutationTypeName(contentType)}`;

      const extension = getService('extension');

      const registerAuthConfig = (action: string, auth: any) => {
        return extension.use({ resolversConfig: { [action]: { auth } } });
      };

      const isActionEnabled = (action: string) => {
        return extension.shadowCRUD(contentType.uid).isActionEnabled(action);
      };

      const isUpdateEnabled = isActionEnabled('update');
      const isDeleteEnabled = isActionEnabled('delete');

      if (isUpdateEnabled) {
        registerAuthConfig(updateMutationName, { scope: [`${contentType.uid}.update`] });
      }

      if (isDeleteEnabled) {
        registerAuthConfig(deleteMutationName, { scope: [`${contentType.uid}.delete`] });
      }

      return extendType({
        type: 'Mutation',

        definition(t) {
          if (isUpdateEnabled) {
            addUpdateMutation(t, contentType);
          }

          if (isDeleteEnabled) {
            addDeleteMutation(t, contentType);
          }
        },
      });
    },
  };
};
