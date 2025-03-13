'use strict';

const sanitize = require('./sanitize');

const getService = (name) => {
  return balerion.plugin('users-permissions').service(name);
};

module.exports = {
  getService,
  sanitize,
};
