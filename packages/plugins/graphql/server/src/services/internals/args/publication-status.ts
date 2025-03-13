import { arg } from 'nexus';
import { Context } from '../../types';

export default ({ balerion }: Context) => {
  const { PUBLICATION_STATUS_TYPE_NAME } = balerion.plugin('graphql').service('constants');

  return arg({
    type: PUBLICATION_STATUS_TYPE_NAME,
    default: 'published',
  });
};
