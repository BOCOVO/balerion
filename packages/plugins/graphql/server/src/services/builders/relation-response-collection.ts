import { objectType, nonNull } from 'nexus';
import { defaultTo, prop, pipe } from 'lodash/fp';
import type { Schema } from '@balerion/types';
import type { Context } from '../types';

export default ({ balerion }: Context) => {
  const { naming } = balerion.plugin('graphql').service('utils');

  return {
    /**
     * Build a type definition for a content API relation's collection response for a given content type
     */
    buildRelationResponseCollectionDefinition(contentType: Schema.ContentType) {
      const name = naming.getRelationResponseCollectionName(contentType);
      const typeName = naming.getTypeName(contentType);

      return objectType({
        name,

        definition(t) {
          t.nonNull.list.field('nodes', {
            type: nonNull(typeName),

            resolve: pipe(prop('nodes'), defaultTo([])),
          });

          if (balerion.plugin('graphql').config('v4CompatibilityMode', false)) {
            t.nonNull.list.field('data', {
              deprecation: 'Use `nodes` field instead',
              type: nonNull(typeName),
              resolve: pipe(prop('nodes'), defaultTo([])),
            });
          }
        },
      });
    },
  };
};
