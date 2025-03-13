import { defineProvider } from './provider';
import createCronService from '../services/cron';

export default defineProvider({
  init(balerion) {
    balerion.add('cron', () => createCronService());
  },
  async bootstrap(balerion) {
    if (balerion.config.get('server.cron.enabled', true)) {
      const cronTasks = balerion.config.get('server.cron.tasks', {});
      balerion.get('cron').add(cronTasks);
    }

    balerion.get('cron').start();
  },
  async destroy(balerion) {
    balerion.get('cron').destroy();
  },
});
