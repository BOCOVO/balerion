import { defineProvider } from './provider';
import { createWebhookStore, webhookModel } from '../services/webhook-store';
import createWebhookRunner from '../services/webhook-runner';

export default defineProvider({
  init(balerion) {
    balerion.get('models').add(webhookModel);

    balerion.add('webhookStore', () => createWebhookStore({ db: balerion.db }));
    balerion.add('webhookRunner', () =>
      createWebhookRunner({
        eventHub: balerion.eventHub,
        logger: balerion.log,
        configuration: balerion.config.get('server.webhooks', {}),
        fetch: balerion.fetch,
      })
    );
  },
  async bootstrap(balerion) {
    const webhooks = await balerion.get('webhookStore').findWebhooks();
    if (!webhooks) {
      return;
    }

    for (const webhook of webhooks) {
      balerion.get('webhookRunner').add(webhook);
    }
  },
});
