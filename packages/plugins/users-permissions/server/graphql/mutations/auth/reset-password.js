'use strict';

const { toPlainObject } = require('lodash/fp');

const { checkBadRequest } = require('../../utils');

module.exports = ({ nexus, balerion }) => {
  const { nonNull } = nexus;

  return {
    type: 'UsersPermissionsLoginPayload',

    args: {
      password: nonNull('String'),
      passwordConfirmation: nonNull('String'),
      code: nonNull('String'),
    },

    description: 'Reset user password. Confirm with a code (resetToken from forgotPassword)',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.request.body = toPlainObject(args);

      await balerion.plugin('users-permissions').controller('auth').resetPassword(koaContext);

      const output = koaContext.body;

      checkBadRequest(output);

      return {
        user: output.user || output,
        jwt: output.jwt,
      };
    },
  };
};
