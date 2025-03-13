'use strict';

const { yup, validateYupSchema } = require('@balerion/utils');

const deleteRoleSchema = yup.object().shape({
  role: yup.balerionID().required(),
});

const createUserBodySchema = yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().min(1).required(),
  password: yup.string().min(1).required(),
  role: yup.lazy((value) =>
    typeof value === 'object'
      ? yup
          .object()
          .shape({
            connect: yup
              .array()
              .of(yup.object().shape({ id: yup.balerionID().required() }))
              .min(1, 'Users must have a role')
              .required(),
          })
          .required()
      : yup.balerionID().required()
  ),
});

const updateUserBodySchema = yup.object().shape({
  email: yup.string().email().min(1),
  username: yup.string().min(1),
  password: yup.string().min(1),
  role: yup.lazy((value) =>
    typeof value === 'object'
      ? yup.object().shape({
          connect: yup
            .array()
            .of(yup.object().shape({ id: yup.balerionID().required() }))
            .required(),
          disconnect: yup
            .array()
            .test('CheckDisconnect', 'Cannot remove role', function test(disconnectValue) {
              if (value.connect.length === 0 && disconnectValue.length > 0) {
                return false;
              }

              return true;
            })
            .required(),
        })
      : yup.balerionID()
  ),
});

module.exports = {
  validateCreateUserBody: validateYupSchema(createUserBodySchema),
  validateUpdateUserBody: validateYupSchema(updateUserBodySchema),
  validateDeleteRoleBody: validateYupSchema(deleteRoleSchema),
};
