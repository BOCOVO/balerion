import type { Core } from '@balerion/types';

const getProviderName = () => balerion.config.get('plugin::upload.provider', 'local');
const isProviderPrivate = async () => balerion.plugin('upload').provider.isPrivate();

export default ({ balerion }: { balerion: Core.Balerion }) => ({
  async sendUploadPluginMetrics() {
    const uploadProvider = getProviderName();
    const privateProvider = await isProviderPrivate();

    balerion.telemetry.send('didInitializePluginUpload', {
      groupProperties: {
        uploadProvider,
        privateProvider,
      },
    });
  },
});
