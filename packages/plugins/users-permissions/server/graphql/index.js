'use strict';

const getTypes = require('./types');
const getQueries = require('./queries');
const getMutations = require('./mutations');
const getResolversConfig = require('./resolvers-configs');

module.exports = ({ balerion }) => {
  const { config: graphQLConfig } = balerion.plugin('graphql');
  const extensionService = balerion.plugin('graphql').service('extension');

  const isShadowCRUDEnabled = graphQLConfig('shadowCRUD', true);

  if (!isShadowCRUDEnabled) {
    return;
  }

  // Disable Permissions queries & mutations but allow the
  // type to be used/selected in filters or nested resolvers
  extensionService
    .shadowCRUD('plugin::users-permissions.permission')
    .disableQueries()
    .disableMutations();

  // Disable User & Role's Create/Update/Delete actions so they can be replaced
  const actionsToDisable = ['create', 'update', 'delete'];

  extensionService.shadowCRUD('plugin::users-permissions.user').disableActions(actionsToDisable);
  extensionService.shadowCRUD('plugin::users-permissions.role').disableActions(actionsToDisable);

  // Register new types & resolvers config
  extensionService.use(({ nexus }) => {
    const types = getTypes({ balerion, nexus });
    const queries = getQueries({ balerion, nexus });
    const mutations = getMutations({ balerion, nexus });
    const resolversConfig = getResolversConfig({ balerion });

    return {
      types: [types, queries, mutations],

      resolversConfig,
    };
  });
};
