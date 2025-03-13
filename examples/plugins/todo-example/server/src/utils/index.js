'use strict';

// Retrieve a local service
function getService(name) {
  return balerion.plugin('todo').service(name);
}

module.exports = {
  getService,
};
