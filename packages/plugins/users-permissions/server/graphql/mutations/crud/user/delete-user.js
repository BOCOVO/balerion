'use strict';

const { checkBadRequest } = require('../../../utils');

const usersPermissionsUserUID = 'plugin::users-permissions.user';

module.exports = ({ nexus, balerion }) => {
  const { nonNull } = nexus;
  const { getEntityResponseName } = balerion.plugin('graphql').service('utils').naming;

  const userContentType = balerion.getModel(usersPermissionsUserUID);

  const responseName = getEntityResponseName(userContentType);

  return {
    type: nonNull(responseName),

    args: {
      id: nonNull('ID'),
    },

    description: 'Delete an existing user',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.params = { id: args.id };

      await balerion.plugin('users-permissions').controller('user').destroy(koaContext);

      checkBadRequest(koaContext.body);

      return {
        value: koaContext.body,
        info: { args, resourceUID: 'plugin::users-permissions.user' },
      };
    },
  };
};
