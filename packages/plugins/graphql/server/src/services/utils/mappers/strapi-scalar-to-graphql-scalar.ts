import { get, difference } from 'lodash/fp';
import { errors } from '@balerion/utils';
import type { Context } from '../../types';

const { ApplicationError } = errors;

export default ({ balerion }: Context) => {
  const { BALERION_SCALARS, SCALARS_ASSOCIATIONS } = balerion.plugin('graphql').service('constants');

  const missingBalerionScalars = difference(BALERION_SCALARS, Object.keys(SCALARS_ASSOCIATIONS));

  if (missingBalerionScalars.length > 0) {
    throw new ApplicationError('Some Balerion scalars are not handled in the GraphQL scalars mapper');
  }

  return {
    /**
     * Used to transform a Balerion scalar type into its GraphQL equivalent
     */
    balerionScalarToGraphQLScalar(balerionScalar: string) {
      return get(balerionScalar, SCALARS_ASSOCIATIONS);
    },
  };
};
