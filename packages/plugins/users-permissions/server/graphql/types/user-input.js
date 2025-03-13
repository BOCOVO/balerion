'use strict';

const usersPermissionsUserUID = 'plugin::users-permissions.user';

module.exports = ({ nexus, balerion }) => {
  const { getContentTypeInputName } = balerion.plugin('graphql').service('utils').naming;

  const userContentType = balerion.getModel(usersPermissionsUserUID);
  const userInputName = getContentTypeInputName(userContentType);

  return nexus.extendInputType({
    type: userInputName,

    definition(t) {
      // Manually add the private password field back to the data
      // input type as it is used for CRUD operations on users
      t.string('password');
    },
  });
};
