'use strict';

const crudActionsToDisable = ['create', 'update', 'delete'];

module.exports = ({ balerion }) => {
  const extension = balerion.plugin('graphql').service('extension');

  extension.shadowCRUD('plugin::myplugin.test').disableActions(crudActionsToDisable);
};
