import { isEmpty, isNil } from 'lodash/fp';

import type { Core } from '@balerion/types';

/**
 * Test if the balerion application is considered as initialized (1st user has been created)
 */
export const isInitialized = async (balerion: Core.Balerion): Promise<boolean> => {
  try {
    if (isEmpty(balerion.admin)) {
      return true;
    }

    // test if there is at least one admin
    const anyAdministrator = await balerion.db.query('admin::user').findOne({ select: ['id'] });

    return !isNil(anyAdministrator);
  } catch (err) {
    balerion.stopWithError(err);
  }
};
