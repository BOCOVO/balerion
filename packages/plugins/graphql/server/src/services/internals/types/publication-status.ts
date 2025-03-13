import { enumType } from 'nexus';
import type { Context } from '../../types';

export default ({ balerion }: Context) => {
  const { PUBLICATION_STATUS_TYPE_NAME } = balerion.plugin('graphql').service('constants');

  return {
    /**
     * An enum type definition representing a publication status
     * @type {NexusEnumTypeDef}
     */
    PublicationStatus: enumType({
      name: PUBLICATION_STATUS_TYPE_NAME,

      members: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
      },
    }),
  };
};
