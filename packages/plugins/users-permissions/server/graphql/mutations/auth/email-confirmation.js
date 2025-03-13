'use strict';

const { toPlainObject } = require('lodash/fp');

const { checkBadRequest } = require('../../utils');

module.exports = ({ nexus, balerion }) => {
  const { nonNull } = nexus;

  return {
    type: 'UsersPermissionsLoginPayload',

    args: {
      confirmation: nonNull('String'),
    },

    description: 'Confirm an email users email address',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.query = toPlainObject(args);

      await balerion
        .plugin('users-permissions')
        .controller('auth')
        .emailConfirmation(koaContext, null, true);

      const output = koaContext.body;

      checkBadRequest(output);

      return {
        user: output.user || output,
        jwt: output.jwt,
      };
    },
  };
};
