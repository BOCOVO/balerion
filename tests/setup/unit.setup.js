'use strict';

const _ = require('lodash');

// TODO: remove this tmp fix and migrate tests
let balerionInstance;
Object.defineProperty(global, 'balerion', {
  get() {
    return balerionInstance;
  },
  set(value) {
    balerionInstance = value;

    balerionInstance.plugin = (name) => balerionInstance.plugins[name];
    _.mapValues(balerion.plugins, (acc) => {
      acc.controller = (name) => acc.controllers[name];
      acc.service = (name) => acc.services[name];
      acc.contentType = (name) => acc.contentTypes[name];
      acc.policy = (name) => acc.policies[name];
    });

    balerionInstance.api = (name) => balerionInstance.apis[name];
    _.mapValues(balerion.api, (acc) => {
      acc.controller = (name) => acc.controllers[name];
      acc.service = (name) => acc.services[name];
      acc.contentType = (name) => acc.contentTypes[name];
      acc.policy = (name) => acc.policies[name];
    });

    balerionInstance.service = (name = '') => {
      if (name.startsWith('admin::')) {
        return balerionInstance.admin.services[name.split('admin::')[1]];
      }
    };
  },
});
