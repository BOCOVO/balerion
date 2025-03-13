import type { Core } from '@balerion/types';

export default async ({ balerion }: { balerion: Core.Balerion }) => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'content-type-builder',
    },
  ];

  await balerion.service('admin::permission').actionProvider.registerMany(actions);
};
