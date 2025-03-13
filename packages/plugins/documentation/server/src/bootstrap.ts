import type { Core } from '@balerion/types';

import { getService } from './utils';

// Add permissions
const RBAC_ACTIONS = [
  {
    section: 'plugins',
    displayName: 'Access the Documentation',
    uid: 'read',
    pluginName: 'documentation',
  },
  {
    section: 'plugins',
    displayName: 'Update and delete',
    uid: 'settings.update',
    pluginName: 'documentation',
  },
  {
    section: 'plugins',
    displayName: 'Regenerate',
    uid: 'settings.regenerate',
    pluginName: 'documentation',
  },
  {
    section: 'settings',
    displayName: 'Access the documentation settings page',
    uid: 'settings.read',
    pluginName: 'documentation',
    category: 'documentation',
  },
];

export async function bootstrap({ balerion }: { balerion: Core.Balerion }) {
  await balerion.service('admin::permission').actionProvider.registerMany(RBAC_ACTIONS);

  const pluginStore = balerion.store!({
    environment: '',
    type: 'plugin',
    name: 'documentation',
  });

  const config = await pluginStore.get({ key: 'config' });

  if (!config) {
    pluginStore.set({ key: 'config', value: { restrictedAccess: false } });
  }
  if (process.env.NODE_ENV !== 'production') {
    await getService('documentation').generateFullDoc();
  }
}
