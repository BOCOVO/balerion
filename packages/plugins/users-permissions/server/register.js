'use strict';

const fs = require('fs');
const path = require('path');

const authStrategy = require('./strategies/users-permissions');
const sanitizers = require('./utils/sanitize/sanitizers');

module.exports = ({ balerion }) => {
  balerion.get('auth').register('content-api', authStrategy);
  balerion.sanitizers.add('content-api.output', sanitizers.defaultSanitizeOutput);

  if (balerion.plugin('graphql')) {
    require('./graphql')({ balerion });
  }

  if (balerion.plugin('documentation')) {
    const specPath = path.join(__dirname, '../../documentation/content-api.yaml');
    const spec = fs.readFileSync(specPath, 'utf8');

    balerion
      .plugin('documentation')
      .service('override')
      .registerOverride(spec, {
        pluginOrigin: 'users-permissions',
        excludeFromGeneration: ['users-permissions'],
      });
  }
};
