import type { Core } from '@balerion/types';
import registerAdminPanelRoute from './routes/serve-admin-panel';
import adminAuthStrategy from './strategies/admin';
import apiTokenAuthStrategy from './strategies/api-token';

export default ({ balerion }: { balerion: Core.Balerion }) => {
  const passportMiddleware = balerion.service('admin::passport').init();

  balerion.server.api('admin').use(passportMiddleware);
  balerion.get('auth').register('admin', adminAuthStrategy);
  balerion.get('auth').register('content-api', apiTokenAuthStrategy);

  if (balerion.config.get('admin.serveAdminPanel')) {
    registerAdminPanelRoute({ balerion });
  }
};
