'use strict';

const usersPermissionsRoleUID = 'plugin::users-permissions.role';

module.exports = ({ nexus, balerion }) => {
  const { getContentTypeInputName } = balerion.plugin('graphql').service('utils').naming;
  const { nonNull } = nexus;

  const roleContentType = balerion.getModel(usersPermissionsRoleUID);

  const roleInputName = getContentTypeInputName(roleContentType);

  return {
    type: 'UsersPermissionsUpdateRolePayload',

    args: {
      id: nonNull('ID'),
      data: nonNull(roleInputName),
    },

    description: 'Update an existing role',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.params = { role: args.id };
      koaContext.request.body = args.data;
      koaContext.request.body.role = args.id;

      await balerion.plugin('users-permissions').controller('role').updateRole(koaContext);

      return { ok: true };
    },
  };
};
