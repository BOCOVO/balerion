import { objectType } from 'nexus';
import type { Context } from '../../types';

export default ({ balerion }: Context) => {
  const { DELETE_MUTATION_RESPONSE_TYPE_NAME } = balerion.plugin('graphql').service('constants');

  return {
    DeleteMutationResponse: objectType({
      name: DELETE_MUTATION_RESPONSE_TYPE_NAME,

      definition(t) {
        t.nonNull.id('documentId');
      },
    }),
  };
};
