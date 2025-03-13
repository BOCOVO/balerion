'use strict';

const { CUSTOM_TRANSFER_TOKEN_ACCESS_KEY } = require('./constants');

/**
 * Make sure the test transfer token exists in the database
 * @param {Balerion.Balerion} balerion
 * @returns {Promise<void>}
 */
const createTestTransferToken = async (balerion) => {
  const { token: transferTokenService } = balerion.service('admin::transfer');

  const accessKeyHash = transferTokenService.hash(CUSTOM_TRANSFER_TOKEN_ACCESS_KEY);
  const exists = await transferTokenService.exists({ accessKey: accessKeyHash });

  if (!exists) {
    await transferTokenService.create({
      name: 'TestToken',
      description: 'Transfer token used to seed the e2e database',
      lifespan: null,
      permissions: ['push'],
      accessKey: CUSTOM_TRANSFER_TOKEN_ACCESS_KEY,
    });
  }
};

module.exports = {
  createTestTransferToken,
};
