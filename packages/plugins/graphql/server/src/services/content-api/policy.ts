import { propOr } from 'lodash/fp';
import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { policy as policyUtils, errors } from '@balerion/utils';
import type { Core } from '@balerion/types';

const { PolicyError } = errors;

const getPoliciesConfig = propOr([], 'policies');

const createPoliciesMiddleware = (resolverConfig: any, { balerion }: { balerion: Core.Balerion }) => {
  const resolverPolicies = getPoliciesConfig(resolverConfig);
  const policies = balerion.get('policies').resolve(resolverPolicies, {});

  return async (
    resolve: GraphQLFieldResolver<any, any>,
    parent: any,
    args: any,
    context: any,
    info: GraphQLResolveInfo
  ) => {
    // Create a graphql policy context
    const policyContext = createGraphQLPolicyContext(parent, args, context, info);

    // Run policies & throw an error if one of them fails
    for (const { handler, config } of policies) {
      const result = await handler(policyContext, config, { balerion });

      if (![true, undefined].includes(result)) {
        throw new PolicyError();
      }
    }

    return resolve(parent, args, context, info);
  };
};

const createGraphQLPolicyContext = (
  parent: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => {
  const policyContext = {
    get parent() {
      return parent;
    },

    get args() {
      return args;
    },

    get context() {
      return context;
    },

    get info() {
      return info;
    },

    get state() {
      return this.context.state;
    },

    get http() {
      return this.context.koaContext;
    },
  };

  return policyUtils.createPolicyContext('graphql', policyContext);
};

export { createPoliciesMiddleware };
