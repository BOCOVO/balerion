'use strict';

const { createAgent } = require('./agent');
const { superAdmin } = require('./balerion');

const CONTENT_API_URL_PREFIX = '/api';

const createRequest = ({ balerion } = {}) => createAgent(balerion);

const createContentAPIRequest = ({ balerion, auth = {} } = {}) => {
  const { token } = auth;

  if (token) {
    return createAgent(balerion, { urlPrefix: CONTENT_API_URL_PREFIX, token });
  }

  // Default content api agent
  return createAgent(balerion, { urlPrefix: CONTENT_API_URL_PREFIX, token: 'test-token' });
};

const createAuthRequest = ({ balerion, userInfo = superAdmin.credentials, state = {} }) => {
  return createAgent(balerion, state).login(userInfo);
};

// TODO: Remove
const transformToRESTResource = (input) => {
  if (Array.isArray(input)) {
    return input.map((value) => transformToRESTResource(value));
  }

  return input;
};

module.exports = {
  createRequest,
  createContentAPIRequest,
  createAuthRequest,
  transformToRESTResource,
};
