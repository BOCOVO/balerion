const { createCoreRouter } = require('@balerion/balerion').factories;

module.exports = {
  test: createCoreRouter('plugin::myplugin.test', {
    type: 'content-api',
    only: ['find', 'findOne'],
  }),
};
