'use strict';

const responseHandlers = require('./src/response-handlers');

module.exports = [
  'balerion::logger',
  'balerion::errors',
  {
    name: 'balerion::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'frame-src': ["'self'"], // URLs that will be loaded in an iframe (e.g. Content Preview)
        },
      },
    },
  },
  'balerion::cors',
  'balerion::poweredBy',
  'balerion::query',
  'balerion::body',
  'balerion::session',
  // 'balerion::compression',
  // 'balerion::ip',
  {
    name: 'balerion::responses',
    config: {
      handlers: responseHandlers,
    },
  },
  'balerion::favicon',
  'balerion::public',
  {
    name: 'global::test-middleware',
    config: {
      foo: 'bar',
    },
  },
  {
    resolve: './src/custom/middleware.js',
    config: {},
  },
];
