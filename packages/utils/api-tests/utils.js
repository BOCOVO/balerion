'use strict';

const _ = require('lodash');

const createUtils = (balerion) => {
  const login = async (userInfo) => {
    const sanitizedUserInfo = _.pick(userInfo, ['email', 'id']);
    const user = await balerion.db.query('admin::user').findOne({ where: sanitizedUserInfo });
    if (!user) {
      throw new Error('User not found');
    }
    const token = balerion.service('admin::token').createJwtToken(user);

    return { token, user };
  };

  const findUser = balerion.service('admin::user').findOne;
  const userExists = balerion.service('admin::user').exists;
  const createUser = async (userInfo) => {
    const superAdminRole = await balerion.service('admin::role').getSuperAdminWithUsersCount();

    if (superAdminRole.usersCount === 0) {
      const userRoles = _.uniq((userInfo.roles || []).concat(superAdminRole.id));
      Object.assign(userInfo, { roles: userRoles });
    }

    return balerion.service('admin::user').create({
      registrationToken: null,
      isActive: true,
      ...userInfo,
    });
  };
  const deleteUserById = balerion.service('admin::user').deleteById;
  const deleteUsersById = balerion.service('admin::user').deleteByIds;
  const createUserIfNotExists = async (userInfo) => {
    const sanitizedUserInfo = _.pick(userInfo, ['email', 'id']);
    const exists = await userExists(sanitizedUserInfo);

    return !exists ? createUser(userInfo) : null;
  };

  const registerOrLogin = async (userCredentials) => {
    await createUserIfNotExists(userCredentials);
    return login(userCredentials);
  };

  const createRole = balerion.service('admin::role').create;
  const getRole = balerion.service('admin::role').find;
  const deleteRolesById = balerion.service('admin::role').deleteByIds;
  const getSuperAdminRole = balerion.service('admin::role').getSuperAdmin;
  const assignPermissionsToRole = balerion.service('admin::role').assignPermissions;

  return {
    // Auth
    login,
    registerOrLogin,
    // Users
    findUser,
    createUser,
    createUserIfNotExists,
    userExists,
    deleteUserById,
    deleteUsersById,
    // Roles
    getRole,
    getSuperAdminRole,
    createRole,
    deleteRolesById,
    assignPermissionsToRole,
  };
};

/**
 * Execute a test suite only if the condition is true
 * @return Jest.Describe
 */
const describeOnCondition = (bool) => (bool ? describe : describe.skip);

module.exports = {
  createUtils,
  describeOnCondition,
};
