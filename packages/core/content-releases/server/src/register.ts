/* eslint-disable @typescript-eslint/no-var-requires */
import type { Core } from '@balerion/types';

import { ACTIONS, RELEASE_MODEL_UID, RELEASE_ACTION_MODEL_UID } from './constants';
import {
  deleteActionsOnDeleteContentType,
  deleteActionsOnDisableDraftAndPublish,
  migrateIsValidAndStatusReleases,
  revalidateChangedContentTypes,
  disableContentTypeLocalized,
  enableContentTypeLocalized,
} from './migrations';
import { addEntryDocumentToReleaseActions } from './migrations/database/5.0.0-document-id-in-actions';

export const register = async ({ balerion }: { balerion: Core.Balerion }) => {
  if (balerion.ee.features.isEnabled('cms-content-releases')) {
    await balerion.service('admin::permission').actionProvider.registerMany(ACTIONS);

    balerion.db.migrations.providers.internal.register(addEntryDocumentToReleaseActions);

    balerion
      .hook('balerion::content-types.beforeSync')
      .register(disableContentTypeLocalized)
      .register(deleteActionsOnDisableDraftAndPublish);

    balerion
      .hook('balerion::content-types.afterSync')
      .register(deleteActionsOnDeleteContentType)
      .register(enableContentTypeLocalized)
      .register(revalidateChangedContentTypes)
      .register(migrateIsValidAndStatusReleases);
  }

  if (balerion.plugin('graphql')) {
    const graphqlExtensionService = balerion.plugin('graphql').service('extension');
    // Exclude the release and release action models from the GraphQL schema
    graphqlExtensionService.shadowCRUD(RELEASE_MODEL_UID).disable();
    graphqlExtensionService.shadowCRUD(RELEASE_ACTION_MODEL_UID).disable();
  }
};
