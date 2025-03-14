'use strict';

const { curry } = require('lodash/fp');
const { traverseEntity, async } = require('@balerion/utils');

const { removeUserRelationFromRoleEntities } = require('./visitors');

const sanitizeUserRelationFromRoleEntities = curry((schema, entity) => {
  return traverseEntity(
    removeUserRelationFromRoleEntities,
    { schema, getModel: balerion.getModel.bind(balerion) },
    entity
  );
});

const defaultSanitizeOutput = curry((schema, entity) => {
  return async.pipe(sanitizeUserRelationFromRoleEntities(schema))(entity);
});

module.exports = {
  sanitizeUserRelationFromRoleEntities,
  defaultSanitizeOutput,
};
