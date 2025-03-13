import { defineProvider } from './provider';
import loadAdmin from '../loaders/admin';

export default defineProvider({
  init(balerion) {
    // eslint-disable-next-line node/no-missing-require
    balerion.add('admin', () => require('@balerion/admin/balerion-server'));
  },

  async register(balerion) {
    await loadAdmin(balerion);

    await balerion.get('admin')?.register({ balerion });
  },

  async bootstrap(balerion) {
    await balerion.get('admin')?.bootstrap({ balerion });
  },

  async destroy(balerion) {
    await balerion.get('admin')?.destroy({ balerion });
  },
});
