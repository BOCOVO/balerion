'use strict';

/**
 * User.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const urlJoin = require('url-join');

const { sanitize } = require('@balerion/utils');
const { toNumber, getOr } = require('lodash/fp');
const { getService } = require('../utils');

const USER_MODEL_UID = 'plugin::users-permissions.user';

module.exports = ({ balerion }) => ({
  /**
   * Promise to count users
   *
   * @return {Promise}
   */

  count(params) {
    return balerion.db.query(USER_MODEL_UID).count({ where: params });
  },

  /**
   * Hashes password fields in the provided values object if they are present.
   * It checks each key in the values object against the model's attributes and
   * hashes it if the attribute type is 'password',
   *
   * @param {object} values - The object containing the fields to be hashed.
   * @return {object} The values object with hashed password fields if they were present.
   */
  async ensureHashedPasswords(values) {
    const attributes = balerion.getModel(USER_MODEL_UID).attributes;

    for (const key in values) {
      if (attributes[key] && attributes[key].type === 'password') {
        // Check if a custom encryption.rounds has been set on the password attribute
        const rounds = toNumber(getOr(10, 'encryption.rounds', attributes[key]));
        values[key] = await bcrypt.hash(values[key], rounds);
      }
    }

    return values;
  },

  /**
   * Promise to add a/an user.
   * @return {Promise}
   */
  async add(values) {
    return balerion.db.query(USER_MODEL_UID).create({
      data: await this.ensureHashedPasswords(values),
      populate: ['role'],
    });
  },

  /**
   * Promise to edit a/an user.
   * @param {string} userId
   * @param {object} params
   * @return {Promise}
   */
  async edit(userId, params = {}) {
    return balerion.db.query(USER_MODEL_UID).update({
      where: { id: userId },
      data: await this.ensureHashedPasswords(params),
      populate: ['role'],
    });
  },

  /**
   * Promise to fetch a/an user.
   * @return {Promise}
   */
  fetch(id, params) {
    const query = balerion.get('query-params').transform(USER_MODEL_UID, params ?? {});

    return balerion.db.query(USER_MODEL_UID).findOne({
      ...query,
      where: {
        $and: [{ id }, query.where || {}],
      },
    });
  },

  /**
   * Promise to fetch authenticated user.
   * @return {Promise}
   */
  fetchAuthenticatedUser(id) {
    return balerion.db.query(USER_MODEL_UID).findOne({ where: { id }, populate: ['role'] });
  },

  /**
   * Promise to fetch all users.
   * @return {Promise}
   */
  fetchAll(params) {
    const query = balerion.get('query-params').transform(USER_MODEL_UID, params ?? {});

    return balerion.db.query(USER_MODEL_UID).findMany(query);
  },

  /**
   * Promise to remove a/an user.
   * @return {Promise}
   */
  async remove(params) {
    return balerion.db.query(USER_MODEL_UID).delete({ where: params });
  },

  validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async sendConfirmationEmail(user) {
    const userPermissionService = getService('users-permissions');
    const pluginStore = await balerion.store({ type: 'plugin', name: 'users-permissions' });
    const userSchema = balerion.getModel(USER_MODEL_UID);

    const settings = await pluginStore
      .get({ key: 'email' })
      .then((storeEmail) => storeEmail.email_confirmation.options);

    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(
      {
        schema: userSchema,
        getModel: balerion.getModel.bind(balerion),
      },
      user
    );

    const confirmationToken = crypto.randomBytes(20).toString('hex');

    await this.edit(user.id, { confirmationToken });

    const apiPrefix = balerion.config.get('api.rest.prefix');

    try {
      settings.message = await userPermissionService.template(settings.message, {
        URL: urlJoin(
          balerion.config.get('server.absoluteUrl'),
          apiPrefix,
          '/auth/email-confirmation'
        ),
        SERVER_URL: balerion.config.get('server.absoluteUrl'),
        ADMIN_URL: balerion.config.get('admin.absoluteUrl'),
        USER: sanitizedUserInfo,
        CODE: confirmationToken,
      });

      settings.object = await userPermissionService.template(settings.object, {
        USER: sanitizedUserInfo,
      });
    } catch {
      balerion.log.error(
        '[plugin::users-permissions.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid and does not contain invalid characters or patterns'
      );
      return;
    }

    // Send an email to the user.
    await balerion
      .plugin('email')
      .service('email')
      .send({
        to: user.email,
        from:
          settings.from.email && settings.from.name
            ? `${settings.from.name} <${settings.from.email}>`
            : undefined,
        replyTo: settings.response_email,
        subject: settings.object,
        text: settings.message,
        html: settings.message,
      });
  },
});
