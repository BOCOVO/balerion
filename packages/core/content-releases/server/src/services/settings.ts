import type { Core } from '@balerion/types';

import type { Settings } from '../../../shared/contracts/settings';

const DEFAULT_SETTINGS = {
  defaultTimezone: null,
} satisfies Settings;

const createSettingsService = ({ balerion }: { balerion: Core.Balerion }) => {
  const getStore = async () => balerion.store({ type: 'core', name: 'content-releases' });

  return {
    async update({ settings }: { settings: Settings }): Promise<Settings> {
      const store = await getStore();
      store.set({ key: 'settings', value: settings });
      return settings;
    },
    async find(): Promise<Settings> {
      const store = await getStore();
      const settings = (await store.get({ key: 'settings' })) as Settings | undefined;

      return {
        ...DEFAULT_SETTINGS,
        ...(settings || {}),
      };
    },
  };
};

export type SettingsService = ReturnType<typeof createSettingsService>;

export default createSettingsService;
