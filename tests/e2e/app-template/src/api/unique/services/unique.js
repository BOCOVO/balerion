'use strict';

/**
 * unique service
 */

const { createCoreService } = require('@balerion/balerion').factories;

module.exports = createCoreService('api::unique.unique');
