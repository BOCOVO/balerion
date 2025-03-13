import balerionScalarToGraphQLScalar from './balerion-scalar-to-graphql-scalar';
import graphQLFiltersToBalerionQuery from './graphql-filters-to-balerion-query';
import graphqlScalarToOperators from './graphql-scalar-to-operators';
import entityToResponseEntity from './entity-to-response-entity';

import type { Context } from '../../types';

export default (context: Context) => ({
  ...balerionScalarToGraphQLScalar(context),
  ...graphQLFiltersToBalerionQuery(context),
  ...graphqlScalarToOperators(context),
  ...entityToResponseEntity(),
});
