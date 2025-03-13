'use strict';

const createAuthenticatedUser = async ({ balerion, userInfo }) => {
  const defaultRole = await balerion.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  const user = await balerion.service('plugin::users-permissions.user').add({
    role: defaultRole.id,
    ...userInfo,
  });

  const jwt = balerion.service('plugin::users-permissions.jwt').issue({ id: user.id });

  return { user, jwt };
};

module.exports = {
  createAuthenticatedUser,
};
