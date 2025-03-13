import { get, map, mapValues } from 'lodash/fp';
import type { Context } from '../../types';

export default ({ balerion }: Context) => ({
  graphqlScalarToOperators(graphqlScalar: string) {
    const { GRAPHQL_SCALAR_OPERATORS } = balerion.plugin('graphql').service('constants');
    const { operators } = balerion.plugin('graphql').service('builders').filters;

    const associations = mapValues(
      map((operatorName: string) => operators[operatorName]),
      GRAPHQL_SCALAR_OPERATORS
    );

    return get(graphqlScalar, associations);
  },
});
