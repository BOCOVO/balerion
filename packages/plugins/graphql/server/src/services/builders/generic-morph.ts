import { unionType } from 'nexus';
import { prop } from 'lodash/fp';

import type { Context } from '../types';

export default ({ balerion, registry }: Context) => {
  const { naming } = balerion.plugin('graphql').service('utils');
  const { KINDS, GENERIC_MORPH_TYPENAME } = balerion.plugin('graphql').service('constants');

  return {
    buildGenericMorphDefinition() {
      return unionType({
        name: GENERIC_MORPH_TYPENAME,

        resolveType(obj: any) {
          const contentType = balerion.getModel(obj.__type);

          if (!contentType) {
            return null;
          }

          if (contentType.modelType === 'component') {
            return naming.getComponentName(contentType);
          }

          return naming.getTypeName(contentType);
        },

        definition(t: any) {
          const members = registry
            // Resolve every content-type or component
            .where(({ config }) => [KINDS.type, KINDS.component].includes(config.kind))
            // Only keep their name (the type's id)
            .map(prop('name'));

          t.members(...members);
        },
      });
    },
  };
};
