import { hooks } from '@balerion/utils';

import { defineProvider } from './provider';
import * as registries from '../registries';
import { loadApplicationContext } from '../loaders';
import * as syncMigrations from '../migrations';
import { discardDocumentDrafts } from '../migrations/database/5.0.0-discard-drafts';

export default defineProvider({
  init(balerion) {
    balerion
      .add('content-types', () => registries.contentTypes())
      .add('components', () => registries.components())
      .add('services', () => registries.services(balerion))
      .add('policies', () => registries.policies())
      .add('middlewares', () => registries.middlewares())
      .add('hooks', () => registries.hooks())
      .add('controllers', () => registries.controllers(balerion))
      .add('modules', () => registries.modules(balerion))
      .add('plugins', () => registries.plugins(balerion))
      .add('custom-fields', () => registries.customFields(balerion))
      .add('apis', () => registries.apis(balerion))
      .add('models', () => registries.models())
      .add('sanitizers', registries.sanitizers())
      .add('validators', registries.validators());
  },
  async register(balerion) {
    await loadApplicationContext(balerion);

    balerion.get('hooks').set('balerion::content-types.beforeSync', hooks.createAsyncParallelHook());
    balerion.get('hooks').set('balerion::content-types.afterSync', hooks.createAsyncParallelHook());

    // Content migration to enable draft and publish
    balerion.hook('balerion::content-types.beforeSync').register(syncMigrations.disable);
    balerion.hook('balerion::content-types.afterSync').register(syncMigrations.enable);

    // Database migrations
    balerion.db.migrations.providers.internal.register(discardDocumentDrafts);
  },
});
