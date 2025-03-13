import { objectType } from 'nexus';
import { prop } from 'lodash/fp';
import type { Schema } from '@balerion/types';
import type { Context } from '../types';

export default ({ balerion }: Context) => {
  const { naming } = balerion.plugin('graphql').service('utils');

  return {
    /**
     * Build a type definition for a content API response for a given content type
     */
    buildResponseDefinition(contentType: Schema.ContentType) {
      const name = naming.getEntityResponseName(contentType);
      const typeName = naming.getTypeName(contentType);

      return objectType({
        name,

        definition(t) {
          t.field('data', {
            type: typeName,

            resolve: prop('value'),
          });
        },
      });
    },
  };
};
