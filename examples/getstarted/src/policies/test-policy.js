'use strict';

/**
 * `test-policy` policy
 */

module.exports = (policyCtx, config, { balerion }) => {
  // Add your own logic here.
  balerion.log.info('In test-policy policy.');

  const canDoSomething = true;

  if (canDoSomething) {
    return true;
  }

  return false;
};
